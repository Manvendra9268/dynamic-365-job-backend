const express = require('express');
const router = express.Router();
const { registerUser, userLogin, getUserProfile, googleAuth} = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/google', googleAuth)
router.post('/login', userLogin);
router.get('/profile', authMiddleware, getUserProfile);

module.exports = router;