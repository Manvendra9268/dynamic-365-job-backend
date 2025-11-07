const Subscription = require("../models/Subscription");
const ApiError = require("../utils/error");
const logger = require("../utils/logger");
const userSubscription = require("../models/userSubscription");
//add-subscription
exports.addSubscription = async (data) => {
  try {
    const newSubscription = new Subscription(data);
    await newSubscription.save();

    logger.info(`New subscription added`, { name: data.name });
    return newSubscription;
  } catch (error) {
    logger.error("Error adding to subscription", {
      error: error.message,
      stack: error.stack,
    });
    throw new ApiError("Failed to add subscription", 500, error.message);
  }
};

//get-all subscriptions
exports.getAllSubscriptions = async () => {
  try {
    const subscriptions = await Subscription.find().sort({ createdAt: -1 });

    logger.info("Fetched all subscriptions");
    return subscriptions;
  } catch (error) {
    logger.error("Error fetching subscriptions", {
      error: error.message,
      stack: error.stack,
    });
    throw new ApiError("Failed to fetch subscriptions", 500, error.message);
  }
};

exports.getPlansById = async (id) => {
  try {
    const subscription = await Subscription.findById(id);
    if (!subscription){
      logger.warn(`Subscription plan not found for ${id}`);
      throw new ApiError("Subscription plan not found", 400);
    }

    logger.info(`Fetched subscription plan by ID`, {id});
    return subscription;
  } catch (error) {
    logger.error("Error fetching job request by ID", {
      id,
      error: error.message,
      stack: error.stack,
    });
    if (error instanceof Error) throw error;
    throw new ApiError("Failed to fetch job request", 500);
  }
};

exports.getSubscriptionByUser = async (userId) => {
  try {
    const subscriptions = await userSubscription.findOne({ userId: userId });
    return subscriptions;
  } catch (error) {
    logger.error("Error fetching user subscriptions", {
      error: error.message,
      stack: error.stack,
    });
    throw new ApiError(
      "Failed to fetch user subscriptions",
      500,
      error.message
    );
  }
};
