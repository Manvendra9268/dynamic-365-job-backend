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
  // optional array [{ promotion_code: 'promo_...' }]
  discounts = undefined,
  // allow Checkout to show promo entry UI (boolean)
  allowPromotionInput = false,
}) => {
  const payload = {
    mode,
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    payment_method_types: ["card"],
    billing_address_collection: "auto",
    // Stripe Error: You may only specify one of these parameters: allow_promotion_codes, discounts.
    // So if we have discounts, we MUST NOT set allow_promotion_codes to true.
    allow_promotion_codes:
      Array.isArray(discounts) && discounts.length > 0
        ? undefined
        : Boolean(allowPromotionInput),
  };

  if (customerEmail) payload.customer_email = customerEmail;
  if (customerId) payload.customer = customerId;

  if (mode === "subscription") {
    payload.subscription_data = {
      ...subscriptionData,
      metadata: { ...metadata },
    };
  }

  if (mode === "payment") {
    payload.payment_intent_data = {
      metadata,
      ...(subscriptionData.payment_intent_data || {}),
    };
  }

  if (Array.isArray(discounts) && discounts.length)
    payload.discounts = discounts;

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

/**
 * Create a Stripe coupon
 * @param {{percent_off?: number, amount_off?: number, currency?: string, duration: string, duration_in_months?: number, name?: string, metadata?: object}} opts
 */
const createCoupon = async (opts = {}) => {
  const payload = { ...opts };

  // Stripe expects either percent_off or amount_off (with currency)
  if (payload.amount_off && !payload.currency) {
    // default to USD if currency not provided
    payload.currency = payload.currency || "usd";
  }

  return stripe.coupons.create(payload);
};

/**
 * Create a Stripe promotion code for an existing coupon
 * @param {{coupon: string, code?: string, active?: boolean, restrictions?: object, metadata?: object}} opts
 */
const createPromotionCode = async (opts = {}) => {
  if (!opts.coupon)
    throw new Error("coupon id is required to create a promotion code");
  const payload = { ...opts };
  return stripe.promotionCodes.create(payload);
};

/**
 * Update a Stripe coupon (only metadata and name are mutable)
 * @param {string} couponId - The Stripe coupon ID
 * @param {{name?: string, metadata?: object}} updates - Fields to update
 */
const updateCoupon = async (couponId, updates = {}) => {
  if (!couponId) throw new Error("couponId is required");
  return stripe.coupons.update(couponId, updates);
};

/**
 * Update a Stripe promotion code
 * @param {string} promotionCodeId - The Stripe promotion code ID
 * @param {{active?: boolean, metadata?: object}} updates - Fields to update
 */
const updatePromotionCode = async (promotionCodeId, updates = {}) => {
  if (!promotionCodeId) throw new Error("promotionCodeId is required");
  return stripe.promotionCodes.update(promotionCodeId, updates);
};

/**
 * Deactivate a Stripe promotion code
 * @param {string} promotionCodeId - The Stripe promotion code ID
 */
const deactivatePromotionCode = async (promotionCodeId) => {
  if (!promotionCodeId) throw new Error("promotionCodeId is required");
  return stripe.promotionCodes.update(promotionCodeId, { active: false });
};

/**
 * Retrieve a Stripe promotion code
 * @param {string} promotionCodeId - The Stripe promotion code ID
 */
const retrievePromotionCode = async (promotionCodeId) => {
  if (!promotionCodeId) throw new Error("promotionCodeId is required");
  return stripe.promotionCodes.retrieve(promotionCodeId);
};

/**
 * Retrieve a Stripe coupon
 * @param {string} couponId - The Stripe coupon ID
 */
const retrieveCoupon = async (couponId) => {
  if (!couponId) throw new Error("couponId is required");
  return stripe.coupons.retrieve(couponId);
};

module.exports = {
  createCheckoutSession,
  retrieveCheckoutSession,
  cancelSubscription,
  constructWebhookEvent,
  retrieveSubscription,
  createCoupon,
  createPromotionCode,
  updateCoupon,
  updatePromotionCode,
  deactivatePromotionCode,
  retrievePromotionCode,
  retrieveCoupon,
};
