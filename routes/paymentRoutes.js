const express = require("express");
const {
  createPublicCheckoutSession,
  createAuthenticatedCheckoutSession,
  getCheckoutStatus,
  cancelSubscription,
} = require("../controllers/paymentController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/public/checkout", createPublicCheckoutSession);
router.post("/checkout", authMiddleware, createAuthenticatedCheckoutSession);
router.get("/checkout-status/:sessionId", getCheckoutStatus);
router.post("/cancel", authMiddleware, cancelSubscription);

module.exports = router;

