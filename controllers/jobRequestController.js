const { asyncHandler } = require("../utils/asyncHandler");
const jobRequestService = require("../services/jobRequestService");
const { createMapping } = require("../services/userService");
const logger = require("../utils/logger");
const {
  validateJobRequest,
  handleValidationErrors,
  checkEmployerRole,
  validateJobUpdate,
} = require("../utils/validator");

const Subscription = require("../models/Subscription");

const createJobRequest = [
  validateJobRequest,
  handleValidationErrors,
  checkEmployerRole,
  asyncHandler(async (req, res) => {
    const jobData = {
      ...req.body,
      employerId: req.user.id,
    };

    const jobRequest = await jobRequestService.createJobRequest(jobData);

    res.status(200).json({
      message: "Job posted successfully",
      data: jobRequest,
    });
  }),
];

// Get All Job Requests
const getAllJobRequests = asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status,
    search: req.query.search,
    jobRole: req.query.jobRole,
    workMode: req.query.workMode,
    country: req.query.country
  };
  const pageNumber = parseInt(req.query.page, 10) || 1;
  const limitNumber = parseInt(req.query.limit, 10) || 10;
  const jobRequests = await jobRequestService.getAllJobRequests(filters, pageNumber, limitNumber);
  res.status(200).json({
    message: "Job requests fetched successfully",
    ...jobRequests,
  });
});

// view-jobs-by-Id
const getJobRequestById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const jobRequest = await jobRequestService.getJobRequestById(id);
  res.status(200).json({
    message: "Job request fetched successfully",
    data: jobRequest,
  });
});

const getUserJobs = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  console.log("Fetching jobs for user:", userId);
  const {
    page = 1,
    limit = 10,
    search,
    startDate,
    endDate,
    status,
  } = req.query;
  pageNumber = parseInt(page);
  limitNumber = parseInt(limit);
  const result = await jobRequestService.getUserPostedJobs({
    userId,
    pageNumber,
    limitNumber,
    search,
    startDate,
    endDate,
    status,
  });
  res.status(200).json({
    message: "User jobs fetched successfully",
    data: result,
  });
});

// update-jobs
const updateJobDetails = [
  validateJobUpdate,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const jobId = req.params.id;
    const userId = req.user.id;
    const updateData = req.body;

    const updatedJob = await jobRequestService.editJobDetails(
      jobId,
      userId,
      updateData
    );

    res.status(200).json({
      message: "Job details updated successfully",
      data: updatedJob,
    });
  }),
];

const updateJobDetailsByAdmin = [
  asyncHandler(async (req, res) => {
    const jobData = req.body
    const jobId = req.params.id;
    const updatedJob = await jobRequestService.editJobDetailsByAdmin(
      jobData,
      jobId
    );

    res.status(200).json({
      message: "Job details updated successfully",
      data: updatedJob,
    });
  }),
];

const postJobAndSubscribe = [
  validateJobRequest,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const {planId} = req.body
    const jobData = {
      ...req.body,
      employerId: userId,
    };
    //calculate date n credits
    const subscription = await Subscription.findById(planId)
    const startDate = new Date();
    let endDate = null;
    if (subscription.period) {
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + subscription.period);
    }
    const totalCredits = subscription.totalCredits;
    const usedCredits = 0;
    const userSubscriptionRecord = await createMapping({
      userId: userId,
      subscriptionId: subscription.id,
      startDate,
      endDate,
      totalCredits,
      usedCredits,
    });
    const postJob = await jobRequestService.createJobRequest(jobData);
    logger.info(`Subscription activated and job posted for user ${userId}`);
    res.status(201).json({
      message: "Subscription activated and Job posted successfully.",
      subscriptionData: userSubscriptionRecord,
      jobData: postJob,
    });
  }),
];

const getAdminDashboardStats = [
  asyncHandler(async (req, res) => {
    const stats = await jobRequestService.getAdminDashboardStats();
    res.status(200).json({
      message: "Admin dashboard stats fetched successfully",
      data: stats,
    });
  })
]

module.exports = {
  createJobRequest,
  getAllJobRequests,
  getJobRequestById,
  getUserJobs,
  updateJobDetails,
  postJobAndSubscribe,
  updateJobDetailsByAdmin,
  getAdminDashboardStats
};
