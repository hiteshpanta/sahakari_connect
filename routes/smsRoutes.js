const express = require('express');
const router = express.Router();
const { sendSms, getSmsLogs } = require('../controllers/smsController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.post('/send', protect, authorizeRoles('manager', 'staff', 'admin'), sendSms);
router.get('/logs', protect, getSmsLogs);

module.exports = router;
