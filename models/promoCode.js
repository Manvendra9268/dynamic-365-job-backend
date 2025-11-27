const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    appliesTo: {
        type: String,
        enum: ['employer', 'jobseeker', 'both'],
        required: true
    },
    discountType: {
        type: String,
        enum: ['Percent', 'Fixed Amount'],
        required: true
    },
    amount: {
        type: Number
    },
    usageLimit: {
        type: Number
    },
    totalUsed: {
        type: Number,
        default: 0
    },
    // Stripe identifiers for coupon and promotion code (created in Stripe)
    stripeCouponId: {
        type: String,
        default: null
    },
    stripePromotionCodeId: {
        type: String,
        default: null
    },
    promoStartDate: {
        type: Date,
        required: true
    },
    promoEndDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('PromoCode', promoCodeSchema);