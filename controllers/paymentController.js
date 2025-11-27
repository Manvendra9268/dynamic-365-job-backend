const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { asyncHandler } = require("../utils/asyncHandler");
const UserSubscription = require("../models/userSubscription")
const Subscription = require("../models/Subscription");
const CheckoutSession = require("../models/CheckoutSession");
const User = require("../models/User");
const logger = require("../utils/logger");

const stripeService = require("../services/stripeService");
const PromoCode = require("../models/promoCode");
const {
  finalizeCheckoutSession,
  getCheckoutStatusPayload,
} = require("../services/checkoutService");

const currency = process.env.STRIPE_CURRENCY || "usd";
const FRONTEND = process.env.FRONTEND_BASE_URL || "http://localhost:8080";

const successUrl = `${FRONTEND}/payment-status?session_id={CHECKOUT_SESSION_ID}`;
const cancelUrl = `${FRONTEND}/payment-status?status=cancelled`;

/* -------------------------------------------------------
     BUILD LINE ITEMS (ONLY STRIPE PRICE ID)
-------------------------------------------------------- */
const buildLineItems = (plan) => {
  if (!plan.stripePriceId) {
    throw new Error("Plan missing stripePriceId. Please configure it.");
  }

  return [{ price: plan.stripePriceId, quantity: 1 }];
};

/* -------------------------------------------------------
     DETERMINE IF PLAN IS A SUBSCRIPTION
-------------------------------------------------------- */
const resolveSubscriptionFlag = (flag, plan) => {
  if (typeof flag === "boolean") return flag;
  return plan.period >= 28; // monthly → subscription
};

/* -------------------------------------------------------
     CREATE CHECKOUT RECORD IN DB
-------------------------------------------------------- */
const createCheckoutRecord = async ({
  session,
  plan,
  flowType,
  payload,
  isSubscription,
  jobData,
  nextPath,
}) => {
  return CheckoutSession.create({
    sessionId: session.id,
    flowType,
    planId: plan._id,
    userId: payload.userId || null,
    planSnapshot: {
      name: plan.name,
      price: plan.price,
      totalCredits: plan.totalCredits,
      period: plan.period,
    },

    // For UI display only (Stripe decides final amount!)
    finalPrice: payload.finalPrice ?? plan.price,
    discountApplied: payload.discountApplied || 0,
    promoCode: payload.promoCode || null,
    stripePromotionCodeId: payload.stripePromotionCodeId || null,
    currency,
    isSubscription,

    userData: payload.userData || {},
    jobData: jobData || {},
    nextPath,
    metadata: payload.metadata || {},
  });
};

/* -------------------------------------------------------
     PUBLIC CHECKOUT (USER NOT LOGGED IN)
-------------------------------------------------------- */
const createPublicCheckoutSession = asyncHandler(async (req, res) => {
  const { planId, user, promoCode, finalPrice, discountApplied, isSubscription } = req.body;

  if (!planId || !mongoose.Types.ObjectId.isValid(planId)) {
    return res.status(400).json({ message: "Invalid planId" });
  }

  const plan = await Subscription.findById(planId);
  console.log("plan", plan)
  if (!plan) return res.status(404).json({ message: "Plan not found" });

  if (!user || !user.email || !user.password || !user.fullName || !user.phoneNumber) {
    return res.status(400).json({ message: "Missing required user fields" });
  }

  // If email exists → block public registration
  if (await User.findOne({ email: user.email })) {
    return res.status(409).json({
      message: "User already exists with this email. Please login.",
    });
  }

  const isSub = resolveSubscriptionFlag(isSubscription, plan);

  // **** STRIPE — no amount passed, only PRICE ID ***
  const metadata = {
    flowType: "public_registration",
    planId: plan._id.toString(),
  };

  // Check if a promo code was provided and if it maps to a Stripe promotion
  let discounts = undefined;
  let stripePromotionCodeId = undefined;
  if (promoCode) {
    const promoDoc = await PromoCode.findOne({ code: promoCode });
    if (promoDoc && promoDoc.stripePromotionCodeId) {
      stripePromotionCodeId = promoDoc.stripePromotionCodeId;
      discounts = [{ promotion_code: stripePromotionCodeId }];
    }
  }

  const session = await stripeService.createCheckoutSession({
    customerEmail: user.email,
    mode: isSub ? "subscription" : "payment",
    lineItems: buildLineItems(plan),
    successUrl,
    cancelUrl,
    metadata,
    discounts,
  });

  // Hash user password before storing temporarily
  const passwordHash = user.password;
  const userData = { ...user, passwordHash };
  delete userData.password;

  await createCheckoutRecord({
    session,
    plan,
    flowType: "public_registration",
    isSubscription: isSub,
    nextPath: "/dashboard",
    jobData: {},
    payload: {
      finalPrice,
      discountApplied,
      promoCode,
      stripePromotionCodeId,
      userData,
      metadata,
    },
  });

  return res.status(201).json({
    message: "Stripe checkout session created",
    data: {
      sessionId: session.id,
      url: session.url,
    },
  });
});

/* -------------------------------------------------------
     AUTHENTICATED CHECKOUT (LOGGED IN EMPLOYER)
-------------------------------------------------------- */
const createAuthenticatedCheckoutSession = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { planId, promoCode, finalPrice, discountApplied, isSubscription, jobPayload = {} } =
    req.body;

  if (!planId || !mongoose.Types.ObjectId.isValid(planId)) {
    return res.status(400).json({ message: "Invalid planId" });
  }

  const plan = await Subscription.findById(planId);
  if (!plan) return res.status(404).json({ message: "Plan not found" });

  const userDoc = await User.findById(userId);
  if (!userDoc) return res.status(404).json({ message: "User not found" });

  const isSub = resolveSubscriptionFlag(isSubscription, plan);

  const metadata = {
    flowType: "job_subscription",
    planId: plan._id.toString(),
    userId: userId.toString(),
  };

  // If the frontend provided a promoCode, try to find Stripe promotion id
  let discounts = undefined;
  let stripePromotionCodeId = undefined;
  if (promoCode) {
    const promoDoc = await PromoCode.findOne({ code: promoCode });
    if (promoDoc && promoDoc.stripePromotionCodeId) {
      stripePromotionCodeId = promoDoc.stripePromotionCodeId;
      discounts = [{ promotion_code: stripePromotionCodeId }];
    }
  }

  const session = await stripeService.createCheckoutSession({
    customerEmail: userDoc.email,
    mode: isSub ? "subscription" : "payment",
    lineItems: buildLineItems(plan),
    successUrl,
    cancelUrl,
    metadata,
    discounts,
  });

  await createCheckoutRecord({
    session,
    plan,
    flowType: "job_subscription",
    isSubscription: isSub,
    nextPath: "/dashboard",
    jobData: jobPayload,
    payload: {
      finalPrice,
      discountApplied,
      promoCode,
      stripePromotionCodeId,
      metadata,
      userId,
    },
  });

  return res.status(201).json({
    message: "Stripe checkout session created",
    data: {
      sessionId: session.id,
      url: session.url,
    },
  });
});

/* -------------------------------------------------------
     GET CHECKOUT STATUS (POLLED FROM FRONTEND)
-------------------------------------------------------- */
const getCheckoutStatus = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  if (!sessionId) return res.status(400).json({ message: "sessionId is required" });

  const checkoutRecord = await CheckoutSession.findOne({ sessionId });
  if (!checkoutRecord) {
    return res.status(404).json({ message: "Checkout session not found" });
  }

  // If Stripe completed but DB not updated yet → finalize now
  if (checkoutRecord.status !== "completed") {
    try {
      const stripeSession = await stripeService.retrieveCheckoutSession(sessionId);
      if (stripeSession.payment_status === "paid") {
        await finalizeCheckoutSession({ checkoutRecord, stripeSession });
      }
    } catch (err) {
      logger.error("Status poll finalization failed", {
        sessionId,
        error: err.message,
      });
    }
  }

  const payload = await getCheckoutStatusPayload(sessionId);
  return res.status(200).json({ message: "Checkout status fetched", data: payload });
});

/* -------------------------------------------------------
     CANCEL SUBSCRIPTION FROM USER DASHBOARD
-------------------------------------------------------- */
const cancelSubscription = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { subscriptionId } = req.body;
  if (!subscriptionId) {
    return res.status(400).json({ message: "subscriptionId required" });
  }

  const record = await UserSubscription.findOne({ _id: subscriptionId, userId });
  if (!record) return res.status(404).json({ message: "Subscription not found" });

  if (!record.stripeSubscriptionId) {
    return res.status(400).json({ message: "Stripe subscriptionId missing" });
  }

  await stripeService.cancelSubscription(record.stripeSubscriptionId);

  record.status = "cancelled";
  record.paymentStatus = "cancelled";
  record.endDate = new Date();
  await record.save();

  return res.status(200).json({ message: "Subscription cancelled" });
});

module.exports = {
  createPublicCheckoutSession,
  createAuthenticatedCheckoutSession,
  getCheckoutStatus,
  cancelSubscription,
};
