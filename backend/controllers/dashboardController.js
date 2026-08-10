const Customer = require('../models/Customer');
const Account = require('../models/Account');
const Loan = require('../models/Loan');
const Branch = require('../models/Branch');
const Transaction = require('../models/Transaction');

const LOAN_TYPE_COLORS = {
  Agriculture: '#10B981',
  Business: '#2563EB',
  Housing: '#F59E0B',
  Personal: '#8B5CF6',
  Education: '#06B6D4',
  Equipment: '#F97316'
};

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const localDateStr = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

exports.getDashboardStats = async (req, res) => {
  try {
    // Manager/staff are scoped to their own cooperative. Admin may pass
    // ?cooperativeId= to inspect a specific tenant's dashboard.
    const queryCoop = req.query.cooperativeId;
    const filter = req.user.role === 'admin'
      ? (queryCoop ? { cooperativeId: queryCoop } : {})
      : { cooperativeId: req.user.cooperativeId };

    const [
      totalCustomers,
      totalAccounts,
      totalLoans,
      balanceAgg,
      activeLoans,
      pendingLoans,
      outstandingAgg,
      activeBranches,
      todayTransactions,
      recentTxns,
      branches,
      monthlyAgg,
      portfolioAgg,
      customerByBranch,
      accountByBranch,
      loanByBranch
    ] = await Promise.all([
      Customer.countDocuments(filter),
      Account.countDocuments(filter),
      Loan.countDocuments(filter),
      Account.aggregate([{ $match: filter }, { $group: { _id: null, total: { $sum: '$balance' } } }]),
      Loan.countDocuments({ ...filter, status: 'active' }),
      Loan.countDocuments({ ...filter, status: 'pending' }),
      Loan.aggregate([{ $match: { ...filter, status: 'active' } }, { $group: { _id: null, total: { $sum: '$outstanding' } } }]),
      Branch.countDocuments({ ...filter, status: 'active' }),
      Transaction.countDocuments({ ...filter, date: localDateStr() }),
      Transaction.find(filter).sort({ createdAt: -1 }).limit(6).lean(),
      Branch.find(filter).lean(),
      Transaction.aggregate([
        { $match: filter },
        {
          $group: {
            _id: { $substr: ['$date', 0, 7] },
            deposits: { $sum: { $cond: [{ $in: ['$type', ['Deposit', 'Interest Credit']] }, '$amount', 0] } },
            withdrawals: { $sum: { $cond: [{ $eq: ['$type', 'Withdrawal'] }, '$amount', 0] } },
            transfers: { $sum: { $cond: [{ $eq: ['$type', 'Transfer'] }, '$amount', 0] } }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Loan.aggregate([{ $match: filter }, { $group: { _id: '$type', value: { $sum: 1 } } }, { $sort: { value: -1 } }]),
      Customer.aggregate([{ $match: filter }, { $group: { _id: '$branch', count: { $sum: 1 } } }]),
      Account.aggregate([{ $match: filter }, { $group: { _id: '$branch', count: { $sum: 1 } } }]),
      Loan.aggregate([{ $match: filter }, { $group: { _id: '$branch', count: { $sum: 1 } } }])
    ]);

    const monthlyTransactionData = monthlyAgg.map((m) => ({
      month: MONTH_LABELS[Number(m._id.slice(5, 7)) - 1] || m._id,
      deposits: m.deposits || 0,
      withdrawals: m.withdrawals || 0,
      transfers: m.transfers || 0
    }));

    const totalPortfolio = portfolioAgg.reduce((s, p) => s + p.value, 0) || 1;
    const loanPortfolioData = portfolioAgg.map((p) => ({
      name: p._id,
      value: Math.round((p.value / totalPortfolio) * 100),
      color: LOAN_TYPE_COLORS[p._id] || '#94A3B8'
    }));

    const customerMap = new Map(customerByBranch.map((c) => [c._id, c.count]));
    const accountMap = new Map(accountByBranch.map((c) => [c._id, c.count]));
    const loanMap = new Map(loanByBranch.map((c) => [c._id, c.count]));

    const branchSnapshot = branches.map((b) => ({
      _id: b._id,
      name: b.name,
      location: b.location,
      status: b.status,
      customers: customerMap.get(b.name) || 0,
      accounts: accountMap.get(b.name) || 0,
      loans: loanMap.get(b.name) || 0
    }));

    res.json({
      totalCustomers,
      totalAccounts,
      totalLoans,
      totalBalance: balanceAgg[0]?.total || 0,
      activeLoans,
      pendingLoans,
      totalOutstanding: outstandingAgg[0]?.total || 0,
      activeBranches,
      todayTransactions,
      recentTransactions: recentTxns,
      branches: branchSnapshot,
      monthlyTransactionData,
      loanPortfolioData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
