const express = require('express');
const router = express.Router();
const {
  getMemberDashboard,
  getMemberAccounts,
  getMemberTransactions,
  getMemberLoans,
  getMemberCooperatives,
  getMemberProfile,
  updateMemberProfile
} = require('../controllers/memberController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// All member routes require authentication and member role
router.use(protect, authorizeRoles('member'));

router.get('/dashboard', getMemberDashboard);
router.get('/accounts', getMemberAccounts);
router.get('/transactions', getMemberTransactions);
router.get('/loans', getMemberLoans);
router.get('/cooperatives', getMemberCooperatives);
router.route('/profile')
  .get(getMemberProfile)
  .put(updateMemberProfile);

module.exports = router;
