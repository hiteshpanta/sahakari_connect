const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Cooperative = require('./models/Cooperative');
const CooperativeProfile = require('./models/CooperativeProfile');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected for seeding Cooperative'))
  .catch(err => console.error(err));

const seedTenant = async () => {
  try {
    const coop = new Cooperative({
      name: 'Sunrise Cooperative (Local Test)',
      address: 'Test City',
      contactEmail: 'admin@sunrise.com',
      contactPhone: '1234567890',
      status: 'active',
      subscriptionPlan: 'premium'
    });
    await coop.save();
    
    const profile = new CooperativeProfile({
      cooperativeId: coop._id,
      appName: 'Sunrise Banking',
      customDomain: 'localhost',
      colors: {
        primary: '#7c3aed', // violet
        secondary: '#a78bfa',
        accent: '#f59e0b' // amber
      },
      emailTemplates: {
        welcome: 'Welcome to Sunrise Cooperative!',
        receipt: 'Receipt from Sunrise.'
      }
    });
    
    await profile.save();
    console.log('Test Tenant Seeded! Domain: localhost');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedTenant();
