const mongoose = require('mongoose');

const userSubscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
        required: true
    },
    startDate: {
        type: Date,
        default: null
    },
    endDate: {
        type: Date,
        default: null
    },
    totalCredits: {
        type: Number
    },
    usedCredits: {
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model('UserSubscription', userSubscriptionSchema);