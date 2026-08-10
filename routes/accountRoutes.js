const express = require('express');
const router = express.Router();
const { getAccounts, getAccountById, createAccount } = require('../controllers/accountController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getAccounts)
  .post(protect, createAccount);

router.route('/:id')
  .get(protect, getAccountById);

module.exports = router;
