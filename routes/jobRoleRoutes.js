const express = require('express');
const router = express.Router();
const { createJobRole, getAllJobRoles } = require('../controllers/jobRoleController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createJobRole);
router.get('/', getAllJobRoles);

module.exports = router;