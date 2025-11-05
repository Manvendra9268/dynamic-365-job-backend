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

const getAllSubscriptions = [
  //checkAdminRole,
  asyncHandler(async (req, res) => {
    const subscriptions = await subscriptionService.getAllSubscriptions();
    res.status(200).json({
      message: "All subscriptions fetched successfully",
      data: subscriptions,
    });
  }),
];

module.exports = {
  createSubcription,
  getAllSubscriptions
};
