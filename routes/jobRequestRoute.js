const express = require('express');
const router = express.Router();
const { createJobRequest, getAllJobRequests, getJobRequestById, getUserJobs} = require('../controllers/jobRequestController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/new', authMiddleware, createJobRequest);
router.get('/jobs', authMiddleware, getAllJobRequests);
router.get('jobs/:id', authMiddleware, getJobRequestById);
router.get('/my-jobs', authMiddleware, getUserJobs);
module.exports = router;