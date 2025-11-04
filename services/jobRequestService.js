const JobRequest = require('../models/JobRequest');
const ApiError = require('../utils/error');
const logger = require('../utils/logger');

//new job request
exports.createJobRequest = async (data) => {
  try {
    if (!data.employerId) {
      throw new ApiError('Missing employerId while creating job request', 400);
    }
    const jobRequest = new JobRequest(data);
    await jobRequest.save();

    logger.info(`New job request created`, { employerId: data.employerId, jobTitle: data.jobTitle });
    return jobRequest;
  } catch (error) {
    logger.error('Error creating job request', { error: error.message, stack: error.stack });
    throw new ApiError('Failed to create job request', 500, error.message);
  }
};

// Get all job requests (optionally filter by employerId)
exports.getAllJobRequests = async (filters = {}) => {
  try {
    const query = {};
    if (filters.employerId) query.employerId = filters.employerId;

    const jobRequests = await JobRequest.find(query)
      .populate('employerId', 'name email')
      .sort({ createdAt: -1 });

    logger.info(`Fetched ${jobRequests.length} job requests`, { filters });
    return jobRequests;
  } catch (error) {
    logger.error('Error fetching job requests', { error: error.message, stack: error.stack });
    throw new ApiError('Failed to fetch job requests', 500);
  }
};

// Get job request by ID
exports.getJobRequestById = async (id) => {
  try {
    const jobRequest = await JobRequest.findById(id)
      .populate('employerId', 'name email');

    if (!jobRequest) {
      logger.warn(`Job request not found for ID: ${id}`);
      throw new ApiError('Job request not found', 404);
    }

    logger.info(`Fetched job request by ID`, { id });
    return jobRequest;
  } catch (error) {
    logger.error('Error fetching job request by ID', { id, error: error.message, stack: error.stack });
    if (error instanceof Error) throw error;
    throw new ApiError('Failed to fetch job request', 500);
  }
};