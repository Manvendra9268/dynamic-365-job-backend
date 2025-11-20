const { asyncHandler } = require("../utils/asyncHandler");
const dotenv = require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const logger = require("../utils/logger");
const PaymentTransaction = require("../models/PaymentTransaction");
const User = require("../models/User");
const { linkPaymentToUser } = require("../services/stripeService");

const handleStripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    logger.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ received: false, error: err.message });
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(event.data.object);
      break;

    case "payment_intent.payment_failed":
      await handlePaymentIntentFailed(event.data.object);
      break;

    case "charge.refunded":
      await handleChargeRefunded(event.data.object);
      break;

    default:
      logger.info(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

const handlePaymentIntentSucceeded = async (paymentIntent) => {
  try {
    logger.info(
      `Payment intent succeeded: ${paymentIntent.id} for amount: ${paymentIntent.amount / 100}`
    );

    // Update payment transaction status
    const transaction = await PaymentTransaction.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      { status: "succeeded" },
      { new: true }
    );

    if (!transaction) {
      logger.warn(`No transaction found for payment intent: ${paymentIntent.id}`);
      return;
    }

    // Send confirmation email (optional)
    logger.info(`Payment successful for transaction: ${transaction._id}`);
  } catch (error) {
    logger.error("Error handling payment intent succeeded:", error);
  }
};

const handlePaymentIntentFailed = async (paymentIntent) => {
  try {
    logger.error(
      `Payment intent failed: ${paymentIntent.id} - ${paymentIntent.last_payment_error?.message}`
    );

    // Update payment transaction status
    await PaymentTransaction.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      { status: "failed" },
      { new: true }
    );

    logger.info(`Payment failure recorded for intent: ${paymentIntent.id}`);
  } catch (error) {
    logger.error("Error handling payment intent failed:", error);
  }
};

const handleChargeRefunded = async (charge) => {
  try {
    logger.info(`Charge refunded: ${charge.id} for amount: ${charge.amount / 100}`);

    // Update payment transaction status
    const transaction = await PaymentTransaction.findOne({
      stripePaymentIntentId: charge.payment_intent,
    });

    if (transaction) {
      transaction.status = "refunded";
      await transaction.save();
      logger.info(`Refund recorded for transaction: ${transaction._id}`);
    }
  } catch (error) {
    logger.error("Error handling charge refunded:", error);
  }
};

module.exports = {
  handleStripeWebhook,
};
