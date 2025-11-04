const { body, validationResult, param, query } = require('express-validator');
const ApiError = require('./error');
const Role = require('../models/Role')

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
    .withMessage("Role must be either employer, jobseeker, or admin"),

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
  
  body("industry")
    .if(body("role").equals("employer"))
    .exists({ checkFalsy: true })
    .withMessage("Industry name is required for employers."),
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

const validateGoogelUser = [
  // Role
  body("role")
    .exists({ checkFalsy: true })
    .withMessage("Role is required.")
    .isIn(["employer", "jobseeker", "admin"])
    .withMessage("Role must be either employer, jobseeker, or admin"),

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

  body("industry")
    .if(body("role").equals("employer"))
    .exists({ checkFalsy: true })
    .withMessage("Industry name is required for employers."),
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
        throw new ApiError('Upper compensation must be greater than or equal to lower compensation.');
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

  body('applyLink')
    .optional()
    .isString()
    .trim(),

  body('status')
    .optional()
    .isIn(['Active', 'In Review', 'Expire'])
    .withMessage('Invalid job status'),
];

const validateSubscription = [
body('name')
    .trim()
    .notEmpty().withMessage('Subscription name is required')
    .isString().withMessage('Subscription name must be a string'),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ gt: 0 }).withMessage('Price must be a positive number'),

  body('features')
    .isArray({ min: 1 }).withMessage('Features must be a non-empty array')
    .custom((arr) => arr.every((f) => typeof f === 'string' && f.trim() !== ''))
    .withMessage('Each feature must be a non-empty string'),

  body('totalCredits')
    .notEmpty().withMessage('Total credits are required')
    .isInt({ gt: 0 }).withMessage('Total credits must be a positive integer'),

  body('period')
    .notEmpty().withMessage('Period is required')
    .isInt({ gt: 0 }).withMessage('Period must be a positive integer'),
];

//check employer
const checkEmployerRole = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ApiError('Unauthorized: Token not found or invalid', 401));
    }

    const roleDoc = await Role.findById(req.user.role);
    if (!roleDoc) {
      return next(new ApiError('Role not found for user', 403));
    }

    if (roleDoc.roleName.toLowerCase() !== 'employer') {
      return next(new ApiError('Only employers can create job requests', 403));
    }

    next();
  } catch (error) {
    next(new ApiError('Role validation failed', 500, error.message));
  }
};

//check admin
const checkAdminRole = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new ApiError('Unauthorized: Token not found or invalid', 401));
    }

    const roleDoc = await Role.findById(req.user.role);
    if (!roleDoc) {
      return next(new ApiError('Role not found', 403));
    }

    if (roleDoc.roleName.toLowerCase() !== 'admin') {
      return next(new ApiError('Only admins can add subscription.', 403));
    }

    next();
  } catch (error) {
    next(new ApiError('Role validation failed', 500, error.message));
  }
};

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
    }));

    return next(new ApiError('Validation failed', 400, formattedErrors));
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
  validateSubscription,
  handleValidationErrors,
  validateGoogelUser,
  checkEmployerRole,
  checkAdminRole
};