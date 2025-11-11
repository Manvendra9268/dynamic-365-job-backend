const mongoose = require('mongoose');

const jobRequestSchema = new mongoose.Schema(
    {
        employerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        jobTitle: {
            type: String,
            required: true
        },
        companyHomePage: {
            type: String,
            default: null,
            required: true
        },
        companyLinkedInPage: {
            type: String,
            default: null,
        },
        applyLink: {
            type: String,
            default: null,
            required: true
        },
        roleDescription: {
            type: String,
            default: null
        },
        applyClicks: {
            type: Number,
            default: 0
        },
        views: {
            type: Number,
            default: 0
        },

        // removed fields
        keyResponsibilities: {
            type: [String],
            default: []
        },
        requirements: {
            type: [String],
            default: []
        },
        skills: {
            type: [String],
            default: []
        },
        country: {
            type: String,
            trim: true,
            default: null
        },

        status: {
            type: String,
            enum: ['Active', 'In Review', 'Expired'],
            default: 'In Review'
        },
        workMode: {
            type: String,
            enum: ["Full-Time", "Part-Time"],
            trim: true,
            default: "Full-Time"
        },
        jobType: {
            type: String,
            enum: ["Remote", "Hybrid", "Onsite"],
            trim: true,
            default: "Onsite"
        },
        upperCompensation: {
            type: Number,
            min: 0
        },
        lowerCompensation: {
            type: Number,
            min: 0
        },
        roleLevel: {
            type: String,
            enum: ["Senior Level", "Associate", "Apprenticeship"],
            trim: true,
            default: 'Associate'
        },
        salary:{
            type: String
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("JobRequest", jobRequestSchema);