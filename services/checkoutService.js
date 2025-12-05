const jwt = require("jsonwebtoken");
const Role = require("../models/Role");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const PromoCode = require("../models/promoCode");
const Payment = require("../models/Payment");
const CheckoutSession = require("../models/CheckoutSession");
const UserSubscription = require("../models/userSubscription");
const jobRequestService = require("./jobRequestService");
const stripeService = require("./stripeService");
const promoCodeService = require("./promoCodeService");
const logger = require("../utils/logger");

/* -------------------------------------------------------
    BUILD AUTH TOKEN (public registration)
-------------------------------------------------------- */
const buildAuthToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: { _id:user.role,roleName: "employer" },
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/* -------------------------------------------------------
    FINALIZE CHECKOUT — Webhook + Polling
-------------------------------------------------------- */
const finalizeCheckoutSession = async ({ checkoutRecord, stripeSession }) => {
  if (!checkoutRecord) throw new Error("Checkout session record not found");

  // Already done
  if (checkoutRecord.status === "completed") return checkoutRecord;

  const plan = await Subscription.findById(checkoutRecord.planId);
  if (!plan) throw new Error("Subscription plan not found");

  let userId = checkoutRecord.userId;
  let authToken = checkoutRecord.authToken;
  let createdUserProfile = checkoutRecord.userProfile || {};

  /* ---------------------------------------------------
      NORMALIZE ALL STRIPE IDs (Fix Cast Errors)
  ---------------------------------------------------- */
  const normalizedSubscriptionId =
    typeof stripeSession.subscription === "string"
      ? stripeSession.subscription
      : stripeSession.subscription?.id || null;

  const normalizedCustomerId =
    typeof stripeSession.customer === "string"
      ? stripeSession.customer
      : stripeSession.customer?.id || null;

  const normalizedPaymentIntentId =
    typeof stripeSession.payment_intent === "string"
      ? stripeSession.payment_intent
      : stripeSession.payment_intent?.id || null;

  /* ---------------------------------------------------
      PUBLIC REGISTRATION FLOW → Create User
  ---------------------------------------------------- */
  if (checkoutRecord.flowType === "public_registration" && !userId) {
    const employerRole = await Role.findOne({ roleName: "employer" });
    if (!employerRole) throw new Error("Employer role not configured");

    const newUser = new User({
      fullName: checkoutRecord.userData.fullName,
      email: checkoutRecord.userData.email,
      password: checkoutRecord.userData.passwordHash,
      role: employerRole._id,
      organizationName: checkoutRecord.userData.organizationName,
      organizationSize: checkoutRecord.userData.organizationSize,
      founded: checkoutRecord.userData.founded,
      headquarters: checkoutRecord.userData.headquarters,
      organizationLinkedIn: checkoutRecord.userData.organizationLinkedIn,
      organizationWebsite: checkoutRecord.userData.organizationWebsite,
      phoneNumber: checkoutRecord.userData.phoneNumber,
      industry: checkoutRecord.userData.industry,
    });

    await newUser.save();
    userId = newUser._id;

    createdUserProfile = {
      name: newUser.fullName,
      organizationName: newUser.organizationName,
      email: newUser.email,
      phoneNumber: newUser.phoneNumber,
    };

    authToken = buildAuthToken(newUser);
  }

  if (!userId) throw new Error("User could not be resolved for checkout");

  /* ---------------------------------------------------
      SET SUBSCRIPTION WINDOW
  ---------------------------------------------------- */
  const startDate = new Date();
  let endDate = null;

  if (plan.period) {
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.period);
  }

  /* ---------------------------------------------------
      PROMO CODE HANDLING - Use webhook-based tracking
  ---------------------------------------------------- */
  const promo =
    checkoutRecord.promoCode &&
    (await PromoCode.findOne({ code: checkoutRecord.promoCode }));

  // Note: We'll increment usage via webhook (incrementPromoUsage)
  // to handle payment completion properly (not abandoned sessions)

  /* ---------------------------------------------------
      FIND USER SUBSCRIPTION MAPPING
  ---------------------------------------------------- */
  let mapping = await UserSubscription.findOne({ userId });

  /* ================================
      OPTION A — Replace OLD Subscription
     ================================ */
  if (mapping) {
    const oldStripeSubId = mapping.stripeSubscriptionId;

    if (
      oldStripeSubId &&
      normalizedSubscriptionId &&
      oldStripeSubId !== normalizedSubscriptionId
    ) {
      try {
        await stripeService.cancelSubscription(oldStripeSubId);
        logger.info("Old Stripe subscription cancelled", {
          oldSubscriptionId: oldStripeSubId,
        });
      } catch (err) {
        logger.error("Failed to cancel old Stripe subscription", {
          oldSubscriptionId: oldStripeSubId,
          error: err.message,
        });
      }
    }
  }

  /* ---------------------------------------------------
      CREATE OR UPDATE MAPPING
  ---------------------------------------------------- */
  if (!mapping) {
    mapping = await UserSubscription.create({
      userId,
      subscriptionId: plan._id,
      promoId: promo?._id || null,
      startDate,
      endDate,
      totalCredits: plan.totalCredits,
      usedCredits: 0,
      finalPrice: checkoutRecord.finalPrice,
      discountApplied: checkoutRecord.discountApplied,
      stripeCustomerId: normalizedCustomerId,
      stripeSubscriptionId: normalizedSubscriptionId,
      status: "active",
      paymentStatus: "paid",
    });
  } else {
    mapping.subscriptionId = plan._id;
    mapping.promoId = promo?._id || mapping.promoId;
    mapping.startDate = startDate;
    mapping.endDate = endDate;
    mapping.finalPrice = checkoutRecord.finalPrice;
    mapping.discountApplied = checkoutRecord.discountApplied;
    mapping.paymentStatus = "paid";
    mapping.status = "active";

    if (normalizedCustomerId) mapping.stripeCustomerId = normalizedCustomerId;

    if (normalizedSubscriptionId)
      mapping.stripeSubscriptionId = normalizedSubscriptionId;

    // Accumulate credits
    mapping.totalCredits = (mapping.totalCredits || 0) + plan.totalCredits;

    await mapping.save();
  }

  /* ---------------------------------------------------
      JOB POSTING
  ---------------------------------------------------- */
  if (
    checkoutRecord.flowType === "job_subscription" &&
    checkoutRecord.jobData &&
    Object.keys(checkoutRecord.jobData).length > 0
  ) {
    const jobPayload = {
      ...checkoutRecord.jobData,
      employerId: userId,
    };
    await jobRequestService.createJobRequest(jobPayload);
  }

  /* ---------------------------------------------------
      CREATE PAYMENT RECORD (with promo code tracking)
  ---------------------------------------------------- */
  const originalAmount =
    promo && checkoutRecord.discountApplied
      ? (checkoutRecord.finalPrice || plan.price) +
        checkoutRecord.discountApplied
      : null;

  await Payment.create({
    userId,
    planId: plan._id,
    checkoutSessionId: checkoutRecord.sessionId,
    stripePaymentIntentId: normalizedPaymentIntentId,
    stripeCustomerId: normalizedCustomerId,
    stripeSubscriptionId: normalizedSubscriptionId,
    amount: checkoutRecord.finalPrice ?? plan.price,
    currency: checkoutRecord.currency,
    status: "paid",
    paymentType: checkoutRecord.isSubscription ? "subscription" : "one_time",
    metadata: checkoutRecord.metadata,
    // Promo code tracking
    promoCode: checkoutRecord.promoCode || null,
    promoCodeId: promo?._id || null,
    stripePromotionCodeId: checkoutRecord.stripePromotionCodeId || null,
    discountApplied: checkoutRecord.discountApplied || 0,
    originalAmount,
  });

  // Increment promo code usage after payment is confirmed
  if (promo) {
    try {
      await promoCodeService.incrementPromoUsage(promo._id.toString());
      logger.info("Promo code usage incremented", {
        promoCode: promo.code,
        totalUsed: promo.totalUsed + 1,
      });
    } catch (err) {
      logger.error("Failed to increment promo code usage", {
        error: err.message,
        promoCode: promo.code,
      });
      // Don't fail the checkout if usage increment fails
    }
  }

  /* ---------------------------------------------------
      MARK CHECKOUT COMPLETED
  ---------------------------------------------------- */
  checkoutRecord.status = "completed";
  checkoutRecord.completedAt = new Date();
  checkoutRecord.userId = userId;
  checkoutRecord.userProfile = createdUserProfile;
  checkoutRecord.authToken = authToken;
  checkoutRecord.stripeCustomerId = normalizedCustomerId;
  checkoutRecord.stripeSubscriptionId = normalizedSubscriptionId;
  checkoutRecord.stripePaymentIntentId = normalizedPaymentIntentId;
  checkoutRecord.metadata.payment_status = stripeSession.payment_status;

  await checkoutRecord.save();

  logger.info("Checkout session finalized", {
    sessionId: checkoutRecord.sessionId,
    userId,
  });

  return checkoutRecord;
};

/* -------------------------------------------------------
    OUTPUT FOR FRONTEND
-------------------------------------------------------- */
const getCheckoutStatusPayload = async (sessionId) => {
  const record = await CheckoutSession.findOne({ sessionId });
  if (!record) throw new Error("Checkout session not found");

  return {
    status: record.status,
    flowType: record.flowType,
    authToken: record.authToken,
    nextPath: record.nextPath || "/dashboard",
    userProfile: record.userProfile,
    sessionId: record.sessionId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
};

module.exports = {
  finalizeCheckoutSession,
  getCheckoutStatusPayload,
};
