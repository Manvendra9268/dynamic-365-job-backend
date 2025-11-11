const express = require('express');
const router = express.Router();
const { createJobRequest, getAllJobRequests, getJobRequestById, getUserJobs, updateJobDetails, postJobAndSubscribe, updateJobDetailsByAdmin} = require('../controllers/jobRequestController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/new', authMiddleware, createJobRequest);
router.post('/sub-post', authMiddleware, postJobAndSubscribe);
router.get('/jobs', authMiddleware, getAllJobRequests);
router.get('/my-jobs', authMiddleware, getUserJobs);
router.get('/:id', authMiddleware, getJobRequestById);
router.put('/:id', authMiddleware, updateJobDetails);
router.put('/admin-update-job/:id',authMiddleware,updateJobDetailsByAdmin)

module.exports = router;