const Account = require('../models/Account');

// Generate a savings account number unique within the cooperative,
// following the SAV-{coopSeq}-{memberSeq} convention.
async function generateAccountNo(cooperativeId, customerId) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const coopCount = await Account.countDocuments({ cooperativeId });
    const custCount = await Account.countDocuments({ customerId, cooperativeId });
    const accountNo = `SAV-${String(coopCount + 1).padStart(3, '0')}-${String(custCount + 1).padStart(4, '0')}`;
    const exists = await Account.findOne({ accountNo });
    if (!exists) return accountNo;
  }
  // Fallback: timestamp-based, practically collision free
  return `SAV-${Date.now().toString().slice(-6)}-${String(customerId).slice(-4).toUpperCase()}`;
}

// Every member automatically gets a savings account when they are approved
// into a cooperative. This returns the existing one or creates it.
async function getOrCreateSavingsAccount(customer, cooperativeId) {
  const existing = await Account.findOne({
    customerId: customer._id,
    cooperativeId,
    type: 'Savings',
    status: 'active'
  });
  if (existing) return existing;

  const accountNo = await generateAccountNo(cooperativeId, customer._id);
  return Account.create({
    accountNo,
    customerId: customer._id,
    customerName: customer.name,
    type: 'Savings',
    branch: customer.branch || 'Head Office',
    balance: 0,
    status: 'active',
    interestRate: 0,
    cooperativeId
  });
}

module.exports = { getOrCreateSavingsAccount };
