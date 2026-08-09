const Customer = require('../models/Customer');
const { emitToCooperative, emitToAdmins, emitToUser } = require('../services/socketService');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
exports.getCustomers = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { cooperativeId: req.user.cooperativeId };
    const customers = await Customer.find(filter);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (customer) {
      res.json(customer);
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a customer
// @route   POST /api/customers
// @access  Private (Manager/Admin)
exports.createCustomer = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      req.body.cooperativeId = req.user.cooperativeId;
    }
    const customer = new Customer(req.body);
    const createdCustomer = await customer.save();
    res.status(201).json(createdCustomer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Private (Manager/Admin)
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (customer) {
      Object.assign(customer, req.body);
      const updatedCustomer = await customer.save();
      res.json(updatedCustomer);
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Submit a public membership application
// @route   POST /api/customers/apply
// @access  Public
exports.applyForMembership = async (req, res) => {
  try {
    const { userId, cooperativeId } = req.body;

    // Allow a user to join MULTIPLE cooperatives, but block duplicate applications
    // to the same cooperative from the same user.
    if (userId) {
      const existing = await Customer.findOne({
        userId,
        cooperativeId,
        status: { $in: ['pending_approval', 'on_hold', 'active'] }
      });
      if (existing) {
        return res.status(400).json({
          message: existing.status === 'active'
            ? 'You are already a member of this cooperative'
            : 'You already have a pending application for this cooperative'
        });
      }
    }

    const applicationData = {
      ...req.body,
      status: 'pending_approval'
    };
    const customer = new Customer(applicationData);
    const createdCustomer = await customer.save();
    res.status(201).json(createdCustomer);
    emitToCooperative(createdCustomer.cooperativeId, 'membership:applied', createdCustomer);
    emitToAdmins('membership:applied', createdCustomer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update customer status (approve/reject application)
// @route   PUT /api/customers/:id/status
// @access  Private (Admin)
exports.updateCustomerStatus = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, cooperativeId: req.user.cooperativeId };
    
    const customer = await Customer.findOne(filter);
    
    if (customer) {
      customer.status = status;
      if (rejectionReason) customer.rejectionReason = rejectionReason;
      const updatedCustomer = await customer.save();

      // When a membership application is approved, link the platform user
      // to this customer so they can log in to the member portal.
      // A user can be a member of MULTIPLE cooperatives: every approved
      // cooperative is added to `user.cooperatives`, while `cooperativeId` /
      // `customerId` keep pointing at the user's first (active) portal.
      if (status === 'active') {
        // Every approved member automatically gets a savings account number.
        const { getOrCreateSavingsAccount } = require('../services/accountService');
        await getOrCreateSavingsAccount(customer, customer.cooperativeId);

        if (customer.userId) {
          const User = require('../models/User');
          const user = await User.findById(customer.userId);
          if (user) {
            user.role = 'member';
            user.status = 'active';
            user.isVerified = true;
            if (!(user.cooperatives || []).some(id => id.toString() === customer.cooperativeId.toString())) {
              user.cooperatives.push(customer.cooperativeId);
            }
            if (!user.customerId) user.customerId = customer._id;
            if (!user.cooperativeId) user.cooperativeId = customer.cooperativeId;
            await user.save();
          }
        }
      }

      res.json(updatedCustomer);
      emitToCooperative(updatedCustomer.cooperativeId, 'membership:updated', updatedCustomer);
      emitToAdmins('membership:updated', updatedCustomer);
      if (updatedCustomer.userId) {
        emitToUser(updatedCustomer.userId, 'membership:updated', updatedCustomer);
      }
    } else {
      res.status(404).json({ message: 'Customer or application not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
