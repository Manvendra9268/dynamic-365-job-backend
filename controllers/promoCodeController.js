const {asyncHandler} = require('../utils/asyncHandler');
const promoCodeService = require('../services/promoCodeService');
const { validatePromoCode, handleValidationErrors } = require('../utils/validator');

const createPromoCode = [
    validatePromoCode,
    handleValidationErrors,
    asyncHandler(async (req, res) => {
        const promoCode = await promoCodeService.createPromoCode(req.body);
        res.status(200).json({
            message: 'Promo code created successfully',
            data: promoCode,
        });
    })
];

const allPromoCodes = [
    asyncHandler(async(req, res) => {
        const { page = 1, limit = 10} = req.query;
        pageNumber = parseInt(page);
        limitNumber = parseInt(limit);
        const result = await promoCodeService.getAllPromoCodes(pageNumber, limitNumber);
        res.status(200).json({
            message: "All promo codes fetched successfully",
            ...result,
        });
    }),
];


module.exports = {
    createPromoCode,
    allPromoCodes,
};