const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Branch = require('./models/Branch');
const Customer = require('./models/Customer');
const Account = require('./models/Account');
const Transaction = require('./models/Transaction');
const Loan = require('./models/Loan');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected for Seeding'))
  .catch(err => console.error(err));

const importData = async () => {
  try {
    await User.deleteMany();
    await Branch.deleteMany();
    await Customer.deleteMany();
    await Account.deleteMany();
    await Transaction.deleteMany();
    await Loan.deleteMany();

    // The frontend mockData uses export const, we can import it dynamically
    const mockDataModule = await import('../frontend/src/data/mockData.js');
    const { users, branches, customers, accounts, transactions, loans } = mockDataModule;

    // Users
    for (let u of users) {
      await User.create({ ...u, isVerified: true });
    }

    // Branches
    await Branch.insertMany(branches);

    // Customers
    const createdCustomers = await Customer.insertMany(customers);

    // Accounts (need customer ObjectIds)
    const accountsToInsert = accounts.map(a => {
      const customer = createdCustomers.find(c => c.name === a.customerName);
      return {
        ...a,
        customerId: customer._id
      };
    });
    const createdAccounts = await Account.insertMany(accountsToInsert);

    // Transactions
    const txnsToInsert = transactions.map(t => {
      const account = createdAccounts.find(a => a.accountNo === t.accountNo);
      return {
        ...t,
        accountId: account._id,
        customerId: account.customerId
      };
    });
    await Transaction.insertMany(txnsToInsert);

    // Loans
    const loansToInsert = loans.map(l => {
      const customer = createdCustomers.find(c => c.name === l.customerName);
      return {
        ...l,
        customerId: customer._id
      };
    });
    await Loan.insertMany(loansToInsert);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Branch.deleteMany();
    await Customer.deleteMany();
    await Account.deleteMany();
    await Transaction.deleteMany();
    await Loan.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
