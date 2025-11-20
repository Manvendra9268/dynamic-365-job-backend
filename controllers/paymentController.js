const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { asyncHandler } = require("../utils/asyncHandler");
const Subscription = require("../models/Subscription");
const CheckoutSession = require("../models/CheckoutSession");
const User = require("../models/User");
const UserSubscription = require("../models/userSubscription");
const logger = require("../utils/logger");
const stripeService = require("../services/stripeService");
const { finalizeCheckoutSession, getCheckoutStatusPayload } = require("../services/checkoutService");

const currency = process.env.STRIPE_CURRENCY || "usd";
const successUrl = `${process.env.FRONTEND_BASE_URL || "http://localhost:8080"}/payment-status?session_id={CHECKOUT_SESSION_ID}`;
const cancelUrl = `${process.env.FRONTEND_BASE_URL || "http://localhost:8080"}/payment-status?status=cancelled`;

const buildLineItems = ({ plan, amountInCents, isSubscription }) => {
  const priceData = {
    currency,
    unit_amount: amountInCents,
    product_data: {
      name: plan.name,
      description: plan.description || "Dynamics 365 Plan",
    },
  };

  if (isSubscription) {
    priceData.recurring = {
      interval: "month",
      interval_count: 1,
    };
  }

  return [
    {
      price_data: priceData,
      quantity: 1,
    },
  ];
};

const determineAmount = (value, fallback) => {
  const numeric = Number(value);
  if (!numeric || numeric <= 0) {
    return Number(fallback);
  }
  return numeric;
};

const determineSubscriptionFlag = (isSubscriptionFlag, planDoc) => {
  if (typeof isSubscriptionFlag === "boolean") return isSubscriptionFlag;
  if (planDoc && typeof planDoc.period === "number") {
    return planDoc.period >= 28;
  }
  return false;
};

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
    planSnapshot: {
      name: plan.name,
      price: plan.price,
      totalCredits: plan.totalCredits,
      period: plan.period,
    },
    finalPrice: payload.finalPrice,
    discountApplied: payload.discountApplied || 0,
    promoCode: payload.promoCode || null,
    currency,
    isSubscription,
    userData: payload.userData || {},
    jobData: jobData || {},
    nextPath,
    metadata: payload.metadata || {},
  });
};

const createPublicCheckoutSession = asyncHandler(async (req, res) => {
  const { planId, user, promoCode, finalPrice, discountApplied, isSubscription } = req.body || {};

  if (!planId || !mongoose.Types.ObjectId.isValid(planId)) {
    return res.status(400).json({ message: "Valid planId is required" });
  }

  const plan = await Subscription.findById(planId);
  if (!plan) {
    return res.status(404).json({ message: "Plan not found" });
  }

  if (!user || !user.email || !user.password || !user.phoneNumber || !user.fullName) {
    return res.status(400).json({ message: "Missing required user fields" });
  }

  const existingUser = await User.findOne({ email: user.email.toLowerCase() });
  if (existingUser) {
    return res
      .status(409)
      .json({ message: "User already exists with this email. Please login instead." });
  }

  const resolvedIsSubscription = determineSubscriptionFlag(isSubscription, plan);
  const resolvedAmount = determineAmount(finalPrice, plan.price);
  const amountInCents = Math.round(resolvedAmount * 100);
  if (amountInCents <= 0) {
    return res.status(400).json({ message: "Amount must be greater than 0" });
  }

  const metadata = {
    flowType: "public_registration",
    planId: plan._id.toString(),
  };

  const session = await stripeService.createCheckoutSession({
    customerEmail: user.email,
    mode: resolvedIsSubscription ? "subscription" : "payment",
    lineItems: buildLineItems({ plan, amountInCents, isSubscription: resolvedIsSubscription }),
    successUrl,
    cancelUrl,
    metadata,
  });

  const { password, ...restUser } = user;
  const passwordHash = await bcrypt.hash(password, 10);

  await createCheckoutRecord({
    session,
    plan,
    flowType: "public_registration",
    isSubscription: resolvedIsSubscription,
    nextPath: "/dashboard",
    payload: {
      finalPrice: resolvedAmount,
      discountApplied,
      promoCode,
      userData: {
        ...restUser,
        passwordHash,
      },
      metadata,
    },
  });

  return res.status(201).json({
    message: "Stripe checkout session created",
    data: { sessionId: session.id, url: session.url },
  });
});

const createAuthenticatedCheckoutSession = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const {
    planId,
    promoCode,
    finalPrice,
    discountApplied,
    isSubscription,
    jobPayload = {},
  } = req.body || {};

  if (!planId || !mongoose.Types.ObjectId.isValid(planId)) {
    return res.status(400).json({ message: "Valid planId is required" });
  }

  const plan = await Subscription.findById(planId);
  if (!plan) {
    return res.status(404).json({ message: "Plan not found" });
  }

  const userDoc = await User.findById(userId);
  if (!userDoc) {
    return res.status(404).json({ message: "User not found" });
  }

  const resolvedIsSubscription = determineSubscriptionFlag(isSubscription, plan);
  const resolvedAmount = determineAmount(finalPrice, plan.price);
  const amountInCents = Math.round(resolvedAmount * 100);
  if (amountInCents <= 0) {
    return res.status(400).json({ message: "Amount must be greater than 0" });
  }

  const metadata = {
    flowType: "job_subscription",
    planId: plan._id.toString(),
    userId: userId.toString(),
  };

  const session = await stripeService.createCheckoutSession({
    customerEmail: userDoc.email,
    mode: resolvedIsSubscription ? "subscription" : "payment",
    lineItems: buildLineItems({ plan, amountInCents, isSubscription: resolvedIsSubscription }),
    successUrl,
    cancelUrl,
    metadata,
  });

  await createCheckoutRecord({
    session,
    plan,
    flowType: "job_subscription",
    isSubscription: resolvedIsSubscription,
    jobData: jobPayload,
    nextPath: "/dashboard",
    payload: {
      finalPrice: resolvedAmount,
      discountApplied,
      promoCode,
      metadata,
    },
  });

  return res.status(201).json({
    message: "Stripe checkout session created",
    data: { sessionId: session.id, url: session.url },
  });
});

const getCheckoutStatus = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  if (!sessionId) {
    return res.status(400).json({ message: "sessionId is required" });
  }

  const checkoutRecord = await CheckoutSession.findOne({ sessionId });
  if (!checkoutRecord) {
    return res.status(404).json({ message: "Checkout session not found" });
  }

  if (checkoutRecord.status !== "completed") {
    try {
      const stripeSession = await stripeService.retrieveCheckoutSession(sessionId);
      if (stripeSession.payment_status === "paid") {
        await finalizeCheckoutSession({
          checkoutRecord,
          stripeSession,
        });
      }
    } catch (error) {
      logger.error("Unable to finalize checkout session on status poll", {
        sessionId,
        error: error.message,
      });
    }
  }

  const payload = await getCheckoutStatusPayload(sessionId);
  return res.status(200).json({ message: "Checkout status fetched", data: payload });
});

const cancelSubscription = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { subscriptionId } = req.body || {};
  if (!subscriptionId) {
    return res.status(400).json({ message: "subscriptionId is required" });
  }

  const record = await UserSubscription.findOne({
    _id: subscriptionId,
    userId,
  });

  if (!record) {
    return res.status(404).json({ message: "Subscription not found" });
  }

  if (!record.stripeSubscriptionId) {
    return res
      .status(400)
      .json({ message: "Stripe subscription id missing for this record" });
  }

  await stripeService.cancelSubscription(record.stripeSubscriptionId);
  record.status = "cancelled";
  record.paymentStatus = "cancelled";
  record.endDate = new Date();
  await record.save();

  return res.status(200).json({ message: "Subscription cancelled successfully" });
});

module.exports = {
  createPublicCheckoutSession,
  createAuthenticatedCheckoutSession,
  getCheckoutStatus,
  cancelSubscription,
};

