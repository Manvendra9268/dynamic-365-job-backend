const express = require('express');
const router = express.Router();
const { createJobRole } = require('../controllers/jobRoleController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/add', authMiddleware, createJobRole);

module.exports = router;