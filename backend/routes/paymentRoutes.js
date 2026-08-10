const express = require('express');
const router = express.Router();
const { createPaymentIntent, completeEsewaPayment, getPaymentHistory } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/intent', createPaymentIntent);
router.post('/esewa/complete', completeEsewaPayment);
router.get('/history', getPaymentHistory);

module.exports = router;
