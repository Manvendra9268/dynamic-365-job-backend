const express = require('express');
const router = express.Router();
const { createJobRequest, getAllJobRequests, getJobRequestById, getUserJobs, updateJobDetails} = require('../controllers/jobRequestController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/new', authMiddleware, createJobRequest);
router.get('/jobs', authMiddleware, getAllJobRequests);
router.get('/my-jobs', authMiddleware, getUserJobs);
router.get('/:id', authMiddleware, getJobRequestById);
router.put('/:id', authMiddleware, updateJobDetails);

module.exports = router;