require('dotenv').config();
const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const Account = require('./models/Account');
const Transaction = require('./models/Transaction');
const Loan = require('./models/Loan');
const User = require('./models/User');

const COOP = '6a75ba81935c4d09cf9d06ad';
const CUSTOMER = '6a522d582964430b34e3dad8';
const MEMBER_PASSWORD = 'Member@123';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'bank' });
  console.log('Connected to MongoDB');

  const customer = await Customer.findById(CUSTOMER);
  if (!customer) throw new Error('Customer not found: ' + CUSTOMER);
  console.log('Customer:', customer.name, '| status:', customer.status, '| coop:', customer.cooperativeId);

  const accRes = await Account.updateMany({ customerId: CUSTOMER }, { $set: { cooperativeId: COOP } });
  const txnRes = await Transaction.updateMany({ customerId: CUSTOMER }, { $set: { cooperativeId: COOP } });
  const loanRes = await Loan.updateMany({ customerId: CUSTOMER }, { $set: { cooperativeId: COOP } });
  customer.cooperativeId = COOP;
  await customer.save();
  console.log('Linked accounts:', accRes.modifiedCount, '| txns:', txnRes.modifiedCount, '| loans:', loanRes.modifiedCount);

  let user = await User.findOne({ email: 'hari@gmail.com' });
  if (user) {
    console.log('Existing user found, updating...');
    user.name = customer.name;
    user.role = 'member';
    user.customerId = customer._id;
    user.cooperativeId = COOP;
    user.status = 'active';
    user.isVerified = true;
    user.password = MEMBER_PASSWORD;
    await user.save();
  } else {
    user = await User.create({
      name: customer.name,
      email: 'hari@gmail.com',
      password: MEMBER_PASSWORD,
      role: 'member',
      customerId: customer._id,
      cooperativeId: COOP,
      status: 'active',
      isVerified: true
    });
  }
  console.log('Member user ready:', user.email, '| role:', user.role, '| customerId:', user.customerId);

  await mongoose.disconnect();
  console.log('Done. Login with hari@gmail.com / Member@123');
}

main().catch(async (err) => {
  console.error('ERROR:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
