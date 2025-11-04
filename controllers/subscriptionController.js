const { asyncHandler } = require("../utils/asyncHandler");
const subscriptionService = require("../services/subscriptionService");
const {
  validateSubscription,
  handleValidationErrors,
  checkAdminRole,
} = require("../utils/validator");

const createSubcription = [
  validateSubscription,
  handleValidationErrors,
  checkAdminRole,
  asyncHandler(async (req, res) => {
    const subscription = await subscriptionService.addSubscription(req.body);
    res.status(201).json({
      message: "Subscription added successfully",
      data: subscription,
    });
  }),
];

module.exports = {
  createSubcription,
};
