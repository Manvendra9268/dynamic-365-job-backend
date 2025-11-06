const JobRequest = require("../models/JobRequest");
const ApiError = require("../utils/error");
const logger = require("../utils/logger");

//new job request
exports.createJobRequest = async (data) => {
  try {
    if (!data.employerId) {
      throw new ApiError("Missing employerId while creating job request", 400);
    }
    const jobRequest = new JobRequest(data);
    await jobRequest.save();

    logger.info(`New job request created`, {
      employerId: data.employerId,
      jobTitle: data.jobTitle,
    });
    return jobRequest;
  } catch (error) {
    logger.error("Error creating job request", {
      error: error.message,
      stack: error.stack,
    });
    throw new ApiError("Failed to create job request", 500, error.message);
  }
};

// Get all job requests (optionally filter by employerId)
exports.getAllJobRequests = async (filters = {}) => {
  try {
    const query = {};
    if (filters.employerId) query.employerId = filters.employerId;

    const jobRequests = await JobRequest.find(query)
      .populate("employerId", "name email")
      .sort({ createdAt: -1 });

    logger.info(`Fetched ${jobRequests.length} job requests`, { filters });
    return jobRequests;
  } catch (error) {
    logger.error("Error fetching job requests", {
      error: error.message,
      stack: error.stack,
    });
    throw new ApiError("Failed to fetch job requests", 500);
  }
};

// Get job request by ID
exports.getJobRequestById = async (id) => {
  try {
    const jobRequest = await JobRequest.findById(id).populate(
      "employerId",
      "name email"
    );

    if (!jobRequest) {
      logger.warn(`Job request not found for ID: ${id}`);
      throw new ApiError("Job request not found", 404);
    }

    logger.info(`Fetched job request by ID`, { id });
    return jobRequest;
  } catch (error) {
    logger.error("Error fetching job request by ID", {
      id,
      error: error.message,
      stack: error.stack,
    });
    if (error instanceof Error) throw error;
    throw new ApiError("Failed to fetch job request", 500);
  }
};

exports.getUserPostedJobs = async ({
  userId,
  search = "",
  pageNumber = 1,
  limitNumber = 10,
  status,
  startDate,
  endDate,
}) => {
  console.log("Service Layer - getUserPostedJobs called with:", {
    limitNumber,
    userId,
    search,
    pageNumber,
    status,
    startDate,
    endDate,
  });
  const skip = (pageNumber - 1) * limitNumber;

  // Build the query
  const query = { employerId: userId };

  // Add search condition if provided
  if (search) {
    query.$or = [
      { jobTitle: { $regex: search, $options: "i" } },
      { roleDescription: { $regex: search, $options: "i" } },
    ];
  }

  // Add status filter if provided
  if (status && ["Active", "In Review", "Expired"].includes(status)) {
    query.status = status;
  }

  // Add date range filter if provided
  if (startDate || endDate) {
  query.createdAt = {};

  if (startDate && startDate !== "null" && !isNaN(new Date(startDate))) {
    query.createdAt.$gte = new Date(startDate);
  }

  if (endDate && endDate !== "null" && !isNaN(new Date(endDate))) {
    query.createdAt.$lte = new Date(endDate);
  }

  if (Object.keys(query.createdAt).length === 0) {
    delete query.createdAt;
  }
  // Get total count for pagination
  const totalJobs = await JobRequest.countDocuments(query);
  const totalPages = Math.ceil(totalJobs / limitNumber);
  // Get jobs with pagination
  const jobs = await JobRequest.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber)
    .populate("employerId", "fullName email organizationName");

  return {
    jobs,
    pagination: {
      currentPage: pageNumber,
      totalPages,
      totalItems: totalJobs,
      limitNumber,
    },
  };
};

exports.editJobDetails = async (jobId, userId, updateData) => {
  try {
    const job = await JobRequest.findById(jobId);
    if (!job) {
      throw new ApiError(`Job not found with ID: ${jobId}`, 404);
    }
    //Check if logged-in employer owns the job
    if (job.employerId.toString() !== userId.toString()) {
      throw new ApiError(
        "Unauthorized: You can only update your own job postings.",
        403
      );
    }
    //Apply updates
    Object.assign(job, updateData);
    await job.save();

    logger.info(`Job details updated successfully`, {
      jobId,
      userId,
      updatedFields: Object.keys(updateData),
    });
    return job;
  } catch (error) {
    logger.error("Error updating job details", {
      jobId,
      userId,
      error: error.message,
      stack: error.stack,
    });
    throw new ApiError(
      "Failed to update job details",
      error.status || 500,
      error.message
    );
  }
};
}

    // Get total count for pagination
    const totalJobs = await JobRequest.countDocuments(query);
    const totalPages = Math.ceil(totalJobs / limitNumber);
    // Get jobs with pagination
    const jobs = await JobRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate('employerId', 'fullName email organizationName');

    return {
      jobs,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalItems: totalJobs,
        limitNumber
      }
    };
}
