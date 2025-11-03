const { body, validationResult, param, query } = require('express-validator');
const Error = require('./error');
const User = require('../models/User');

const validateUser = [
  // Email
  body("email")
    .exists({ checkFalsy: true })
    .withMessage("Email is required.")
    .isEmail()
    .normalizeEmail()
    .withMessage("Invalid email."),

  // Password
  body("password")
    .exists({ checkFalsy: true })
    .withMessage("Password is required.")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters."),

  // Full name — required for all roles
  body("fullName")
    .exists({ checkFalsy: true })
    .withMessage("Full name is required.")
    .trim(),

  // Role
  body("role")
    .exists({ checkFalsy: true })
    .withMessage("Role is required.")
    .isIn(["employer", "jobseeker", "admin"])
    .withMessage("Role must be either employer, jobseeker, or admin."),

  //Phone Number
  body("phoneNumber")
    .exists({ checkFalsy: true })
    .withMessage("Phone number is required.")
    .isMobilePhone()
    .withMessage("Invalid phone number."),

  // Employer-specific validations
  body("organizationName")
    .if(body("role").equals("employer"))
    .exists({ checkFalsy: true })
    .withMessage("Organization name is required for employers."),

  body("organizationSize")
    .if(body("role").equals("employer"))
    .isInt({ min: 1 })
    .withMessage("Organization size must be a positive integer."),
  
  body("founded")
    .if(body("role").equals("employer"))
    .isInt({ min: 1000, max: new Date().getFullYear() })
    .withMessage("Founded year must be a valid year."),
  
  body("headquarters")
    .if(body("role").equals("employer"))
    .isString()
    .trim(),
  
  body("organizationLinkedIn")
    .if(body("role").equals("employer"))
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage("Organization LinkedIn must be a valid URL."),
  
  body("organizationWebsite")
    .if(body("role").equals("employer"))
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage("Organization Website must be a valid URL."),
  // jobseeker–specific validations
  body("areasOfInterest")
    .if(body("role").equals("jobseeker"))
    .isArray({ min: 1 })
    .withMessage("jobseekers must select at least one area of interest."),

  body("currentRole")
    .if(body("role").equals("jobseeker"))
    .optional()
    .isString()
    .trim(),

  body("country")
    .if(body("role").equals("jobseeker"))
    .optional()
    .isString()
    .trim(),

  body("contactSharing")
    .if(body("role").equals("jobseeker"))
    .optional()
    .isBoolean()
    .withMessage("Contact sharing must be a boolean."),
];


const validateLogin = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
];

const validateUserId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
];

const validateOtpGenerate = [
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format'),
];

const validateOtpVerify = [
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format'),
  body('otp')
    .notEmpty()
    .withMessage('OTP is required')
    .matches(/^\d{6}$/)
    .withMessage('OTP must be a 6-digit number'),
];

const validateJobRequest = [
  body('employerId')
    .exists({ checkFalsy: true })
    .withMessage('Employer ID is required.')
    .isMongoId()
    .withMessage('Invalid employer ID.')
    .bail()
    .custom(async (value) => {
      const employer = await User.findById(value).populate('role');
      if (!employer) {
        return Promise.reject('Employer not found.');
      }
      if (!employer.role || employer.role.roleName.toLowerCase() !== 'employer') {
        return Promise.reject('User is not authorized to create a job request.');
      }
      return true;
    }),

  body('jobTitle')
    .exists({ checkFalsy: true })
    .withMessage('Job title is required.')
    .trim(),

  body('workMode')
    .optional()
    .isIn(['Full-Time', 'Part-Time'])
    .withMessage('Invalid workMode! Valid values: Full-Time, Part-Time.'),

  body('jobType')
    .optional()
    .isIn(['Remote', 'Hybrid', 'Onsite'])
    .withMessage('Invalid job type. Valid values: Remote, Hybrid, Onsite.'),

  body('upperCompensation')
    .optional()
    .isNumeric()
    .withMessage('Upper compensation must be a number.')
    .custom((value, { req }) => {
      if (req.body.lowerCompensation && value < req.body.lowerCompensation) {
        throw new Error('Upper compensation must be greater than or equal to lower compensation.');
      }
      return true;
    }),

  body('lowerCompensation')
    .optional()
    .isNumeric()
    .withMessage('Lower compensation must be a number.'),

  body('roleLevel')
    .optional()
    .isIn(['Senior Level', 'Associate', 'Apprenticeship'])
    .withMessage('Invalid role level.'),

  body('roleDescription')
    .optional()
    .isString()
    .trim(),

  body('keyResponsibilities')
    .optional()
    .isArray()
    .withMessage('Key responsibilities must be an array of strings.'),

  body('requirements')
    .optional()
    .isArray()
    .withMessage('Requirements must be an array of strings.'),

  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array of strings.'),

  body('country')
    .optional()
    .isString()
    .trim(),
  ];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
    }));

    return next(new Error('Validation failed', 400, formattedErrors));
  }
  next();
};


module.exports = {
  validateUser,
  validateLogin,
  validateUserId,
  validatePagination,
  validateOtpGenerate,
  validateOtpVerify,
  validateJobRequest,
  handleValidationErrors,
};