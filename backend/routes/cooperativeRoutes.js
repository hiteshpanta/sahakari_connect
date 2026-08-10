const express = require('express');
const router = express.Router();
const {
  getCooperatives,
  getCooperativeById,
  createCooperative,
  updateCooperative,
  updateCooperativeStatus,
  deleteCooperative,
  getAdminAnalytics,
  getPublicCooperatives,
  getPublicCooperativeProfile,
  getCooperativeReviews,
  submitCooperativeRating,
  updateCooperativeProfile,
  getMyCooperative,
  updateMyCooperative
} = require('../controllers/cooperativeController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Public Marketplace Routes
router.get('/public', getPublicCooperatives);
router.get('/public/:id', getPublicCooperativeProfile);
router.get('/public/:id/reviews', getCooperativeReviews);

// Authenticated users can rate/review a cooperative
router.post('/:id/ratings', protect, submitCooperativeRating);

// Protected Tenant Route (Profile Update)
// Tenant Admin can update their own profile
router.put('/:id/profile', protect, updateCooperativeProfile);

// Manager-scoped routes: a manager can view/edit ONLY their own cooperative
router.get('/me', protect, authorizeRoles('manager'), getMyCooperative);
router.put('/me', protect, authorizeRoles('manager'), updateMyCooperative);

// Admin only routes below
router.use(protect, authorizeRoles('admin'));

router.get('/analytics', getAdminAnalytics);

router.route('/')
  .get(getCooperatives)
  .post(createCooperative);

router.route('/:id')
  .get(getCooperativeById)
  .put(updateCooperative)
  .delete(deleteCooperative);

router.put('/:id/status', updateCooperativeStatus);

module.exports = router;
