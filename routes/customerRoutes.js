const express = require('express');
const router = express.Router();
const { getCustomers, getCustomerById, createCustomer, updateCustomer, applyForMembership, updateCustomerStatus } = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Public route for membership application
router.post('/apply', applyForMembership);

router.route('/')
  .get(protect, getCustomers)
  .post(protect, authorizeRoles('manager', 'staff'), createCustomer);

router.route('/:id')
  .get(protect, getCustomerById)
  .put(protect, authorizeRoles('manager', 'staff'), updateCustomer);

router.put('/:id/status', protect, authorizeRoles('manager'), updateCustomerStatus);

module.exports = router;
