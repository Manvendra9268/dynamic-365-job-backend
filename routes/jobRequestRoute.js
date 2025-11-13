const express = require('express');
const router = express.Router();
const { createJobRequest, getAllJobRequests, getJobRequestById, getUserJobs, updateJobDetails, postJobAndSubscribe, updateJobDetailsByAdmin, getAdminDashboardStats} = require('../controllers/jobRequestController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/admin-stats', authMiddleware, getAdminDashboardStats);
router.post('/new', authMiddleware, createJobRequest);
router.post('/sub-post', authMiddleware, postJobAndSubscribe);
router.get('/jobs', getAllJobRequests);
router.get('/my-jobs', authMiddleware, getUserJobs);
router.put('/admin-update-job/:id',authMiddleware,updateJobDetailsByAdmin)
router.put('/:id', authMiddleware, updateJobDetails);
router.get('/:id', getJobRequestById);

module.exports = router;