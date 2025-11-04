const express = require('express');
const router = express.Router();
const { createSubcription } = require('../controllers/subscriptionController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/add', authMiddleware, createSubcription);

module.exports = router;