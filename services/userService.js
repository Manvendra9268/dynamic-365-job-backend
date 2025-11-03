const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const Error = require('../utils/error');

const createUser = async ({
  fullName, email, password, role, organizationName, organizationSize, founded, headquarters, organizationLinkedIn, organizationWebsite, phoneNumber, areasOfInterest, currentRole, country, contactSharing
}) => {
  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error("User already exists with this email.");
    error.statusCode = 400;
    throw error;
  }

  // Base user data
  const userData = {
    email,
    password,
    fullName,
    role,
    phoneNumber
  };

  // Employer-specific validation
  if (role === "employer") {
    if (!organizationName?.trim()) {
      const error = new Error("Organization name is required for employers.");
      error.statusCode = 400;
      throw error;
    }
    if (!headquarters?.trim()) {
      const error = new Error("Headquarters is required for employers.");
      error.statusCode = 400;
      throw error;
    }
    if (!organizationSize?.trim()){
      const error = new Error("Organization size is required for employers.");
      error.statusCode = 400;
      throw error;
    }
    if(!founded?.trim()){
      const error = new Error("Founded year is required for employers.");
      error.statusCode = 400;
      throw error;
    }
    if (organizationLinkedIn?.trim()){
      userData.organizationLinkedIn = organizationLinkedIn;
    }
    if (organizationWebsite?.trim()){
      userData.organizationWebsite = organizationWebsite;
    }
    userData.organizationSize = organizationSize;
    userData.founded = founded;
    userData.headquarters =headquarters;
    userData.organizationName = organizationName;
  }

  // jobseeker–specific validation
  if (role === "jobseeker") {
    if (!Array.isArray(areasOfInterest) || areasOfInterest.length === 0) {
      const error = new Error("Please select at least one area of interest.");
      error.statusCode = 400;
      throw error;
    }

    userData.areasOfInterest = areasOfInterest;
    if (currentRole) userData.currentRole = currentRole;
    if (phoneNumber) userData.phoneNumber = phoneNumber;
    if (country) userData.country = country;
    if (typeof contactSharing === 'boolean') userData.contactSharing = contactSharing;
  }

  // Create and save user
  const user = new User(userData);
  await user.save();

  logger.info(`${role.charAt(0).toUpperCase() + role.slice(1)} created: ${email}`);

  return {
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  };
};



// const loginUserAdmin = async ({ email, password }) => {
//   const user = await User.findOne({ email}).select('+password');
//   if (!user) {
//     throw new Error('Invalid credentials', 401);
//   }
//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) {
//     throw new Error('Invalid credentials', 401);
//   }
//   const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
//     expiresIn: '24h',
//   });

//   return { token, data: { id: user._id, email: user.email, role: user.role } };
// };

// const getUserById = async (userId, requestingUser) => {
//   const user = await User.findOne({ _id: userId, deleted_at: null }).select('-password -otp -otpExpires');
//   if (!user) {
//     throw new Error('User not found', 404);
//   }

//   if (requestingUser.role !== 'Admin' && requestingUser.id !== userId) {
//     throw new Error('Unauthorized to access this user', 403);
//   }

//   return {
//     message: 'User fetched successfully',
//     data: user
//   };
// };

// const updateUser = async (userId, updates, requestingUser) => {
//   if (requestingUser.role !== 'Admin' && requestingUser.id !== userId) {
//     throw new Error('Unauthorized to update this user', 403);
//   }

//   const allowedUpdates = ['first_name', 'last_name', 'phone', 'email', 'location', 'state', 'city', 'address', 'role'];
//   const updateKeys = Object.keys(updates);
//   const isValidUpdate = updateKeys.every(key => allowedUpdates.includes(key));
//   if (!isValidUpdate) {
//     throw new Error('Invalid update fields', 400);
//   }

//   const user = await User.findOne({ _id: userId, deleted_at: null }).select('+password +otp +otpExpires');
//   if (!user) {
//     throw new Error('User not found', 404);
//   }

//   updateKeys.forEach(key => {
//     user[key] = updates[key];
//   });
//   await user.save();
//   logger.info(`User updated: ${user.phone}`);
//   return user;
// };

// const deleteUser = async (userId, requestingUser) => {
//   if (requestingUser.role !== 'Admin' && requestingUser.id !== userId) {
//     throw new Error('Unauthorized to delete this user', 403);
//   }

//   const user = await User.findOne({ _id: userId, deleted_at: null });
//   if (!user) {
//     throw new Error('User not found', 404);
//   }

//   user.deleted_at = new Date();
//   user.isActive = false;
//   await user.save();
//   logger.info(`User soft-deleted: ${user.phone}`);
//   return user;
// };

module.exports = {
  createUser,
  // loginUserAdmin,
  // getUserById,
  // updateUser,
  // deleteUser,
};


// const generateOtp = async (phone) => {
//   const user = await User.findOne({ phone, deleted_at: null }).select('+otp +otpExpires');
//   if (!user) {
//     throw new Error('User not found', 404);
//   }
//   if (!user.isActive) {
//     throw new Error('Unauthorized: User is inactive', 403);
//   }

//   const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
//   const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

//   user.otp = otp;
//   user.otpExpires = otpExpires;
//   await user.save();

//   logger.info(`OTP generated for phone: ${phone}`);
//   return { message: 'OTP generated successfully', otp }; // OTP returned for testing; in production, send via SMS/email
// };

// const verifyOtp = async ({ phone, otp }, { ipAddress }) => {
//   const user = await User.findOne({ phone, deleted_at: null }).select('+otp +otpExpires');
//   if (!user) {
//     throw new Error('User not found', 404);
//   }
//   if (!user.isActive) {
//     throw new Error('Unauthorized: User is inactive', 403);
//   }

//   if (!user.otp || !user.otpExpires) {
//     throw new Error('No OTP found for this user', 400);
//   }

//   if (user.otpExpires < new Date()) {
//     throw new Error('OTP has expired', 400);
//   }

//   const isMatch = await bcrypt.compare(otp, user.otp);
//   if (!isMatch) {
//     throw new Error('Invalid OTP', 400);
//   }

//   // Clear OTP and otpExpires after successful verification
//   user.otp = undefined;
//   user.otpExpires = undefined;
//   await user.save();

//   await LoginHistory.create({
//     userId: user._id,
//     phone: user.phone,
//     ipAddress,
//   });

//   const token = jwt.sign({ id: user._id, phone: user.phone, role: user.role }, process.env.JWT_SECRET, {
//     expiresIn: '1h',
//   });
//   logger.info(`User logged in via OTP: ${phone} from IP ${ipAddress || 'unknown'}`);

//   return { token, data: { id: user._id, phone: user.phone, email: user.email, role: user.role } };
// };

// const resendOtp = async (phone) => {
//   const user = await User.findOne({ phone, deleted_at: null }).select('+otp +otpExpires');
//   if (!user) {
//     throw new Error('User not found', 404);
//   }
//   if (!user.isActive) {
//     throw new Error('Unauthorized: User is inactive', 403);
//   }

//   const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
//   const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

//   user.otp = otp;
//   user.otpExpires = otpExpires;
//   await user.save();

//   logger.info(`OTP resent for phone: ${phone}`);
//   return { message: 'OTP resent successfully', otp }; // OTP returned for testing; in production, send via SMS/email
// };

// const getAllUsers = async (page = 1, limit = 10, requestingUser) => {
//   if (requestingUser.role !== 'Admin') {
//     throw new Error('Unauthorized to access all users', 403);
//   }

//   const skip = (page - 1) * limit;
//   const count = await User.countDocuments({ deleted_at: null });
//   const users = await User.find({ deleted_at: null })
//     .select('-password -otp -otpExpires')
//     .skip(skip)
//     .limit(limit)
//     .sort({ created_at: -1 });

//   const totalPages = Math.ceil(count / limit);

//   logger.info(`Fetched ${users.length} users for page ${page}, limit ${limit}`);
//   return {
//     message: 'Users fetched successfully',
//     data: users,
//     pagination: {
//       currentPage: page,
//       totalPages,
//       totalItems: count,
//       limit,
//     },
//   };
// };

// const enableUser = async (userId, requestingUser) => {
//   if (requestingUser.role !== 'Admin') {
//     throw new Error('Unauthorized to enable user', 403);
//   }

//   const user = await User.findOne({ _id: userId, deleted_at: null });
//   if (!user) {
//     throw new Error('User not found', 404);
//   }

//   if (user.isActive) {
//     throw new Error('User is already enabled', 400);
//   }

//   user.isActive = true;
//   await user.save();
//   logger.info(`User enabled: ${user.phone}`);
//   return user;
// };

// const disableUser = async (userId, requestingUser) => {
//   if (requestingUser.role !== 'Admin') {
//     throw new Error('Unauthorized to disable user', 403);
//   }

//   const user = await User.findOne({ _id: userId, deleted_at: null });
//   if (!user) {
//     throw new Error('User not found', 404);
//   }

//   if (!user.isActive) {
//     throw new Error('User is already disabled', 400);
//   }

//   user.isActive = false;
//   await user.save();
//   logger.info(`User disabled: ${user.phone}`);
//   return user;
// };

// const getLoginHistory = async (userId) => {
//   const history = await LoginHistory.find()
//     .sort({ loginAt: -1 })
//     .limit(50);
//   return history;
// };