const { asyncHandler } = require("../utils/asyncHandler");
const promoCodeService = require("../services/promoCodeService");
const {
  validatePromoCode,
  handleValidationErrors,
} = require("../utils/validator");

const createPromoCode = [
  validatePromoCode,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const result = await promoCodeService.createPromoCode(req.body);
    // result contains { promo, stripeCoupon, stripePromotion } when created
    res.status(200).json({
      message: "Promo code created successfully",
      data: result,
    });
  }),
];

const allPromoCodes = [
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    pageNumber = parseInt(page);
    limitNumber = parseInt(limit);
    const result = await promoCodeService.getAllPromoCodes(
      pageNumber,
      limitNumber
    );
    res.status(200).json({
      message: "All promo codes fetched successfully",
      ...result,
    });
  }),
];

const updatePromoCode = [
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const updatedPromo = await promoCodeService.updatePromoCode(id, updateData);
    res.status(200).json({
      message: "Promo code updated successfully",
      data: updatedPromo,
    });
  }),
];

const applyPromoCode = [
  asyncHandler(async (req, res) => {
    const { promoCode, price } = req.body;
    if (!promoCode || !price) {
      return res.status(400).json({
        message: "promoCode and price are required.",
      });
    }
    const result = await promoCodeService.applyPromoCode(promoCode, price);
    return res.status(200).json({
      message: "Promo code applied successfully",
      data: result,
    });
  }),
];

const deletePromoCode = [
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deletedPromo = await promoCodeService.deletePromoCode(id);
    res.status(200).json({
      message: "Promo code deactivated successfully",
      data: deletedPromo,
    });
  }),
];

module.exports = {
  createPromoCode,
  allPromoCodes,
  updatePromoCode,
  applyPromoCode,
  deletePromoCode,
};
