const express = require('express');
const router = express.Router();
const { createPromoCode, allPromoCodes } = require('../controllers/promoCodeController');
const {authMiddleware} = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createPromoCode);
router.get('/', allPromoCodes);

module.exports = router;