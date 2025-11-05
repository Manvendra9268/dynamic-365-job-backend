const express = require('express');
const router = express.Router();
const { registerUser, userLogin, getUserProfile, googleAuth, googleLogin, deleteUserAccount, resetUserPassword} = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: "uploads/", // local folder
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.post('/register',upload.single("profileImage"), registerUser);
router.post('/google', upload.single("profileImage"), googleAuth)
router.post('/login', userLogin);
router.post('/google-login', googleLogin);
router.post('/reset-password', authMiddleware, resetUserPassword);
router.get('/my-profile', authMiddleware, getUserProfile);
router.delete('/:id', authMiddleware, deleteUserAccount);

module.exports = router;