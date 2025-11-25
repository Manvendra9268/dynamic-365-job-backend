const mongoose = require("mongoose");

const checkoutSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    flowType: {
      type: String,
      enum: ["public_registration", "job_subscription"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
    },
    planSnapshot: {
      type: Object,
      default: {},
    },
    promoCode: {
      type: String,
      default: null,
    },
    finalPrice: {
      type: Number,
    },
    discountApplied: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "usd",
    },
    isSubscription: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userData: {
      type: Object,
      default: {},
    },
    userProfile: {
      type: Object,
      default: {},
    },
    jobData: {
      type: Object,
      default: {},
    },
    stripeCustomerId: {
      type: String,
    },
    stripeSubscriptionId: {
      type: String,
    },
    stripePaymentIntentId: {
      type: String,
    },
    completedAt: {
      type: Date,
    },
    authToken: {
      type: String,
    },
    nextPath: {
      type: String,
      default: "/dashboard",
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CheckoutSession", checkoutSessionSchema);

