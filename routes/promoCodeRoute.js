const express = require('express');
const router = express.Router();
const { createPromoCode, allPromoCodes, updatePromoCode, applyPromoCode } = require('../controllers/promoCodeController');
const {authMiddleware} = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createPromoCode);
router.post('/apply', applyPromoCode);
router.get('/', allPromoCodes);
router.put('/:id', authMiddleware, updatePromoCode);

module.exports = router;