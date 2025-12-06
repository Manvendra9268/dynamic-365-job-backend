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
  validateUserAndSubscribe,
} = require("../utils/validator");
const {
  createUser,
  loginUser,
  getUserById,
  updateUser,
  //softDeleteUser,
  googleAuthService,
  googleLoginService,
  resetPasswordService,
  createMapping,
  getAllUsersService,
  updateUserByAdminService,
  getAllTransactions,
  employerOwnTransactions
} = require("../services/userService");

const Role = require("../models/Role");
const Subscription = require("../models/Subscription");
const PromoCode = require('../models/promoCode');
const mongoose = require("mongoose");
const logger = require("../utils/logger");

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
      otherRole,
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
      otherRole,
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
      otherRole,
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
      otherRole,
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

const getAllUsers = [
  asyncHandler(async (req, res) => {
    const userType = req.user.role.roleName;
    const { roleName, page = 1, limit = 10 } = req.query;
    pageNumber = parseInt(page);
    limitNumber = parseInt(limit);
    const result = await getAllUsersService(
      userType,
      roleName,
      pageNumber,
      limitNumber
    );
    res.status(200).json({
      message: "Users fetched successfully",
      ...result,
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
  validateEditUser,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    let {
      fullName,
      email,
      password,
      role,
      status,
      organizationName,
      organizationSize,
      founded,
      headquarters,
      organizationLinkedIn,
      organizationWebsite,
      phoneNumber,
      areasOfInterest,
      currentRole,
      otherRole,
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
      status,
      organizationName,
      organizationSize,
      founded,
      headquarters,
      organizationLinkedIn,
      organizationWebsite,
      phoneNumber,
      areasOfInterest,
      currentRole,
      otherRole,
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

// const deleteUserAccount = [
//   validateUserId,
//   handleValidationErrors,
//   asyncHandler(async (req, res) => {
//     const deletedBy = req.user?.id;
//     // console.log("req.user----", req.user);
//     const result = await softDeleteUser(req.params.id, deletedBy);
//     res.status(200).json({ message: "User account deleted.", ...result });
//   }),
// ];

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
    const { promoCode, finalPrice, discountApplied } = req.body;
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
    let endDate = null;
    if (subscription.period) {
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + subscription.period);
    }
    const totalCredits = subscription.totalCredits;
    const usedCredits = 0;
    const promoId = promoCode ? (await PromoCode.findOne({ code: promoCode }))?._id : null;
    //create-record
    const mapping = await createMapping({
      userId: createdUser.id,
      subscriptionId,
      promoId,
      startDate,
      endDate,
      totalCredits,
      usedCredits,
      finalPrice,
      discountApplied
    });

    if(promoId){
      await PromoCode.findByIdAndUpdate(promoId, { $inc: { totalUsed: 1 } }, { new: true });
      logger.info(`PromoCode ${promoCode} usage incremented.`);
    }

    res.status(201).json({
      message: "User registered and subscription activated.",
      user: createdUser.email,
      subscription: mapping,
    });
  }),
];

const updateUserByAdmin = [
  asyncHandler(async (req, res) => {
    if (req.user.role.roleName !== "admin") {
      return res.status(403).json({ message: "Access denied: Admin only" });
    }
    const userIdToUpdate = req.params.id;
    let {
      fullName,
      email,
      password,
      status,
      organizationName,
      phoneNumber,
      areasOfInterest,
      currentRole,
      otherRole,
      country,
      contactSharing,
    } = req.body;

    // Uploaded profile image path (if any)
    const profileImage = req.file ? req.file.path : undefined;

    // Clean string fields
    if (email) email = email.trim().toLowerCase();
    if (fullName) fullName = fullName.trim();
    if (organizationName) organizationName = organizationName.trim();
    if (phoneNumber) phoneNumber = phoneNumber.trim();
    if (currentRole) currentRole = currentRole.trim();
    if (otherRole) otherRole = otherRole.trim();
    if (country) country = country.trim();
    if (contactSharing) contactSharing = contactSharing.trim();
    // Send to service
    const updatedUser = await updateUserByAdminService({
      userIdToUpdate,
      fullName,
      email,
      password,
      status,
      organizationName,
      profileImage,
      phoneNumber,
      areasOfInterest,
      currentRole,
      otherRole,
      country,
      contactSharing,
      adminId: req.user.id,
    });

    res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  }),
];

//ADMIN transaction interface
const userTransactions = [
  asyncHandler(async (req, res) => {
    const userType = req.user.role.roleName;
    if (userType !== "admin") {
      return res.status(403).json({ message: "Access denied: Admin only" });
    }
    const { page = 1, limit = 10, search = "", month = "All", fromDate, toDate } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const result = await getAllTransactions(
      userType,
      pageNumber,
      limitNumber,
      search,
      month,
      fromDate,
      toDate
    );
    res.status(200).json({
      message: "User transactions fetched successfully",
      ...result,
    });
  }),
];

//Employer interface transactions
const getMyTransactions = [
  asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { page = 1, limit = 10, search = "", month = "All", fromDate, toDate } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const result = await employerOwnTransactions(
      userId,
      pageNumber,
      limitNumber,
      search,
      month,
      fromDate,
      toDate
    );
    res.status(200).json({
      message: "User transactions fetched successfully",
      ...result,
    });
  }),
];

module.exports = {
  registerUser,
  userLogin,
  getUserProfile,
  getAllUsers,
  updateUserDetails,
  //deleteUserAccount,
  googleAuth,
  googleLogin,
  resetUserPassword,
  userSubscribeAndRegister,
  updateUserByAdmin,
  userTransactions,
  getMyTransactions
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
