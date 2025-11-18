const express = require('express');
const router = express.Router();
const { createPromoCode, allPromoCodes, updatePromoCode } = require('../controllers/promoCodeController');
const {authMiddleware} = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createPromoCode);
router.get('/', allPromoCodes);
router.put('/:id', authMiddleware, updatePromoCode);

module.exports = router;