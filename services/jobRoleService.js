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
