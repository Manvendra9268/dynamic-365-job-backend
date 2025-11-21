const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        unique: true,
    },
    price:{
        type: Number,
        required: true,
    },
    description: {
        type: String,
        default: null
    },
    features:{
        type: [String],
        default: [],
        required: true,
    },
    totalCredits:{
        type: Number,
        required: true,
    },
    period:{
        type: Number,
    },

    // ⭐ NEW FIELDS FOR STRIPE PRICE ID INTEGRATION
    stripeProductId: {
        type: String,
        required: true,
    },
    stripePriceId: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
