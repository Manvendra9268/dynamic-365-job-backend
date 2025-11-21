const { asyncHandler } = require("../utils/asyncHandler");
const stripeService = require("../services/stripeService");
const CheckoutSession = require("../models/CheckoutSession");
const Subscription = require("../models/Subscription");
const UserSubscription = require("../models/userSubscription");

const { finalizeCheckoutSession } = require("../services/checkoutService");
const logger = require("../utils/logger");

/* ---------------------------------------------------------
    HANDLE STRIPE WEBHOOK
---------------------------------------------------------- */
const handleStripeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["stripe-signature"];
  let event;

  /* -------------------------------------------------------
        VERIFY WEBHOOK SIGNATURE
  -------------------------------------------------------- */
  try {
    event = stripeService.constructWebhookEvent(req.body, signature);
  } catch (error) {
    logger.error("❌ Stripe webhook signature verification failed", {
      error: error.message,
    });
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  const { type, data } = event;

  try {
    switch (type) {
      /* -------------------------------------------------------
          1️⃣ checkout.session.completed
          - When user finishes paying on Stripe
          - Can be one-time OR subscription
      -------------------------------------------------------- */
      case "checkout.session.completed": {
        const session = data.object;
        const checkoutRecord = await CheckoutSession.findOne({ sessionId: session.id });

        if (!checkoutRecord) {
          logger.warn("⚠️ Checkout record missing for session", {
            sessionId: session.id,
          });
          break;
        }

        await finalizeCheckoutSession({ checkoutRecord, stripeSession: session });
        break;
      }

      /* -------------------------------------------------------
          2️⃣ invoice.payment_succeeded
          - This is triggered for subscription renewals ONLY
      -------------------------------------------------------- */
      case "invoice.payment_succeeded": {
        const invoice = data.object;

        // Ignore one-time payments
        if (!invoice.subscription) {
          logger.info("Invoice not linked to subscription — skipping");
          break;
        }

        const stripeSubscriptionId = invoice.subscription;

        const userSub = await UserSubscription.findOne({ stripeSubscriptionId });
        if (!userSub) {
          logger.warn("UserSubscription not found for renewal invoice", {
            stripeSubscriptionId,
          });
          break;
        }

        const plan = await Subscription.findById(userSub.subscriptionId);
        if (!plan) {
          logger.error("Plan not found during renewal credit update", {
            subscriptionId: userSub.subscriptionId,
          });
          break;
        }

        // ADD NEW MONTHLY CREDITS
        const previousCredits = userSub.totalCredits || 0;
        userSub.totalCredits = previousCredits + plan.totalCredits;

        // Do NOT reset used credits → accumulation model
        userSub.paymentStatus = "paid";
        userSub.status = "active";
        userSub.lastInvoiceId = invoice.id;

        await userSub.save();

        logger.info("🟢 Renewal successful — Credits added", {
          userId: userSub.userId,
          addedCredits: plan.totalCredits,
          totalCredits: userSub.totalCredits,
        });

        break;
      }

      /* -------------------------------------------------------
          3️⃣ customer.subscription.deleted
          - User cancelled
          - Payment failed and Stripe auto-cancelled
      -------------------------------------------------------- */
      case "customer.subscription.deleted": {
        const subscription = data.object;

        await UserSubscription.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          {
            status: "cancelled",
            paymentStatus: "cancelled",
            endDate: subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000)
              : new Date(),
          }
        );

        logger.info("🔴 Stripe subscription deleted", {
          stripeSubscriptionId: subscription.id,
        });

        break;
      }

      /* -------------------------------------------------------
          4️⃣ customer.subscription.updated
          - Card changed
          - Billing cycle changed
          - Status changed (active/past_due/unpaid)
      -------------------------------------------------------- */
      case "customer.subscription.updated": {
        const subscription = data.object;

        await UserSubscription.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          {
            status:
              subscription.status === "canceled"
                ? "cancelled"
                : subscription.status === "active"
                ? "active"
                : "inactive",

            paymentStatus:
              subscription.status === "unpaid"
                ? "failed"
                : subscription.status === "canceled"
                ? "cancelled"
                : "paid",

            lastInvoiceId: subscription.latest_invoice || null,
          }
        );

        logger.info("🔁 Stripe subscription updated", {
          stripeSubscriptionId: subscription.id,
          newStatus: subscription.status,
        });

        break;
      }

      /* -------------------------------------------------------
          UNHANDLED TYPES
      -------------------------------------------------------- */
      default:
        logger.info(`ℹ️ Unhandled Stripe event type: ${type}`);
    }
  } catch (error) {
    logger.error("❌ Error in Stripe webhook processing", {
      type,
      error: error.message,
    });
    return res.status(500).send("Internal Server Error in webhook");
  }

  res.json({ received: true });
});

module.exports = { handleStripeWebhook };
