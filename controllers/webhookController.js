const { asyncHandler } = require("../utils/asyncHandler");
const stripeService = require("../services/stripeService");
const CheckoutSession = require("../models/CheckoutSession");
const { finalizeCheckoutSession } = require("../services/checkoutService");
const logger = require("../utils/logger");
const UserSubscription = require("../models/userSubscription");

const handleStripeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["stripe-signature"];
  let event;

  try {
    event = stripeService.constructWebhookEvent(req.body, signature);
  } catch (error) {
    logger.error("Stripe webhook signature verification failed", {
      error: error.message,
    });
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  const { type, data } = event;

  try {
    switch (type) {
      case "checkout.session.completed": {
        const session = data.object;
        const checkoutRecord = await CheckoutSession.findOne({
          sessionId: session.id,
        });
        if (!checkoutRecord) {
          logger.warn("Checkout record missing for session", { sessionId: session.id });
          break;
        }
        await finalizeCheckoutSession({
          checkoutRecord,
          stripeSession: session,
        });
        break;
      }
      case "customer.subscription.deleted":
      case "customer.subscription.updated": {
        const subscription = data.object;
        if (subscription?.id) {
          await UserSubscription.findOneAndUpdate(
            { stripeSubscriptionId: subscription.id },
            {
              status: subscription.status === "canceled" ? "cancelled" : "active",
              paymentStatus:
                subscription.status === "unpaid"
                  ? "failed"
                  : subscription.status === "canceled"
                  ? "cancelled"
                  : "paid",
              endDate:
                subscription.status === "canceled"
                  ? new Date(subscription.canceled_at * 1000)
                  : undefined,
              lastInvoiceId: subscription.latest_invoice,
            }
          );
        }
        break;
      }
      default:
        logger.info(`Unhandled Stripe event type ${type}`);
    }
  } catch (error) {
    logger.error("Error handling Stripe webhook event", {
      type,
      error: error.message,
    });
    return res.status(500).send("Internal Server Error");
  }

  res.json({ received: true });
});

module.exports = { handleStripeWebhook };

