const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const LoginHistory = require("../models/LoginHistory");
const JobRequest = require("../models/JobRequest");
const logger = require("../utils/logger");
const Error = require("../utils/error");
const Role = require("../models/Role");
const UserSubscription = require("../models/userSubscription");
const { OAuth2Client } = require("google-auth-library");
const axios = require("axios");

const createUser = async ({
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
  otherRole,
  country,
  contactSharing,
  industry,
  profileImage,
}) => {
  // Check if email already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phoneNumber }],
  });
  if (existingUser) {
    const error = new Error(
      "User already exists with this email or Phone number. Please Login"
    );
    error.statusCode = 400;
    throw error;
  }

  // Fetch the role document
  const roleDoc = await Role.findById(role);
  if (!roleDoc) {
    const error = new Error("Invalid role ID provided.");
    error.statusCode = 400;
    throw error;
  }

  const roleName = roleDoc.roleName.toLowerCase();

  const userData = {
    email,
    password,
    fullName,
    role: roleDoc._id,
    phoneNumber,
  };
  if (profileImage?.trim()) userData.profileImage = profileImage.trim();
  // ✅ Employer-specific validation
  if (roleName === "employer") {
    if (organizationName?.trim())
      userData.organizationName = organizationName.trim();
    if (headquarters?.trim()) userData.headquarters = headquarters.trim();
    if (organizationSize?.trim())
      userData.organizationSize = organizationSize.trim();
    if (founded?.trim()) userData.founded = founded.trim();
    if (industry?.trim()) userData.industry = industry.trim();
    if (organizationLinkedIn?.trim())
      userData.organizationLinkedIn = organizationLinkedIn.trim();
    if (organizationWebsite?.trim())
      userData.organizationWebsite = organizationWebsite.trim();
  }

  // ✅ Jobseeker-specific validation
  if (roleName === "jobseeker") {
    if (!Array.isArray(areasOfInterest) || areasOfInterest.length === 0) {
      const error = new Error("Please select at least one area of interest.");
      error.statusCode = 400;
      throw error;
    }

    userData.areasOfInterest = areasOfInterest.map((a) => a.trim());
    if (currentRole) userData.currentRole = currentRole.trim();
    if (otherRole) userData.otherRole = otherRole.trim();
    if (country) userData.country = country.trim();
  }

  // ✅ Create user
  const user = new User(userData);
  await user.save();

  logger.info(`${roleName} created: ${email}`);

  return {
    id: user._id,
    email: user.email,
    role: roleName,
  };
};

const googleAuthService = async ({
  role,
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
}) => {
  const { data: payload } = await axios.get(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: { Authorization: `Bearer ${access_token}` },
    }
  );

  const email = payload.email;
  const finalFullName = fullName?.trim() || payload.name;
  const picture = profileImage?.trim() || payload.picture;

  // 2️⃣ Check if user exists
  let user = await User.findOne({ $or: [{ email }, { phoneNumber }] }).populate(
    "role",
    "roleName"
  );

  if (user) {
    const error = new Error(
      "User already exists with this email or Phone number. Please Login"
    );
    error.statusCode = 400;
    throw error;
  } else {
    // 3️⃣ Fetch role document
    const roleDoc = await Role.findById(role);
    if (!roleDoc) {
      const error = new Error("Invalid role ID provided.");
      error.statusCode = 400;
      throw error;
    }

    const roleName = roleDoc.roleName.toLowerCase();

    const userData = {
      email,
      fullName: finalFullName,
      password: null, // no password for Google users
      role: roleDoc._id,
      phoneNumber,
    };
    if (picture?.trim()) userData.profileImage = picture.trim();
    // ✅ Employer-specific validation
    if (roleName === "employer") {
      if (organizationName?.trim())
        userData.organizationName = organizationName.trim();
      if (headquarters?.trim()) userData.headquarters = headquarters.trim();
      if (organizationSize?.trim())
        userData.organizationSize = organizationSize.trim();
      if (founded?.trim()) userData.founded = founded.trim();
      if (industry?.trim()) userData.industry = industry.trim();
      if (organizationLinkedIn?.trim())
        userData.organizationLinkedIn = organizationLinkedIn.trim();
      if (organizationWebsite?.trim())
        userData.organizationWebsite = organizationWebsite.trim();
    }
    // ✅ Jobseeker-specific validation
    if (roleName === "jobseeker") {
      if (!Array.isArray(areasOfInterest) || areasOfInterest.length === 0) {
        const error = new Error("Please select at least one area of interest.");
        error.statusCode = 400;
        throw error;
      }

      userData.areasOfInterest = areasOfInterest.map((a) => a.trim());
      if (currentRole) userData.currentRole = currentRole.trim();
      if (otherRole) userData.otherRole = otherRole.trim();
      if (country) userData.country = country.trim();
    }

    // 4️⃣ Create new Google user
    user = new User(userData);
    await user.save();
    await user.populate("role", "roleName");

    logger.info(`New Google user created: ${email}`);
  }

  // 5️⃣ Generate JWT
  const jwtToken = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // 6️⃣ Return token and user info
  return {
    token: jwtToken,
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role?.roleName,
    },
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).populate("role", "roleName");
  if (!user) {
    throw new Error("User does not exist.", 401);
  }
  if (user.status !== "1") {
    throw new Error("User account is not active. Please contact support.", 403);
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials", 401);
  }
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
  //await LoginHistory.create({ userId: user._id, phone: user.phoneNumber});
  await LoginHistory.findOneAndUpdate(
    { userId: user._id },
    { $set: { loginAt: new Date(), phone: user.phoneNumber } },
    {
      upsert: true,
      new: true,
    }
  );
  logger.info(`User logged in with email: ${email}`);
  return { id: user._id, email: user.email, role: user.role, token: token };
};

const googleLoginService = async ({ access_token }) => {
  const { data: payload } = await axios.get(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: { Authorization: `Bearer ${access_token}` },
    }
  );
  const email = payload.email;
  let user;
  user = await User.findOne({ email }).populate("role", "roleName");
  if (!user) {
    throw new Error("User not found, please register first", 404);
  }
  if (user.status !== "1") {
    throw new Error("User account is not active. Please contact support.", 403);
  }
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
  //await LoginHistory.create({ userId: user._id, phone: user.phoneNumber });
  await LoginHistory.findOneAndUpdate(
    { userId: user._id },
    { $set: { loginAt: new Date(), phone: user.phoneNumber } },
    {
      upsert: true,
      new: true,
    }
  );
  logger.info(`User logged in via Google: ${email}`);
  return {
    user: { id: user._id, email: user.email, role: user.role.roleName },
    token: token,
  };
};

const resetPasswordService = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    logger.error(`User not found for ID: ${userId}`);
    throw new Error("User not found", 404);
  }
  // Verify old password
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    logger.warn(`Invalid old password for user ID: ${userId}`);
    throw new Error("Old password is incorrect", 400);
  }
  user.password = newPassword;
  await user.save();

  logger.info(`Password updated successfully for userID: ${userId}`);
  return { message: "Password updated successfully." };
};

const getAllUsersService = async (
  userType,
  roleName,
  pageNumber,
  limitNumber
) => {
  try {
    // ADMIN CHECK
    if (userType !== "admin") {
      logger.warn(
        `${userType} attempted to access all-users without admin rights`
      );
      throw new Error("Access denied: Admin only", 403);
    }

    const query = {};
    const skip = (pageNumber - 1) * limitNumber;

    // Role filter
    if (roleName) {
      const role = await Role.findOne({ roleName: roleName.toLowerCase() });
      if (!role) throw new Error(`Role not found`, 404);
      query.role = role._id;
    }

    const users = await User.findWithDeleted(query)
      .populate("role", "roleName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean();

    const total = await User.countDocumentsWithDeleted(query);
    const totalPages = Math.ceil(total / limitNumber);
    // Get all userIds from fetched users
    const userIds = users.map((u) => u._id);

    // Fetch last login history for all users in ONE query
    const loginHistory = await LoginHistory.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $sort: { loginAt: -1 } },
      {
        $group: {
          _id: "$userId",
          lastActive: { $first: "$loginAt" }
        }
      }
    ]);

    // Convert to map for fast lookup
    const loginMap = {};
    loginHistory.forEach((lh) => {
      loginMap[lh._id.toString()] = lh.lastActive;
    });

    // Attach lastActive field to users
    const usersWithLastActive = users.map((user) => ({
      ...user,
      lastActive: loginMap[user._id.toString()] || null,
    }));
    logger.info("Admin fetched users list");

    return {
      data: usersWithLastActive,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalItems: total,
        limitNumber,
      },
    };
  } catch (error) {
    logger.error("Error fetching users:", error);
    throw new Error(error.message || "Failed to fetch users", 500);
  }
};

const getUserById = async (userId, requestingUser) => {
  const user = await User.findOne({ _id: userId }).populate("role", "roleName").lean();
  if (!user) {
    throw new Error("User not found", 404);
  }

  if (requestingUser.id !== userId) {
    throw new Error("Unauthorized to access this user", 403);
  }

  const loginHistory = await LoginHistory.findOne({ userId })
    .sort({ loginAt: -1 })
    .lean();
  const lastActive = loginHistory?.loginAt || null;

  return {
    message: "User fetched successfully",
    data: {
      ...user,
      lastActive,
    },
  };
};

const updateUser = async ({
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
  otherRole,
  country,
  contactSharing,
  industry,
  profileImage,
  userId,
}) => {
  const existingUser = await User.findOne({
    $or: [{ email }, { phoneNumber }],
    _id: { $ne: userId },
  });
  if (existingUser) {
    const error = new Error(
      "User already exists with this email or Phone number."
    );
    error.statusCode = 400;
    throw error;
  }

  // Fetch the role document
  const roleDoc = await Role.findById(role);
  if (!roleDoc) {
    const error = new Error("Invalid role ID provided.");
    error.statusCode = 400;
    throw error;
  }

  const roleName = roleDoc.roleName.toLowerCase();

  const userData = {
    email,
    password,
    fullName,
    role: roleDoc._id,
    phoneNumber,
  };
  if (profileImage !== undefined) {
    if (profileImage.trim() === "") {
      // If explicitly an empty string, remove it from DB
      userData.profileImage = "";
    } else {
      // If valid path, update it
      userData.profileImage = profileImage.trim();
    }
  }

  // ✅ Employer-specific validation
  if (roleName === "employer") {
    userData.organizationName = organizationName?.trim() || "";
    userData.headquarters = headquarters?.trim() || "";
    userData.organizationSize = organizationSize?.trim() || "";
    userData.founded = founded?.trim() || "";
    userData.industry = industry?.trim() || "";
    userData.organizationLinkedIn = organizationLinkedIn?.trim() || "";
    userData.organizationWebsite = organizationWebsite?.trim() || "";
  }
  // ✅ Jobseeker-specific validation
  if (roleName === "jobseeker") {
    if (!Array.isArray(areasOfInterest) || areasOfInterest.length === 0) {
      const error = new Error("Please select at least one area of interest.");
      error.statusCode = 400;
      throw error;
    }

    userData.areasOfInterest = areasOfInterest.map((a) => a.trim());
    if (currentRole) userData.currentRole = currentRole.trim();
    if (otherRole) userData.otherRole = otherRole.trim();
    if (country) userData.country = country.trim();
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: userData },
    { new: true }
  );
  if (!user) {
    throw new Error("User not found", 404);
  }
  logger.info(`User updated: ${email}`);
  return user;
};

const updateUserByAdminService = async ({
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
  adminId,
}) => {
  // Check duplicate email or phoneNumber
  const conditions = [];
  if (email) conditions.push({ email });
  if (phoneNumber) conditions.push({ phoneNumber });

  if (conditions.length) {
    const existingUser = await User.findOne({
      _id: { $ne: userIdToUpdate },
      $or: conditions,
    });

    if (existingUser) {
      throw new Error(
        "User already exists with this email or Phone number."
      , 400);
    }
  }

  const allowedStatuses = [0, 1, 2];
  if (status !== undefined && !allowedStatuses.includes(Number(status))) {
    throw new Error("Invalid status value. Allowed values: 0, 1, 2", 400);
  }

  const userData = {};

  if (fullName !== undefined) userData.fullName = fullName;
  if (email !== undefined) userData.email = email;
  if (password !== undefined) userData.password = password;
  if (status !== undefined) userData.status = Number(status);
  if (organizationName !== undefined) userData.organizationName = organizationName;
  if (phoneNumber !== undefined) userData.phoneNumber = phoneNumber;
  if (profileImage !== undefined) {
    userData.profileImage = profileImage.trim();
  }
  if (areasOfInterest !== undefined) {
    if (!Array.isArray(areasOfInterest)) {
      throw new Error("areasOfInterest must be an array.", 400);
    }
    userData.areasOfInterest = areasOfInterest.map(a => a.trim());
  }
  if (currentRole !== undefined) userData.currentRole = currentRole;
  if (otherRole !== undefined) userData.otherRole = otherRole;
  if (country !== undefined) userData.country = country;
  if (contactSharing !== undefined) userData.contactSharing = contactSharing;

  const updatedUser = await User.findByIdAndUpdate(
    userIdToUpdate,
    { $set: userData },
    { new: true }
  ).populate("role", "roleName");

  if (!updatedUser) {
    throw new Error("User not found", 404);
  }

  logger.info(`Admin ${adminId} updated user ${updatedUser.email}`);

  return updatedUser;
};

const softDeleteUser = async (id, deletedByUserId) => {
  const user = await User.findById(id);
  if (!user) {
    logger.error(`User not found for ID: ${id}`);
    throw new Error("User not found", 404);
  }
  await User.findByIdAndUpdate(id, { status: "2" }); // Set status to 'Suspended'
  await User.deleteById(id, deletedByUserId);
  logger.info(`User ${id} soft deleted by ${deletedByUserId}`);
  return { message: "User deleted successfully", userId: id };
};

const createMapping = async ({
  userId,
  subscriptionId,
  startDate,
  endDate,
  totalCredits,
  usedCredits,
}) => {
  // find existing subscription for this user
  const existingRecord = await UserSubscription.findOne({ userId });

  if (existingRecord) {
    // just update total credits (add to existing)
    existingRecord.totalCredits = totalCredits;
    existingRecord.usedCredits = usedCredits;
    await existingRecord.save();
    return existingRecord;
  }

  // create new subscription record
  const newRecord = await UserSubscription.create({
    userId,
    subscriptionId,
    startDate,
    endDate,
    totalCredits,
    usedCredits: 0,
  });

  return newRecord;
};

const getAllTransactions = async (userType, pageNumber, limitNumber) => {
  try {
    // ADMIN CHECK
    if (userType !== "admin") {
      logger.warn(`${userType} tried to fetch transactions without admin rights`);
      throw new Error("Access denied: Admin only", 403);
    }

    const skip = (pageNumber - 1) * limitNumber;
    // Fetch raw subscriptions with pagination
    const subscriptions = await UserSubscription.find()
      .populate("userId", "fullName organizationName")
      .populate("subscriptionId", "price name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean();

    const total = await UserSubscription.countDocuments();
    const totalPages = Math.ceil(total / limitNumber);
    const currentDate = new Date();

    // Format response items
    const formattedData = subscriptions.map((item) => {
      const { userId, subscriptionId, startDate, endDate } = item;

      let status = "Completed";
      if (endDate && endDate >= currentDate) {
        status = "Active";
      }

      return {
        employerName: userId?.fullName || null,
        organizationName: userId?.organizationName || null,
        amount: subscriptionId?.price || null,
        subscriptionType: subscriptionId?.name || null,
        purchaseDate: startDate || null,
        renewalDate: endDate || null,
        status,
        paymentMethod: "Stripe",
      };
    });
    logger.info("Admin fetched user transactions list");
    return {
      data: formattedData,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalItems: total,
        limitNumber,
      },
    };
  } catch (error) {
    logger.error("Error fetching user transactions:", error);
    throw new Error("Failed to fetch user transactions", 500);
  }
};

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
  googleAuthService,
  loginUser,
  googleLoginService,
  getUserById,
  resetPasswordService,
  softDeleteUser,
  updateUser,
  createMapping,
  getAllUsersService,
  updateUserByAdminService,
  getAllTransactions
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
