const { asyncHandler } = require("../utils/asyncHandler");
const subscriptionService = require('../services/subscriptionService');
const { validateSubscription, handleValidationErrors, checkAdminRole } = require('../utils/validator');


const createSubcription = [
    validateSubscription,
    handleValidationErrors,
    checkAdminRole,
    asyncHandler(async (req, res) => {
        
    })
];


module.exports = {
    createSubcription
}