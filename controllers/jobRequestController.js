const { asyncHandler } = require("../utils/asyncHandler");
const jobRequestService = require("../services/jobRequestService");
const {
  validateJobRequest,
  handleValidationErrors,
  checkEmployerRole,
  validateJobUpdate,
} = require("../utils/validator");

const createJobRequest = [
  validateJobRequest,
  handleValidationErrors,
  checkEmployerRole,
  asyncHandler(async (req, res) => {
    const jobData = {
      ...req.body,
      employerId: req.user.id, // ✅ derived from token
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
    employerId: req.user?.id, //filter user posted jobs
  };
  const jobRequests = await jobRequestService.getAllJobRequests(filters);
  res.status(200).json({
    message: "Job requests fetched successfully",
    data: jobRequests,
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

    const updatedJob = await jobRequestService.editJobDetails(jobId, userId, updateData);

    res.status(200).json({
      message: "Job details updated successfully",
      data: updatedJob,
    });
  }),
];

module.exports = {
  createJobRequest,
  getAllJobRequests,
  getJobRequestById,
  getUserJobs,
  updateJobDetails
};
