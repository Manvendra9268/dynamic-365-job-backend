const mongoose = require("mongoose");

const jobRequestSchema = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    jobRole: {
      type: [String],
      required: false,
      default: []
    },
    otherRole: {
      type: String,
      default: null,
    },
    companyHomePage: {
      type: String,
      default: null,
    },
    companyLinkedInPage: {
      type: String,
      default: null,
    },
    applyLink: {
      type: String,
      default: null,
    },
    roleDescription: {
      type: String,
      default: null,
    },
    applyClicks: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },

    // removed fields
    keyResponsibilities: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    country: {
      type: String,
      trim: true,
      default: null,
    },

    status: {
      type: String,
      enum: ["Active", "In Review", "Expired", "Rejected"],
      default: "In Review",
    },
    workMode: {
      type: String,
      enum: ["Full-Time", "Part-Time", "Contract"],
      trim: true,
      default: "Full-Time",
    },
    jobType: {
      type: String,
      enum: ["Remote", "Hybrid", "Onsite"],
      trim: true,
      default: "Onsite",
    },
    upperCompensation: {
      type: Number,
      min: 0,
    },
    lowerCompensation: {
      type: Number,
      min: 0,
    },
    roleLevel: {
      type: String,
      enum: ["Senior Level", "Mid-Level", "Junior Level"],
      trim: true,
    },
    salary: {
      type: String,
      default: null
    },
    organization: {
      type: String,
      default: null,
    },
    date_posted: {
      type: String,
      default: null,
    },
    organization_logo: {
      type: String,
      default: null,
    },
    linkedin_org_industry: {
      type: String,
      default: null,
    },
    linkedin_org_size: {
      type: String,
      default: null,
    },
    linkedin_org_foundeddate: {
      type: String,
      default: null,
    },
    linkedin_org_headquarters: {
      type: String,
      default: null,
    },
    domain_derived: {
      type: String,
      default: null,
    },
    product_tags: {
      type: [String],
      default: [],
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("JobRequest", jobRequestSchema);
