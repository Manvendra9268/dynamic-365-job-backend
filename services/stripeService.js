const stripe = require("../config/stripe");

const createCheckoutSession = async ({
  customerEmail,
  customerId,
  mode,
  lineItems,
  successUrl,
  cancelUrl,
  metadata = {},
  subscriptionData = {},
}) => {
  const payload = {
    mode,
    payment_method_types: ["card"],
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    allow_promotion_codes: false,
    billing_address_collection: "auto",
  };

  if (customerEmail) {
    payload.customer_email = customerEmail;
  }

  if (customerId) {
    payload.customer = customerId;
  }

  if (mode === "subscription") {
    payload.subscription_data = {
      ...subscriptionData,
      metadata: {
        ...(subscriptionData.metadata || {}),
        ...metadata,
      },
    };
  } else {
    payload.payment_intent_data = {
      metadata,
      ...(subscriptionData.payment_intent_data || {}),
    };
  }

  return stripe.checkout.sessions.create(payload);
};

const retrieveCheckoutSession = async (sessionId) => {
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent", "subscription"],
  });
};

const cancelSubscription = async (subscriptionId) => {
  return stripe.subscriptions.cancel(subscriptionId);
};

const constructWebhookEvent = (payload, signature) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
};

const retrieveSubscription = async (subscriptionId) => {
  return stripe.subscriptions.retrieve(subscriptionId);
};

module.exports = {
  createCheckoutSession,
  retrieveCheckoutSession,
  cancelSubscription,
  constructWebhookEvent,
  retrieveSubscription,
};

