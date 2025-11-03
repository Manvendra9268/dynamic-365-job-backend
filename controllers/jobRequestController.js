const { asyncHandler } = require('../utils/asyncHandler');
const jobRequestService = require('../services/jobRequestService');
const { validateJobRequest } = require('../utils/validator');

const createJobRequest = [
    validateJobRequest,
    asyncHandler(async (req, res) => {
  const jobRequest = await jobRequestService.createJobRequest(req.body);
  res.status(200).json({
    message: 'Job posted successfully',
    data: jobRequest
  })
}),
];

// Get All Job Requests
const getAllJobRequests = asyncHandler(async (req, res) => {
  const filters = {
    employerId: req.query.employerId, // optional filter
  };
  const jobRequests = await jobRequestService.getAllJobRequests(filters);
  res.status(200).json({
    message: 'Job requests fetched successfully',
    data: jobRequests,
  });
});

// Get Job Request by ID
const getJobRequestById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const jobRequest = await jobRequestService.getJobRequestById(id);
  res.status(200).json({
    message: 'Job request fetched successfully',
    data: jobRequest,
  });
});




module.exports = {
    createJobRequest,
    getAllJobRequests,
    getJobRequestById
}
