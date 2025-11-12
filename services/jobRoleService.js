const JobRole = require("../models/jobRole");
const ApiError = require("../utils/error");
const logger = require("../utils/logger");

exports.createJobRole = async (data) => {
  try {
    const roleName = data.name.trim();
    // Check if role already exists
    const existingRole = await JobRole.findOne({ name: roleName });
    if (existingRole) {
      logger.warn(`Attempt to create duplicate job role: ${roleName}`);
      throw new ApiError("Job role already exists", 400);
    }
    const jobRole = await JobRole.create({ name: roleName });
    logger.info(`Job role created successfully: ${jobRole.name}`, {
      jobRoleId: jobRole._id,
    });
    return jobRole;
  } catch (error) {
    logger.error("Error creating job role", {
      error: error.message,
      stack: error.stack,
      input: data,
    });
    throw new ApiError("Failed to create job role", 500, error.message);
  }
};


exports.getAllJobRole = async () => {
  try {
    const roles = await JobRole.find().sort({ createdAt: -1 });
    logger.info("Fetched all job roles.");
    return roles;
  } catch (error) {
    logger.error("Error fetching job roles", {
      error: error.message,
      stack: error.stack,
    });
    throw new ApiError("Failed to fetch job roles", 500, error.message);
  }
}