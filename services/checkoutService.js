const jwt = require("jsonwebtoken");
const Role = require("../models/Role");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const PromoCode = require("../models/promoCode");
const Payment = require("../models/Payment");
const CheckoutSession = require("../models/CheckoutSession");
const logger = require("../utils/logger");
const { createMapping } = require("./userService");
const jobRequestService = require("./jobRequestService");

const buildAuthToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not configured");
  }
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: { roleName: "employer" },
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const finalizeCheckoutSession = async ({ checkoutRecord, stripeSession }) => {
  if (!checkoutRecord) {
    throw new Error("Checkout session record not found");
  }

  if (checkoutRecord.status === "completed") {
    return checkoutRecord;
  }

  const plan = await Subscription.findById(checkoutRecord.planId);
  if (!plan) {
    throw new Error("Subscription plan not found for checkout record");
  }

  let userId = checkoutRecord.userId;
  let authToken = checkoutRecord.authToken;
  let createdUserProfile = checkoutRecord.userProfile || {};

  if (checkoutRecord.flowType === "public_registration" && !userId) {
    const employerRole = await Role.findOne({ roleName: "employer" });
    if (!employerRole) {
      throw new Error("Employer role is not configured in the system");
    }

    const userPayload = {
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
    };

    const newUser = new User(userPayload);
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

  if (!userId) {
    throw new Error("User could not be resolved for checkout session");
  }

  const startDate = new Date();
  let endDate = null;
  if (plan.period) {
    endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.period);
  }

  const promo =
    checkoutRecord.promoCode &&
    (await PromoCode.findOne({ code: checkoutRecord.promoCode }));

  const mapping = await createMapping({
    userId,
    subscriptionId: plan._id,
    promoId: promo?._id,
    finalPrice: checkoutRecord.finalPrice ?? plan.price,
    discountApplied: checkoutRecord.discountApplied,
    startDate,
    endDate,
    totalCredits: plan.totalCredits,
    usedCredits: 0,
    stripeCustomerId: stripeSession.customer,
    stripeSubscriptionId: stripeSession.subscription,
  });

  if (promo) {
    await PromoCode.findByIdAndUpdate(promo._id, {
      $inc: { totalUsed: 1 },
    });
  }

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

  const paymentIntentId =
    typeof stripeSession.payment_intent === "string"
      ? stripeSession.payment_intent
      : stripeSession.payment_intent?.id;

  await Payment.create({
    userId,
    planId: plan._id,
    checkoutSessionId: checkoutRecord.sessionId,
    stripePaymentIntentId: paymentIntentId || null,
    stripeCustomerId: stripeSession.customer,
    stripeSubscriptionId: stripeSession.subscription,
    amount: checkoutRecord.finalPrice ?? plan.price,
    currency: checkoutRecord.currency,
    status: "paid",
    paymentType: checkoutRecord.isSubscription ? "subscription" : "one_time",
    metadata: checkoutRecord.metadata,
  });

  checkoutRecord.status = "completed";
  checkoutRecord.completedAt = new Date();
  checkoutRecord.userId = userId;
  checkoutRecord.userProfile = createdUserProfile;
  checkoutRecord.authToken = authToken;
  checkoutRecord.stripeCustomerId = stripeSession.customer;
  checkoutRecord.stripeSubscriptionId = stripeSession.subscription;
  checkoutRecord.stripePaymentIntentId = stripeSession.payment_intent;
  checkoutRecord.metadata = {
    ...checkoutRecord.metadata,
    payment_status: stripeSession.payment_status,
  };
  await checkoutRecord.save();

  if (mapping) {
    mapping.paymentStatus = "paid";
    mapping.status = "active";
    if (stripeSession.customer) {
      mapping.stripeCustomerId = stripeSession.customer;
    }
    if (stripeSession.subscription) {
      mapping.stripeSubscriptionId = stripeSession.subscription;
    }
    await mapping.save();
  }

  logger.info("Checkout session finalized", {
    sessionId: checkoutRecord.sessionId,
    userId,
  });

  return checkoutRecord;
};

const getCheckoutStatusPayload = async (sessionId) => {
  const record = await CheckoutSession.findOne({ sessionId });
  if (!record) {
    throw new Error("Checkout session not found");
  }

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

