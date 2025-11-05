const express = require('express');
const router = express.Router();
const { createSubcription, getAllSubscriptions } = require('../controllers/subscriptionController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/add', authMiddleware, createSubcription);
router.get('/plans', getAllSubscriptions);

module.exports = router;