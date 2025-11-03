const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, googleAuth} = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/google', googleAuth)
router.post('/login', loginUser);
router.get('/profile', authMiddleware, getUserProfile);

module.exports = router;