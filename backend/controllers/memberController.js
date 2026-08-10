const Customer = require('../models/Customer');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Loan = require('../models/Loan');
const { resolveMemberContext } = require('../services/memberService');
const { getOrCreateSavingsAccount } = require('../services/accountService');

// @desc    Get member dashboard summary
// @route   GET /api/member/dashboard
// @access  Private (member only)
exports.getMemberDashboard = async (req, res) => {
  try {
    const ctx = await resolveMemberContext(req.user, req.query.cooperativeId);
    if (!ctx) {
      return res.status(400).json({ message: 'No active membership found for this cooperative' });
    }
    const { customerId, cooperativeId } = ctx;

    const [customer, memberAccounts, recentTransactions, memberLoans] = await Promise.all([
      Customer.findOne({ _id: customerId, cooperativeId }).populate('cooperativeId', 'name'),
      Account.find({ customerId, cooperativeId }),
      Transaction.find({ customerId, cooperativeId }).sort({ createdAt: -1 }).limit(5),
      Loan.find({ customerId, cooperativeId })
    ]);

    const totalBalance = memberAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const activeLoans = memberLoans.filter(l => l.status === 'active');
    const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.outstanding, 0);

    res.json({
      customer,
      cooperativeId,
      summary: {
        totalAccounts: memberAccounts.length,
        totalBalance,
        activeLoans: activeLoans.length,
        totalOutstanding,
        savingsAccounts: memberAccounts.filter(a => a.type === 'Savings').length,
      },
      recentTransactions,
      accounts: memberAccounts,
      loans: memberLoans
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get member's accounts for the active cooperative
// @route   GET /api/member/accounts
// @access  Private (member only)
exports.getMemberAccounts = async (req, res) => {
  try {
    const ctx = await resolveMemberContext(req.user, req.query.cooperativeId);
    if (!ctx) {
      return res.status(400).json({ message: 'No active membership found for this cooperative' });
    }
    const memberAccounts = await Account.find({ customerId: ctx.customerId, cooperativeId: ctx.cooperativeId });
    res.json(memberAccounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get member's transactions for the active cooperative
// @route   GET /api/member/transactions
// @access  Private (member only)
exports.getMemberTransactions = async (req, res) => {
  try {
    const ctx = await resolveMemberContext(req.user, req.query.cooperativeId);
    if (!ctx) {
      return res.status(400).json({ message: 'No active membership found for this cooperative' });
    }
    const { startDate, endDate, type } = req.query;

    const filter = { customerId: ctx.customerId, cooperativeId: ctx.cooperativeId };
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    const memberTransactions = await Transaction.find(filter).sort({ createdAt: -1 });
    res.json(memberTransactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get member's loans for the active cooperative
// @route   GET /api/member/loans
// @access  Private (member only)
exports.getMemberLoans = async (req, res) => {
  try {
    const ctx = await resolveMemberContext(req.user, req.query.cooperativeId);
    if (!ctx) {
      return res.status(400).json({ message: 'No active membership found for this cooperative' });
    }
    const memberLoans = await Loan.find({ customerId: ctx.customerId, cooperativeId: ctx.cooperativeId });
    res.json(memberLoans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all cooperative memberships (with status + savings account)
//          for the logged-in member.
// @route   GET /api/member/cooperatives
// @access  Private (member only)
exports.getMemberCooperatives = async (req, res) => {
  try {
    const userId = req.user._id;

    let customers = await Customer.find({ userId })
      .populate('cooperativeId', 'name district province category contactPhone contactEmail')
      .sort({ createdAt: -1 });

    // Legacy fallback: if no customer rows carry userId but the user is linked
    // to a customer record (e.g. seeded accounts), include that one.
    if (customers.length === 0 && req.user.customerId) {
      customers = await Customer.find({ _id: req.user.customerId })
        .populate('cooperativeId', 'name district province category contactPhone contactEmail')
        .sort({ createdAt: -1 });
    }

    const memberships = await Promise.all(customers.map(async (c) => {
      // Every approved membership automatically owns a savings account in
      // that cooperative (created on approval). Return it so the frontend
      // can show "your account for this cooperative".
      let account = null;
      if (c.status === 'active') {
        const acc = await getOrCreateSavingsAccount(c, c.cooperativeId);
        account = acc
          ? { _id: acc._id, accountNo: acc.accountNo, balance: acc.balance, status: acc.status }
          : null;
      }
      return {
        _id: c._id,
        customerId: c._id,
        status: c.status,
        rejectionReason: c.rejectionReason,
        joinedAt: c.createdAt,
        account,
        cooperative: c.cooperativeId ? {
          _id: c.cooperativeId._id,
          name: c.cooperativeId.name,
          district: c.cooperativeId.district,
          province: c.cooperativeId.province,
          category: c.cooperativeId.category,
          contactPhone: c.cooperativeId.contactPhone,
          contactEmail: c.cooperativeId.contactEmail
        } : null
      };
    }));

    res.json(memberships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get member profile for the active cooperative
// @route   GET /api/member/profile
// @access  Private (member only)
exports.getMemberProfile = async (req, res) => {
  try {
    const ctx = await resolveMemberContext(req.user, req.query.cooperativeId);
    if (!ctx) {
      return res.status(400).json({ message: 'No active membership found for this cooperative' });
    }
    const customer = await Customer.findOne({ _id: ctx.customerId, cooperativeId: ctx.cooperativeId });
    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update member profile (limited self-service fields only)
// @route   PUT /api/member/profile
// @access  Private (member only)
exports.updateMemberProfile = async (req, res) => {
  try {
    const ctx = await resolveMemberContext(req.user, req.body.cooperativeId || req.query.cooperativeId);
    if (!ctx) {
      return res.status(400).json({ message: 'No active membership found for this cooperative' });
    }
    const { phone, email, address, whatsapp } = req.body;

    const updateFields = {};
    if (phone !== undefined) updateFields.phone = phone;
    if (email !== undefined) updateFields.email = email;
    if (address !== undefined) updateFields.address = address;
    if (whatsapp !== undefined) updateFields.whatsapp = whatsapp;

    const customer = await Customer.findOneAndUpdate(
      { _id: ctx.customerId, cooperativeId: ctx.cooperativeId },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ message: 'Customer profile not found' });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
