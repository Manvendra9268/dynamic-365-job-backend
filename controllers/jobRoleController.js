const { asyncHandler } = require("../utils/asyncHandler");
const jobRoleService = require("../services/jobRoleService");
const {
  validateJobRole,
  handleValidationErrors,
} = require("../utils/validator");

const createJobRole = [
  validateJobRole,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const jobRole = await jobRoleService.createJobRole(req.body);

    res.status(201).json({
      message: "Job role created successfully",
      data: jobRole,
    });
  }),
];

const getAllJobRoles = [
  asyncHandler(async (req, res) => {
    const alljobs = await jobRoleService.getAllJobRole();
    res.status(200).json({
      message: "All jobRoles fetched.",
      data: alljobs,
    })
  })
];

module.exports = {
  createJobRole,
  getAllJobRoles
};
