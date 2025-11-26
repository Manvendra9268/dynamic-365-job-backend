const express = require("express");
const router = express.Router();
const {
  createPromoCode,
  allPromoCodes,
  updatePromoCode,
  applyPromoCode,
  deletePromoCode,
} = require("../controllers/promoCodeController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createPromoCode);
router.post("/apply", applyPromoCode);
router.get("/", allPromoCodes);
router.put("/:id", authMiddleware, updatePromoCode);
router.delete("/:id", authMiddleware, deletePromoCode);

module.exports = router;