const Log = require('../models/Log');
const Customer = require('../models/Customer');
const { sendSms } = require('../services/smsService');
const { emitToCooperative, emitToAdmins } = require('../services/socketService');

// @desc    Send an SMS to a customer's phone number
// @route   POST /api/sms/send
// @access  Private (Manager / Staff / Admin)
exports.sendSms = async (req, res) => {
  try {
    const { phone, message, customerName } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ message: 'Phone number and message are required' });
    }

    let name = customerName;
    if (!name) {
      const customer = await Customer.findOne({ phone, cooperativeId: req.user.cooperativeId }).lean();
      name = customer ? customer.name : '';
    }

    let result;
    try {
      result = await sendSms({ phone, message });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }

    const now = new Date();
    const log = await Log.create({
      type: 'SMS',
      phone: result.to || phone,
      customerName: name || null,
      command: null,
      message,
      response: result.response,
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 8),
      status: result.status,
      cooperativeId: req.user.cooperativeId
    });

    if (!result.delivered) {
      return res.status(502).json({ message: 'SMS delivery failed', log });
    }

    res.status(201).json({
      success: true,
      message: 'SMS sent successfully',
      status: result.status,
      provider: result.provider,
      to: result.to || phone,
      log
    });
    emitToCooperative(req.user.cooperativeId, 'sms:sent', log);
    emitToAdmins('sms:sent', log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get SMS logs for the current cooperative
// @route   GET /api/sms/logs
// @access  Private
exports.getSmsLogs = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { cooperativeId: req.user.cooperativeId };
    const logs = await Log.find({ type: 'SMS', ...filter }).sort({ createdAt: -1 }).limit(50).lean();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
