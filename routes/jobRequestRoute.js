const express = require('express');
const router = express.Router();
const { createJobRequest, getAllJobRequests, getJobRequestById } = require('../controllers/jobRequestController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/new', authMiddleware, createJobRequest);
router.get('/jobs', authMiddleware, getAllJobRequests);
router.get('jobs/:id', authMiddleware, getJobRequestById);

module.exports = router;