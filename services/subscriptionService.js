const Subscription = require('../models/Subscription');
const ApiError = require('../utils/error');
const logger = require('../utils/logger');

//add-subscription
exports.addSubscription = async (data) => {
    try{
        const newSubscription = new Subscription(data);
        await newSubscription.save();

        logger.info(`New subscription added`, { name: data.name });
        return newSubscription;
    } catch(error){
        logger.error('Error adding to subscription', { error: error.message, stack: error.stack });
        throw new ApiError('Failed to add subscription', 500, error.message)
    }
};