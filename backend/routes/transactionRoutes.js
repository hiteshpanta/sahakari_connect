const express = require('express');
const router = express.Router();
const { getTransactions, createTransaction, getTransactionById } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getTransactions)
  .post(protect, createTransaction);

router.route('/:id')
  .get(protect, getTransactionById);

module.exports = router;
