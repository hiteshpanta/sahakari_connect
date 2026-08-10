const express = require('express');
const router = express.Router();
const {
  getWithdrawalRequests,
  createWithdrawalRequest,
  approveWithdrawalRequest,
  rejectWithdrawalRequest
} = require('../controllers/withdrawalController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.route('/')
  .get(protect, getWithdrawalRequests)
  .post(protect, createWithdrawalRequest);

router.put('/:id/approve', protect, authorizeRoles('manager'), approveWithdrawalRequest);
router.put('/:id/reject', protect, authorizeRoles('manager'), rejectWithdrawalRequest);

module.exports = router;
