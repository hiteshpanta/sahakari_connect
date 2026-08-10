const express = require('express');
const router = express.Router();
const {
  getLoans,
  getLoanById,
  createLoan,
  applyForLoan,
  updateLoanStatus,
  approveLoan,
  predictEligibility
} = require('../controllers/loanController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.route('/apply')
  .post(protect, authorizeRoles('member'), applyForLoan);

router.route('/predict')
  .post(protect, predictEligibility);

router.route('/')
  .get(protect, getLoans)
  .post(protect, authorizeRoles('manager', 'staff'), createLoan);

router.route('/:id/status')
  .put(protect, authorizeRoles('manager'), updateLoanStatus);

router.route('/:id/approve')
  .put(protect, authorizeRoles('manager'), approveLoan);

router.route('/:id')
  .get(protect, getLoanById);

module.exports = router;
