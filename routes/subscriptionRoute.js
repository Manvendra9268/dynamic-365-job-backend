const express = require('express');
const router = express.Router();
const { createSubcription, getAllSubscriptions, getSubscriptionByUser } = require('../controllers/subscriptionController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/add', authMiddleware, createSubcription);
router.get('/plans', getAllSubscriptions);
router.get('/user-subscriptions', authMiddleware, getSubscriptionByUser)
module.exports = router;