const dotenv = require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const PaymentTransaction = require("../models/PaymentTransaction");
const logger = require("../utils/logger");

// Create Payment Intent
const createPaymentIntent = async ({
  amount,
  email,
  fullName,
  planId,
  metadata = {},
}) => {
  try {
    // Amount should be in cents
    const amountInCents = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: email,
      metadata: {
        planId: planId?.toString(),
        email,
        fullName,
        ...metadata,
      },
    });

    // Save transaction record
    const transaction = new PaymentTransaction({
      stripePaymentIntentId: paymentIntent.id,
      amount,
      currency: "usd",
      status: "processing",
      planId,
      metadata,
    });

    await transaction.save();

    logger.info(
      `Payment Intent created: ${paymentIntent.id} for amount: ${amount}`
    );

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    logger.error("Error creating payment intent:", error);
    throw error;
  }
};

// Verify Payment Intent Status
const verifyPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(
      paymentIntentId
    );
    return paymentIntent;
  } catch (error) {
    logger.error("Error verifying payment intent:", error);
    throw error;
  }
};

// Update Payment Transaction Status
const updatePaymentStatus = async (paymentIntentId, status) => {
  try {
    const transaction = await PaymentTransaction.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId },
      { status },
      { new: true }
    );
    return transaction;
  } catch (error) {
    logger.error("Error updating payment status:", error);
    throw error;
  }
};

// Get Payment Transaction
const getPaymentTransaction = async (paymentIntentId) => {
  try {
    const transaction = await PaymentTransaction.findOne({
      stripePaymentIntentId: paymentIntentId,
    });
    return transaction;
  } catch (error) {
    logger.error("Error fetching payment transaction:", error);
    throw error;
  }
};

// Link Payment to User after successful payment
const linkPaymentToUser = async (paymentIntentId, userId) => {
  try {
    const transaction = await PaymentTransaction.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId },
      { userId },
      { new: true }
    );
    return transaction;
  } catch (error) {
    logger.error("Error linking payment to user:", error);
    throw error;
  }
};

module.exports = {
  createPaymentIntent,
  verifyPaymentIntent,
  updatePaymentStatus,
  getPaymentTransaction,
  linkPaymentToUser,
};
