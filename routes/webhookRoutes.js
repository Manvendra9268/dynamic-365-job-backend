const express = require("express");
const router = express.Router();
const { handleStripeWebhook } = require("../controllers/webhookController");

// Webhook endpoint for Stripe events
// Important: This route should NOT use body parser middleware (express.json())
// The raw body is needed for signature verification
router.post("/stripe", express.raw({ type: "application/json" }), handleStripeWebhook);

module.exports = router;
