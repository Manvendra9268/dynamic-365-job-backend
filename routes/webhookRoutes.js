const express = require("express");
const { handleStripeWebhook } = require("../controllers/webhookController");

const router = express.Router();

router.post("/", handleStripeWebhook);

module.exports = router;

