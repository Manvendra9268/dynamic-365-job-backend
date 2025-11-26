const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },
    checkoutSessionId: {
      type: String,
    },
    stripePaymentIntentId: {
      type: String,
    },
    stripeCustomerId: {
      type: String,
    },
    stripeSubscriptionId: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "usd",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "cancelled"],
      default: "pending",
    },
    paymentType: {
      type: String,
      enum: ["one_time", "subscription"],
    },
    metadata: {
      type: Object,
      default: {},
    },
    // Promo code tracking
    promoCode: {
      type: String,
      default: null,
    },
    promoCodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PromoCode",
      default: null,
    },
    stripePromotionCodeId: {
      type: String,
      default: null,
    },
    discountApplied: {
      type: Number,
      default: 0,
    },
    originalAmount: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
