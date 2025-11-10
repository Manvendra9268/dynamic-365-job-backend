const { asyncHandler } = require("../utils/asyncHandler");
const {
  validateUser,
  validateLogin,
  validateUserId,
  handleValidationErrors,
  validateGoogelUser,
  validateResetPassword,
  validateEditUser,
  validateSubscriptionId,
  validateUserAndSubscribe
} = require("../utils/validator");
const {
  createUser,
  loginUser,
  getUserById,
  updateUser,
  softDeleteUser,
  googleAuthService,
  googleLoginService,
  resetPasswordService,
  createMapping,
} = require("../services/userService");

const Role = require("../models/Role");
const Subscription = require("../models/Subscription");
const mongoose = require("mongoose");

const registerUser = [
  validateUser,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    let {
      fullName,
      email,
      password,
      role, // can be a role name (string) or ObjectId
      organizationName,
      organizationSize,
      founded,
      headquarters,
      organizationLinkedIn,
      organizationWebsite,
      phoneNumber,
      areasOfInterest,
      currentRole,
      country,
      contactSharing,
      industry,
    } = req.body;
    let profileImage = "";

    if (req.file) {
      profileImage = req.file.path;
    }
    // Clean up string fields
    if (email) email = email.trim().toLowerCase();
    if (fullName) fullName = fullName.trim();

    // Resolve Role
    const roleDoc = await Role.findOne(
      mongoose.Types.ObjectId.isValid(role)
        ? { _id: role }
        : { roleName: role.toLowerCase() }
    );

    if (!roleDoc) {
      return res.status(400).json({ message: "Invalid role specified." });
    }

    const user = await createUser({
      fullName,
      email,
      password,
      role: roleDoc._id, // pass ObjectId
      organizationName,
      organizationSize,
      founded,
      headquarters,
      organizationLinkedIn,
      organizationWebsite,
      phoneNumber,
      areasOfInterest,
      currentRole,
      country,
      contactSharing,
      industry,
      profileImage,
    });

    res.status(201).json({
      message: "User registered successfully",
      data: { id: user.id, email: user.email, role: roleDoc.roleName },
    });
  }),
];

const googleAuth = [
  validateGoogelUser,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const {
      fullName,
      role,
      organizationName,
      organizationSize,
      founded,
      headquarters,
      organizationLinkedIn,
      organizationWebsite,
      phoneNumber,
      areasOfInterest,
      currentRole,
      country,
      contactSharing,
      access_token,
      industry,
    } = req.body;
    let profileImage = "";

    if (req.file) {
      profileImage = req.file.path;
    }
    if (!access_token) {
      return res.status(400).json({ message: "Google token is required." });
    }

    const roleDoc = await Role.findOne(
      mongoose.Types.ObjectId.isValid(role)
        ? { _id: role }
        : { roleName: role.toLowerCase() }
    );

    if (!roleDoc) {
      return res.status(400).json({ message: "Invalid role specified." });
    }

    const result = await googleAuthService({
      role: roleDoc._id,
      fullName,
      organizationName,
      organizationSize,
      founded,
      headquarters,
      organizationLinkedIn,
      organizationWebsite,
      phoneNumber,
      areasOfInterest,
      currentRole,
      country,
      contactSharing,
      access_token,
      industry,
      profileImage,
    });

    res.status(200).json({
      message: "Registration successful",
      token: result.token,
      data: result.user,
    });
  }),
];

const googleLogin = [
  asyncHandler(async (req, res) => {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ message: "Google token is required." });
    }
    const result = await googleLoginService({ access_token });

    res.status(200).json({
      message: "Login successful",
      token: result.token,
      data: result.user,
    });
  }),
];

const userLogin = [
  validateLogin,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });
    res.status(200).json({
      message: "Login successful",
      data: result,
    });
  }),
];

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.id, req.user);
  res.status(200).json({
    message: "User profile fetched successfully",
    data: user.data,
  });
});

const updateUserDetails = [
  validateUser,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    let {
      fullName,
      email,
      password,
      role,
      organizationName,
      organizationSize,
      founded,
      headquarters,
      organizationLinkedIn,
      organizationWebsite,
      phoneNumber,
      areasOfInterest,
      currentRole,
      country,
      contactSharing,
      industry,
    } = req.body;
    let profileImage = "";
    if (req.file) {
      profileImage = req.file.path;
    }
    // Clean up string fields
    if (email) email = email.trim().toLowerCase();
    if (fullName) fullName = fullName.trim();
    // Resolve Role
    const roleDoc = await Role.findOne(
      mongoose.Types.ObjectId.isValid(role)
        ? { _id: role }
        : { roleName: role.toLowerCase() }
    );
    if (!roleDoc) {
      return res.status(400).json({ message: "Invalid role specified." });
    }
    const userId = req.user.id;
    const user = await updateUser({
      fullName,
      email,
      password,
      role: roleDoc._id,
      organizationName,
      organizationSize,
      founded,
      headquarters,
      organizationLinkedIn,
      organizationWebsite,
      phoneNumber,
      areasOfInterest,
      currentRole,
      country,
      contactSharing,
      industry,
      profileImage,
      userId,
    });

    res.status(200).json({
      message: "User profile updated successfully",
      data: { id: user.id, email: user.email, role: roleDoc.roleName },
    });
  }),
];

const deleteUserAccount = [
  validateUserId,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const deletedBy = req.user?.id;
    // console.log("req.user----", req.user);
    const result = await softDeleteUser(req.params.id, deletedBy);
    res.status(200).json({ message: "User account deleted.", ...result });
  }),
];

const resetUserPassword = [
  validateResetPassword,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { oldPassword, newPassword } = req.body;
    const result = await resetPasswordService(userId, oldPassword, newPassword);
    res.status(200).json(result);
  }),
];

const userSubscribeAndRegister = [
  validateSubscriptionId,
  validateUserAndSubscribe,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const subscriptionId = req.query.id;
    
    const employerRole = await Role.findOne({ roleName: "employer" });
    if (!employerRole) {
      logger.error("Employer role not found in DB");
      return res.status(500).json({ message: "Employer role not configured." });
    }
    const userData = {
      ...req.body,
      role: employerRole._id,
    };
    //register-user
    const createdUser = await createUser(userData);
    //fetch subscription details
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }
    //calculate dates and credits
    const startDate = new Date();
    const endDate = subscription.period
      ? new Date(startDate.setDate(startDate.getDate() + subscription.period))
      : null;
    const totalCredits = subscription.totalCredits;
    const usedCredits = 0;
    //create-record
    const mapping = await createMapping({
      userId: createdUser.id,
      subscriptionId,
      startDate,
      endDate,
      totalCredits,
      usedCredits,
    });

    res.status(201).json({
      message: "User registered and subscription activated.",
      user: createdUser.email,
      subscription: mapping,
    });
  }),
];

module.exports = {
  registerUser,
  userLogin,
  getUserProfile,
  updateUserDetails,
  deleteUserAccount,
  googleAuth,
  googleLogin,
  resetUserPassword,
  userSubscribeAndRegister,
};

// const generateOtpHandler = [
//   validateOtpGenerate,
//   handleValidationErrors,
//   asyncHandler(async (req, res) => {
//     const { phone } = req.body;
//     const result = await generateOtp(phone);
//     res.status(200).json(result);
//   }),
// ];

// const verifyOtpHandler = [
//   validateOtpVerify,
//   handleValidationErrors,
//   asyncHandler(async (req, res) => {
//     const { phone, otp } = req.body;
//     const result = await verifyOtp({ phone, otp }, { ipAddress: req.ip });
//     res.status(200).json(result);
//   }),
// ];

// const resendOtpHandler = [
//   validateOtpGenerate,
//   handleValidationErrors,
//   asyncHandler(async (req, res) => {
//     const { phone } = req.body;
//     const result = await resendOtp(phone);
//     res.status(200).json(result);
//   }),
// ];

// const enableUserAccount = [
//   validateUserId,
//   handleValidationErrors,
//   asyncHandler(async (req, res) => {
//     const user = await enableUser(req.params.id, req.user);
//     res.status(200).json({ message: 'User enabled successfully', data: user });
//   }),
// ];

// const disableUserAccount = [
//   validateUserId,
//   handleValidationErrors,
//   asyncHandler(async (req, res) => {
//     const user = await disableUser(req.params.id, req.user);
//     res.status(200).json({ message: 'User disabled successfully', data: user });
//   }),
// ];

// const getUserLoginHistory = asyncHandler(async (req, res) => {
//   const history = await getLoginHistory(req.user.id);
//   res.status(200).json({
//     message: 'User login history fetched successfully',
//     data: history
//   });
// });

// const getAllUsers = [
//   validatePagination,
//   handleValidationErrors,
//   asyncHandler(async (req, res) => {
//     const { page = 1, limit = 10 } = req.query;
//     const result = await getAllUsersService(parseInt(page), parseInt(limit), req.user);
//     res.status(200).json(result);
//   }),
// ];

// const getUser = [
//   validateUserId,
//   handleValidationErrors,
//   asyncHandler(async (req, res) => {
//     const user = await getUserById(req.params.id, req.user);
//     res.status(200).json(user);
//   }),
// ];
