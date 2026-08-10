const express = require('express');
const router = express.Router();
const { getBranches, createBranch } = require('../controllers/branchController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.route('/')
  .get(protect, getBranches)
  .post(protect, authorizeRoles('manager'), createBranch);

module.exports = router;
