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
        required: true,
    }
    })

module.exports = mongoose.model('Subscription', subscriptionSchema);