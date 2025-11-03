const { asyncHandler } = require('../utils/asyncHandler');
const { validateUser, validateLogin, validateUserId, handleValidationErrors } = require('../utils/validator');
const { createUser, loginUserAdmin, getUserById, updateUser, deleteUser } = require('../services/userService');

const registerUser = [
  validateUser,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    let {fullName, email, password, role, organizationName, organizationSize, founded, headquarters, organizationLinkedIn, organizationWebsite, phoneNumber, areasOfInterest, currentRole, country, contactSharing } = req.body;

    if (email) email = email.trim().toLowerCase();
    if (fullName) fullName = fullName.trim();
    if (organizationName) organizationName = organizationName.trim();
    if (headquarters) headquarters = headquarters.trim();
    if (organizationLinkedIn) organizationLinkedIn = organizationLinkedIn.trim();
    if (phoneNumber) phoneNumber = phoneNumber.trim();
    if (country) country = country.trim();
    if (currentRole) currentRole = currentRole.trim();
    if (Array.isArray(areasOfInterest)) {
      areasOfInterest = areasOfInterest.map(a => a.trim());
    }
    const user = await createUser({ fullName, email, password, role, organizationName, organizationSize, founded, headquarters, organizationLinkedIn, phoneNumber, areasOfInterest, currentRole, country, contactSharing });
    res.status(201).json({
      message: 'User registered successfully',
      data: { id: user._id, email, role: user.role },
    });
  }),
];

const loginUser = [
  validateLogin,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await loginUserAdmin({ email, password }, { ipAddress: req.ip });
    res.status(200).json(result);
  }),
];

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await getUserById(req.user.id, req.user);
  res.status(200).json({
    message: 'User profile fetched successfully',
    data: user
  });
});

const updateUserDetails = [
  validateUser,
  validateUserId,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const user = await updateUser(req.params.id, req.body, req.user);
    res.status(200).json({ message: 'User updated successfully', data: user });
  }),
];

const deleteUserAccount = [
  validateUserId,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    const user = await deleteUser(req.params.id, req.user);
    res.status(200).json({ message: 'User deleted successfully', data: user });
  }),
];

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserDetails,
  deleteUserAccount,
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