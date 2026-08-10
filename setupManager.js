require('dotenv').config();
const mongoose = require('mongoose');
const Cooperative = require('./models/Cooperative');
const User = require('./models/User');

(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'bank' });
  const COOP = '6a75ba81935c4d09cf9d06ad';
  let u = await User.findOne({ email: 'sajha.manager@gmail.com' });
  if (u) {
    console.log('exists, updating');
    u.role = 'manager';
    u.cooperativeId = COOP;
    u.password = 'Manager@123';
    u.isVerified = true;
    u.status = 'active';
    await u.save();
  } else {
    u = await User.create({
      name: 'Sajha Manager',
      email: 'sajha.manager@gmail.com',
      password: 'Manager@123',
      role: 'manager',
      branch: 'Head Office',
      cooperativeId: COOP,
      status: 'active',
      isVerified: true
    });
  }
  await Cooperative.findByIdAndUpdate(COOP, { $addToSet: { managers: u._id } });
  console.log('Manager ready:', u.email, '/ Manager@123', '| id:', u._id);
  await mongoose.disconnect();
})();
