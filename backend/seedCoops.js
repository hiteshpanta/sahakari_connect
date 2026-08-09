const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Cooperative = require('./models/Cooperative');
const CooperativeProfile = require('./models/CooperativeProfile');
const Rating = require('./models/Rating');
const MembershipApplication = require('./models/CooperativeKyc');

dotenv.config();

// ------------------------------------------------------------------
// Seed data: 12 real-world style Nepali cooperatives with full public
// profiles including ratings, loan conditions and savings products.
// ------------------------------------------------------------------

const COOPS = [
  {
    name: 'Sajha Sahakari Sanstha',
    address: 'Balkhu, Kathmandu',
    district: 'Kathmandu',
    province: 'Bagmati',
    establishedYear: 1958,
    category: 'Multi-purpose',
    contactEmail: 'info@sajhasahakari.org',
    contactPhone: '01-5123456',
    registrationNo: 'DOCC-058-001',
    description:
      'The oldest and most iconic multi-purpose cooperative in Nepal, known for its vibrant farmer markets, dairy operations and community-first ethos serving the Kathmandu valley for over six decades.',
    colors: { primary: '#047857', secondary: '#10b981', accent: '#f59e0b' },
    stats: { memberCount: 12500, totalDeposits: 4500000000, totalLoansDisbursed: 3200000000, totalSavingsProducts: 5 },
    savingsProducts: [
      { name: 'Sajha Bachat', description: 'Daily/weekly savings popular with farmers and vendors.', interestRate: 6.5 },
      { name: 'General Savings', description: 'Flexible savings with quarterly interest payout.', interestRate: 7.0 },
      { name: 'Fixed Deposit', description: 'Attractive rates for 6-60 month locked deposits.', interestRate: 10.5 },
      { name: 'Child Savings', description: 'Future-ready savings for members aged under 18.', interestRate: 8.0 }
    ],
    loanProducts: [
      {
        name: 'Agricultural Loan',
        description: 'Seasonal crop, livestock and equipment loans for farmer members.',
        interestRate: 10.5,
        minAmount: 20000,
        maxAmount: 2000000,
        minTenure: 6,
        maxTenure: 60,
        collateral: 'Land title or two guarantor members',
        eligibility: 'Member for at least 6 months with regular savings',
        processingTime: '5-7 working days'
      },
      {
        name: 'Business Loan',
        description: 'Working capital and expansion loans for small businesses.',
        interestRate: 12.0,
        minAmount: 50000,
        maxAmount: 5000000,
        minTenure: 6,
        maxTenure: 60,
        collateral: 'Property collateral or fixed deposit margin',
        eligibility: 'Business registration and 1 year of trading history',
        processingTime: '7-10 working days'
      },
      {
        name: 'Housing Loan',
        description: 'Land purchase, construction and home renovation loans.',
        interestRate: 11.0,
        minAmount: 100000,
        maxAmount: 10000000,
        minTenure: 12,
        maxTenure: 240,
        collateral: 'Registered land/house title',
        eligibility: 'Member for 1 year, minimum monthly income NPR 30,000',
        processingTime: '10-14 working days'
      },
      {
        name: 'Personal Loan',
        description: 'Education, medical and emergency personal loans.',
        interestRate: 13.5,
        minAmount: 10000,
        maxAmount: 500000,
        minTenure: 3,
        maxTenure: 36,
        collateral: 'No collateral - salary deduction or 2 guarantors',
        eligibility: 'Active member with regular monthly savings',
        processingTime: '3-5 working days'
      }
    ],
    services: [
      { name: 'Daily Farmer Market', description: 'Direct farmer-to-consumer fresh produce markets.' },
      { name: 'Dairy Services', description: 'Milk collection, processing and distribution network.' },
      { name: 'Draft / Cheque Facility', description: 'Cheque clearing and draft services for members.' },
      { name: 'Insurance Facilitation', description: 'Life and livestock insurance at discounted rates.' }
    ],
    announcements: [
      { title: 'AGM 2025 Announced', content: 'Annual General Meeting scheduled for Poush 12. Members are requested to attend.', date: new Date('2025-10-01') },
      { title: 'Digital Membership Now Available', content: 'New members can now apply online through our official platform.', date: new Date('2025-08-15') }
    ]
  },
  {
    name: 'Nepal Gramin Saving & Credit Cooperative',
    address: 'Suryabinayak, Bhaktapur',
    district: 'Bhaktapur',
    province: 'Bagmati',
    establishedYear: 2001,
    category: 'Saving & Credit',
    contactEmail: 'info@nepalgramin.coop',
    contactPhone: '01-6611223',
    registrationNo: 'DOCC-058-042',
    description:
      'A member-owned saving and credit cooperative focused on financial inclusion for rural households around the Bhaktapur valley.',
    colors: { primary: '#1d4ed8', secondary: '#3b82f6', accent: '#10b981' },
    stats: { memberCount: 8300, totalDeposits: 2100000000, totalLoansDisbursed: 1500000000, totalSavingsProducts: 4 },
    savingsProducts: [
      { name: 'Daily Savings', description: 'Small daily deposits designed for daily-wage earners.', interestRate: 5.5 },
      { name: 'Ordinary Savings', description: 'Standard savings account with monthly statement.', interestRate: 6.5 },
      { name: 'Recurring Deposit', description: 'Monthly fixed deposit for a chosen tenure.', interestRate: 9.0 },
      { name: 'Fixed Deposit', description: 'Lump-sum deposits from 3 months to 5 years.', interestRate: 10.0 }
    ],
    loanProducts: [
      {
        name: 'Micro Loan',
        description: 'Small uncollateralized loans for income-generation activities.',
        interestRate: 15.0,
        minAmount: 5000,
        maxAmount: 150000,
        minTenure: 3,
        maxTenure: 12,
        collateral: 'Group guarantee (joint liability)',
        eligibility: 'Member with 3 months of savings history',
        processingTime: '2-3 working days'
      },
      {
        name: 'Small Business Loan',
        description: 'Loans for shop, trade and cottage industry owners.',
        interestRate: 13.0,
        minAmount: 50000,
        maxAmount: 1000000,
        minTenure: 6,
        maxTenure: 36,
        collateral: 'Guarantor or deposit margin',
        eligibility: 'Active member, business plan required',
        processingTime: '5-7 working days'
      },
      {
        name: 'Women Empowerment Loan',
        description: 'Special loan scheme for women entrepreneurs.',
        interestRate: 11.0,
        minAmount: 20000,
        maxAmount: 500000,
        minTenure: 6,
        maxTenure: 36,
        collateral: 'Group guarantee',
        eligibility: 'Female members of self-help groups',
        processingTime: '4-6 working days'
      }
    ],
    services: [
      { name: 'SMS Banking', description: 'Balance inquiry and mini-statements via SMS.' },
      { name: 'Remittance Services', description: 'Safe and fast domestic fund transfer.' },
      { name: 'Saving Campaigns', description: 'Seasonal savings drives with prizes.' }
    ],
    announcements: [
      { title: 'New Branch Opening', content: 'A new service counter has opened in Changunarayan Municipality.', date: new Date('2025-09-01') }
    ]
  },
  {
    name: 'Annapurna Multipurpose Cooperative',
    address: 'Lakeside-6, Pokhara',
    district: 'Kaski',
    province: 'Gandaki',
    establishedYear: 1998,
    category: 'Multi-purpose',
    contactEmail: 'contact@annapurnacoop.com.np',
    contactPhone: '061-452233',
    registrationNo: 'DOCC-058-033',
    description:
      'Serving the Pokhara valley with savings, credit, tourism financing and community development programs.',
    colors: { primary: '#b45309', secondary: '#f59e0b', accent: '#10b981' },
    stats: { memberCount: 6400, totalDeposits: 1800000000, totalLoansDisbursed: 1200000000, totalSavingsProducts: 5 },
    savingsProducts: [
      { name: 'Tourism Savings', description: 'Savings tailored for tourism and homestay operators.', interestRate: 7.5 },
      { name: 'General Savings', description: 'Everyday savings with easy withdrawals.', interestRate: 6.5 },
      { name: 'Festival Deposit', description: 'Short-term festive season savings.', interestRate: 8.0 },
      { name: 'Senior Citizen Deposit', description: 'Higher interest for members above 60 years.', interestRate: 10.0 }
    ],
    loanProducts: [
      {
        name: 'Tourism Business Loan',
        description: 'Financing for hotels, homestays, trekking and paragliding businesses.',
        interestRate: 12.5,
        minAmount: 100000,
        maxAmount: 8000000,
        minTenure: 12,
        maxTenure: 84,
        collateral: 'Hotel/land property title',
        eligibility: 'Registered tourism business, 1 year operation',
        processingTime: '10-14 working days'
      },
      {
        name: 'Agriculture Loan',
        description: 'Seasonal and commercial farming finance.',
        interestRate: 11.0,
        minAmount: 30000,
        maxAmount: 1500000,
        minTenure: 6,
        maxTenure: 48,
        collateral: 'Land title or group guarantee',
        eligibility: 'Farmer member with land in use',
        processingTime: '5-8 working days'
      },
      {
        name: 'Education Loan',
        description: 'Student and family education financing.',
        interestRate: 9.5,
        minAmount: 50000,
        maxAmount: 1000000,
        minTenure: 12,
        maxTenure: 60,
        collateral: 'Co-signer with income proof',
        eligibility: 'Admission letter or university document',
        processingTime: '5-7 working days'
      },
      {
        name: 'Personal Loan',
        description: 'Quick personal loans for members.',
        interestRate: 13.0,
        minAmount: 20000,
        maxAmount: 400000,
        minTenure: 3,
        maxTenure: 24,
        collateral: 'Two guarantors or deposit margin',
        eligibility: '6 months of active membership',
        processingTime: '3-5 working days'
      }
    ],
    services: [
      { name: 'Digital Passbook', description: 'Paperless account statement access.' },
      { name: 'Tourist Guide Certification', description: 'Support programs for tourism workforce.' },
      { name: 'Remittance', description: 'Nepal-wide fund transfer.' }
    ],
    announcements: [
      { title: 'Tourism Loan Fest', description: 'Reduced interest rates on tourism loans for the festive season.', date: new Date('2025-10-05') }
    ]
  },
  {
    name: 'Himalaya Saving & Credit Cooperative',
    address: 'Damak-5, Jhapa',
    district: 'Jhapa',
    province: 'Koshi',
    establishedYear: 2005,
    category: 'Saving & Credit',
    contactEmail: 'info@himalayascc.coop',
    contactPhone: '023-581234',
    registrationNo: 'DOCC-058-077',
    description:
      'Eastern Nepal\u2019s trusted saving and credit cooperative serving Jhapa and Morang districts.',
    colors: { primary: '#0e7490', secondary: '#06b6d4', accent: '#f59e0b' },
    stats: { memberCount: 5200, totalDeposits: 950000000, totalLoansDisbursed: 700000000, totalSavingsProducts: 3 },
    savingsProducts: [
      { name: 'Daily Collection', description: 'Doorstep daily deposit collection service.', interestRate: 6.0 },
      { name: 'General Savings', description: 'Standard savings account.', interestRate: 6.5 },
      { name: 'Fixed Deposit', description: 'Term deposit with best-in-district rates.', interestRate: 10.0 }
    ],
    loanProducts: [
      {
        name: 'Agricultural Loan',
        description: 'Paddy, tea and horticulture farming finance.',
        interestRate: 11.5,
        minAmount: 20000,
        maxAmount: 1000000,
        minTenure: 6,
        maxTenure: 48,
        collateral: 'Land title',
        eligibility: 'Farmer member, land ownership',
        processingTime: '5-7 working days'
      },
      {
        name: 'Trade & Commerce Loan',
        description: 'Finance for local traders and retailers.',
        interestRate: 13.0,
        minAmount: 50000,
        maxAmount: 2000000,
        minTenure: 6,
        maxTenure: 36,
        collateral: 'Guarantor or property',
        eligibility: 'Active member, trade license',
        processingTime: '5-8 working days'
      }
    ],
    services: [
      { name: 'Tea Farm Support', description: 'Input financing for tea producers.' },
      { name: 'SMS Alerts', description: 'Transaction alerts on mobile.' }
    ],
    announcements: [
      { title: 'Tea Season Finance', description: 'Special financing window opened for tea season.', date: new Date('2025-09-20') }
    ]
  },
  {
    name: 'Koshi Bikash Saving & Credit Cooperative',
    address: 'Inaruwa-4, Sunsari',
    district: 'Sunsari',
    province: 'Koshi',
    establishedYear: 2003,
    category: 'Saving & Credit',
    contactEmail: 'koshibikash@example.coop',
    contactPhone: '025-521234',
    registrationNo: 'DOCC-058-064',
    description:
      'Community-driven cooperative supporting farmers and small enterprises in the Koshi corridor.',
    colors: { primary: '#15803d', secondary: '#22c55e', accent: '#3b82f6' },
    stats: { memberCount: 4100, totalDeposits: 620000000, totalLoansDisbursed: 480000000, totalSavingsProducts: 3 },
    savingsProducts: [
      { name: 'General Savings', description: 'Flexible savings for all members.', interestRate: 6.5 },
      { name: 'Recurring Deposit', description: 'Monthly savings discipline program.', interestRate: 8.5 },
      { name: 'Fixed Deposit', description: 'Long-term deposits.', interestRate: 10.0 }
    ],
    loanProducts: [
      {
        name: 'Micro Enterprise Loan',
        description: 'Loans for micro-enterprise creation and expansion.',
        interestRate: 14.0,
        minAmount: 10000,
        maxAmount: 300000,
        minTenure: 3,
        maxTenure: 24,
        collateral: 'Group guarantee',
        eligibility: '3 months membership, small business plan',
        processingTime: '2-4 working days'
      },
      {
        name: 'Land Purchase Loan',
        description: 'Long-term financing for farmland purchase.',
        interestRate: 11.5,
        minAmount: 200000,
        maxAmount: 5000000,
        minTenure: 12,
        maxTenure: 120,
        collateral: 'Land title',
        eligibility: '1 year membership, income proof',
        processingTime: '10-14 working days'
      }
    ],
    services: [
      { name: 'Agri Input Center', description: 'Subsidized seeds and fertilizer.' },
      { name: 'Banking Facilitator', description: 'Digital banking helpdesk.' }
    ],
    announcements: []
  },
  {
    name: 'Chitwan Multipurpose Cooperative',
    address: 'Bharatpur-10, Chitwan',
    district: 'Chitwan',
    province: 'Bagmati',
    establishedYear: 2002,
    category: 'Agriculture',
    contactEmail: 'chitwancoop@example.coop',
    contactPhone: '056-592233',
    registrationNo: 'DOCC-058-089',
    description:
      'Agri-focused cooperative supporting banana, citrus and poultry farmers of the Chitwan valley.',
    colors: { primary: '#4d7c0f', secondary: '#84cc16', accent: '#f59e0b' },
    stats: { memberCount: 7300, totalDeposits: 1400000000, totalLoansDisbursed: 1100000000, totalSavingsProducts: 4 },
    savingsProducts: [
      { name: 'General Savings', description: 'Standard member savings.', interestRate: 6.5 },
      { name: 'Agri Daily Savings', description: 'Daily savings for farm households.', interestRate: 7.0 },
      { name: 'Fixed Deposit', description: 'Term deposits with premium rates.', interestRate: 10.5 },
      { name: 'Poultry Savings', description: 'Special scheme for poultry farmers.', interestRate: 8.0 }
    ],
    loanProducts: [
      {
        name: 'Poultry & Livestock Loan',
        description: 'Farm infrastructure, chicks and feed financing.',
        interestRate: 12.0,
        minAmount: 30000,
        maxAmount: 3000000,
        minTenure: 6,
        maxTenure: 36,
        collateral: 'Farm land title or gold guarantee',
        eligibility: 'Registered farm, technical training certificate',
        processingTime: '5-7 working days'
      },
      {
        name: 'Banana Farming Loan',
        description: 'Seasonal finance for banana plantations.',
        interestRate: 10.5,
        minAmount: 50000,
        maxAmount: 2000000,
        minTenure: 12,
        maxTenure: 60,
        collateral: 'Land title',
        eligibility: 'Farmer with land under banana cultivation',
        processingTime: '6-8 working days'
      },
      {
        name: 'Cold Storage Loan',
        description: 'Infrastructure loans for storage facilities.',
        interestRate: 11.0,
        minAmount: 500000,
        maxAmount: 15000000,
        minTenure: 12,
        maxTenure: 120,
        collateral: 'Property title',
        eligibility: 'Cooperative members with business plan',
        processingTime: '15-20 working days'
      }
    ],
    services: [
      { name: 'Cold Storage', description: 'Shared refrigerated storage for produce.' },
      { name: 'Vet Services', description: 'Veterinary camps for member farmers.' },
      { name: 'Harvest Insurance', description: 'Crop insurance facilitation.' }
    ],
    announcements: [
      { title: 'Poultry Feed Subsidy', description: 'Subsidized feed available for registered poultry members.', date: new Date('2025-10-10') }
    ]
  },
  {
    name: 'Lumbini Bikas Saving & Credit Cooperative',
    address: 'Buddhanagar-4, Butwal',
    district: 'Rupandehi',
    province: 'Lumbini',
    establishedYear: 2004,
    category: 'Saving & Credit',
    contactEmail: 'lumbinibikas@example.coop',
    contactPhone: '071-541234',
    registrationNo: 'DOCC-058-101',
    description:
      'Dynamic saving and credit cooperative in the industrial belt of Butwal serving traders and factory workers.',
    colors: { primary: '#7c3aed', secondary: '#8b5cf6', accent: '#f59e0b' },
    stats: { memberCount: 5800, totalDeposits: 1200000000, totalLoansDisbursed: 900000000, totalSavingsProducts: 4 },
    savingsProducts: [
      { name: 'General Savings', description: 'Flexible everyday savings.', interestRate: 6.5 },
      { name: 'Worker Savings', description: 'Factory worker payroll savings.', interestRate: 7.0 },
      { name: 'Fixed Deposit', description: 'Term deposits.', interestRate: 10.0 },
      { name: 'Emergency Fund', description: 'Liquid savings for emergencies.', interestRate: 6.0 }
    ],
    loanProducts: [
      {
        name: 'Working Capital Loan',
        description: 'Short-term working capital for traders.',
        interestRate: 13.0,
        minAmount: 50000,
        maxAmount: 3000000,
        minTenure: 3,
        maxTenure: 24,
        collateral: 'Inventory hypothecation or guarantor',
        eligibility: 'Active business, 6 months membership',
        processingTime: '4-6 working days'
      },
      {
        name: 'Vehicle Loan',
        description: 'Two-wheeler and commercial vehicle loans.',
        interestRate: 12.5,
        minAmount: 150000,
        maxAmount: 5000000,
        minTenure: 12,
        maxTenure: 60,
        collateral: 'Vehicle ownership papers',
        eligibility: 'Stable income, down payment 20%',
        processingTime: '5-8 working days'
      },
      {
        name: 'Personal Loan',
        description: 'Quick personal financing.',
        interestRate: 13.5,
        minAmount: 20000,
        maxAmount: 300000,
        minTenure: 3,
        maxTenure: 24,
        collateral: 'Deposit margin or two guarantors',
        eligibility: 'Active membership',
        processingTime: '2-4 working days'
      }
    ],
    services: [
      { name: 'Draft Facility', description: 'Local cheque and draft clearing.' },
      { name: 'Salary Processing', description: 'Payroll services for local industries.' }
    ],
    announcements: []
  },
  {
    name: 'Janahit Saving & Credit Cooperative',
    address: 'Pipra-5, Birgunj',
    district: 'Parsa',
    province: 'Madhesh',
    establishedYear: 2006,
    category: 'Thrift',
    contactEmail: 'janahit@example.coop',
    contactPhone: '051-512233',
    registrationNo: 'DOCC-058-113',
    description:
      'Thrift-focused cooperative promoting a culture of savings among traders and households of Birgunj.',
    colors: { primary: '#be123c', secondary: '#f43f5e', accent: '#f59e0b' },
    stats: { memberCount: 3900, totalDeposits: 480000000, totalLoansDisbursed: 350000000, totalSavingsProducts: 3 },
    savingsProducts: [
      { name: 'Daily Thrift', description: 'Daily micro-savings for market vendors.', interestRate: 6.0 },
      { name: 'General Savings', description: 'Standard savings.', interestRate: 6.5 },
      { name: 'Fixed Deposit', description: 'Term deposits.', interestRate: 10.0 }
    ],
    loanProducts: [
      {
        name: 'Vendor Loan',
        description: 'Stock purchase loans for market vendors.',
        interestRate: 14.0,
        minAmount: 10000,
        maxAmount: 200000,
        minTenure: 1,
        maxTenure: 12,
        collateral: 'Group guarantee',
        eligibility: 'Vendor with daily thrift history',
        processingTime: '1-3 working days'
      },
      {
        name: 'Trade Loan',
        description: 'Commercial loans for cross-border traders.',
        interestRate: 12.5,
        minAmount: 100000,
        maxAmount: 3000000,
        minTenure: 6,
        maxTenure: 36,
        collateral: 'Property title or deposit margin',
        eligibility: 'Trade license and 1 year membership',
        processingTime: '7-10 working days'
      }
    ],
    services: [
      { name: 'Market Collection', description: 'Doorstep collection at market squares.' },
      { name: 'Mobile Top-up Desk', description: 'Convenience services for members.' }
    ],
    announcements: []
  },
  {
    name: 'Gandaki Samajik Saving & Credit Cooperative',
    address: 'Waling-3, Syangja',
    district: 'Syangja',
    province: 'Gandaki',
    establishedYear: 2008,
    category: 'Saving & Credit',
    contactEmail: 'gandakisamajik@example.coop',
    contactPhone: '063-442233',
    registrationNo: 'DOCC-058-125',
    description:
      'Social cooperative combining community welfare programs with accessible saving and credit services.',
    colors: { primary: '#0f766e', secondary: '#14b8a6', accent: '#84cc16' },
    stats: { memberCount: 2700, totalDeposits: 320000000, totalLoansDisbursed: 240000000, totalSavingsProducts: 3 },
    savingsProducts: [
      { name: 'General Savings', description: 'Everyday savings.', interestRate: 6.5 },
      { name: 'Community Health Savings', description: 'Savings linked to health support fund.', interestRate: 7.0 },
      { name: 'Fixed Deposit', description: 'Term deposits.', interestRate: 10.0 }
    ],
    loanProducts: [
      {
        name: 'Coffee Farming Loan',
        description: 'Finance for coffee plantation and processing.',
        interestRate: 11.0,
        minAmount: 30000,
        maxAmount: 1000000,
        minTenure: 12,
        maxTenure: 72,
        collateral: 'Land title',
        eligibility: 'Coffee farmer member with plantation',
        processingTime: '6-10 working days'
      },
      {
        name: 'Community Health Loan',
        description: 'Zero-paperwork emergency health loans.',
        interestRate: 12.0,
        minAmount: 10000,
        maxAmount: 100000,
        minTenure: 1,
        maxTenure: 12,
        collateral: 'Member guarantee',
        eligibility: 'Active member in health savings scheme',
        processingTime: '1-2 working days'
      }
    ],
    services: [
      { name: 'Health Camps', description: 'Quarterly free health checkups.' },
      { name: 'Coffee Processing Unit', description: 'Shared coffee processing facility.' }
    ],
    announcements: []
  },
  {
    name: 'Karnali Development Saving & Credit Cooperative',
    address: 'Birendranagar-8, Surkhet',
    district: 'Surkhet',
    province: 'Karnali',
    establishedYear: 2010,
    category: 'Saving & Credit',
    contactEmail: 'karnali@example.coop',
    contactPhone: '083-521234',
    registrationNo: 'DOCC-058-137',
    description:
      'One of the leading cooperatives in the Karnali region, financing agriculture, trade and youth startups in one of Nepal\u2019s most remote provinces.',
    colors: { primary: '#92400e', secondary: '#d97706', accent: '#10b981' },
    stats: { memberCount: 2100, totalDeposits: 240000000, totalLoansDisbursed: 170000000, totalSavingsProducts: 3 },
    savingsProducts: [
      { name: 'General Savings', description: 'Standard savings account.', interestRate: 6.5 },
      { name: 'Youth Savings', description: 'Savings for young members.', interestRate: 7.5 },
      { name: 'Fixed Deposit', description: 'Term deposits.', interestRate: 10.5 }
    ],
    loanProducts: [
      {
        name: 'Youth Startup Loan',
        description: 'Seed funding for young entrepreneurs.',
        interestRate: 9.0,
        minAmount: 50000,
        maxAmount: 500000,
        minTenure: 6,
        maxTenure: 36,
        collateral: 'Co-founder guarantee',
        eligibility: 'Age 18-40, startup idea approved by committee',
        processingTime: '5-7 working days'
      },
      {
        name: 'Agriculture & Livestock Loan',
        description: 'Farming and animal husbandry finance.',
        interestRate: 12.0,
        minAmount: 20000,
        maxAmount: 800000,
        minTenure: 6,
        maxTenure: 48,
        collateral: 'Land title or group guarantee',
        eligibility: 'Farmer member',
        processingTime: '5-8 working days'
      }
    ],
    services: [
      { name: 'Youth Skill Program', description: 'Training and startup mentorship.' },
      { name: 'Agri Input Subsidy', description: 'Subsidized seeds and tools.' }
    ],
    announcements: [
      { title: 'Youth Startup Grant', description: 'NPR 5 lakh startup grants for top 3 youth business plans.', date: new Date('2025-11-01') }
    ]
  },
  {
    name: 'Sudurpashchim Samriddhi Saving & Credit Cooperative',
    address: 'Attariya-4, Kailali',
    district: 'Kailali',
    province: 'Sudurpashchim',
    establishedYear: 2012,
    category: 'Agriculture',
    contactEmail: 'samriddhi@example.coop',
    contactPhone: '091-512233',
    registrationNo: 'DOCC-058-149',
    description:
      'Farmer cooperative driving agricultural modernization in the far west, from banana farming to cold storage.',
    colors: { primary: '#166534', secondary: '#16a34a', accent: '#eab308' },
    stats: { memberCount: 3500, totalDeposits: 380000000, totalLoansDisbursed: 300000000, totalSavingsProducts: 3 },
    savingsProducts: [
      { name: 'General Savings', description: 'Standard savings.', interestRate: 6.5 },
      { name: 'Banana Growers Savings', description: 'Special scheme for banana farmers.', interestRate: 7.5 },
      { name: 'Fixed Deposit', description: 'Term deposits.', interestRate: 10.0 }
    ],
    loanProducts: [
      {
        name: 'Banana Farm Loan',
        description: 'Plantation expansion finance.',
        interestRate: 10.5,
        minAmount: 50000,
        maxAmount: 2000000,
        minTenure: 12,
        maxTenure: 72,
        collateral: 'Land title',
        eligibility: 'Banana farmer with land records',
        processingTime: '5-8 working days'
      },
      {
        name: 'Irrigation Equipment Loan',
        description: 'Pumps, drip systems and greenhouse finance.',
        interestRate: 11.0,
        minAmount: 20000,
        maxAmount: 800000,
        minTenure: 6,
        maxTenure: 36,
        collateral: 'Equipment hypothecation',
        eligibility: 'Farmer member',
        processingTime: '4-6 working days'
      }
    ],
    services: [
      { name: 'Cold Storage', description: 'Post-harvest storage facility.' },
      { name: 'Farm Mechanization', description: 'Tractor and tiller rental.' }
    ],
    announcements: []
  },
  {
    name: 'Bagmati Cleaning City Consumer Cooperative',
    address: 'Putalisadak-28, Kathmandu',
    district: 'Kathmandu',
    province: 'Bagmati',
    establishedYear: 2000,
    category: 'Consumer',
    contactEmail: 'bagmaticonsumer@example.coop',
    contactPhone: '01-4422334',
    registrationNo: 'DOCC-058-051',
    description:
      'Consumer cooperative running affordable grocery and daily-need stores for urban members, with savings and credit on the side.',
    colors: { primary: '#0369a1', secondary: '#0ea5e9', accent: '#f97316' },
    stats: { memberCount: 9800, totalDeposits: 1650000000, totalLoansDisbursed: 800000000, totalSavingsProducts: 4 },
    savingsProducts: [
      { name: 'Consumer Savings', description: 'Savings with store discount benefits.', interestRate: 6.0 },
      { name: 'General Savings', description: 'Standard savings.', interestRate: 6.5 },
      { name: 'Festival Fixed Deposit', description: 'Festive season term deposits.', interestRate: 10.5 },
      { name: 'Children Savings', description: 'Kid-friendly savings accounts.', interestRate: 8.0 }
    ],
    loanProducts: [
      {
        name: 'Consumer Loan',
        description: 'Household and durable goods financing.',
        interestRate: 13.5,
        minAmount: 10000,
        maxAmount: 300000,
        minTenure: 1,
        maxTenure: 24,
        collateral: 'Deposit margin or salary deduction',
        eligibility: '6 months membership, income proof',
        processingTime: '2-4 working days'
      },
      {
        name: 'Business Loan',
        description: 'Loans for member-run retail businesses.',
        interestRate: 12.0,
        minAmount: 50000,
        maxAmount: 2000000,
        minTenure: 6,
        maxTenure: 48,
        collateral: 'Property title',
        eligibility: 'Registered business, 1 year membership',
        processingTime: '6-9 working days'
      },
      {
        name: 'Home Appliance Loan',
        description: 'Zero-hassle loans for electronics and appliances.',
        interestRate: 12.0,
        minAmount: 20000,
        maxAmount: 200000,
        minTenure: 3,
        maxTenure: 18,
        collateral: 'Purchase invoice + guarantor',
        eligibility: 'Active member',
        processingTime: '2-3 working days'
      }
    ],
    services: [
      { name: 'Member Store Discounts', description: 'Up to 10% off at member stores.' },
      { name: 'Home Delivery', description: 'Grocery delivery to members.' }
    ],
    announcements: [
      { title: 'Dashain Offer', description: '10% discount on all household items for members this Dashain.', date: new Date('2025-10-12') }
    ]
  }
];

// Sample ratings & reviews (user is seeded below)
const SEED_REVIEWS = [
  { rating: 5, title: 'Best cooperative in the valley', review: 'Very transparent process and quick loan approval. The farmer market is a big plus for fresh produce.' },
  { rating: 4, title: 'Good interest rates', review: 'Competitive fixed deposit rates and friendly staff. Approval took a bit longer than expected.' },
  { rating: 5, title: 'Community first', review: 'They genuinely care about members. My agri loan helped my farm grow.' },
  { rating: 3, title: 'Decent but slow', review: 'Good services but the branch queues are long during festivals.' },
  { rating: 4, title: 'Satisfied member', review: 'Smooth digital membership onboarding. Would recommend.' },
  { rating: 5, title: 'Excellent support', review: 'The staff guided me through every step of my business loan.' },
  { rating: 2, title: 'Processing delay', review: 'Loan processing took over two weeks despite the promise of seven days.' }
];

const seed = async () => {
  try {
    console.log('Seeding cooperatives...');

    // Clean previous seeds
    const names = COOPS.map(c => c.name);
    const oldCoops = await Cooperative.find({ name: { $in: names } });
    const oldIds = oldCoops.map(c => c._id);
    if (oldIds.length) {
      await CooperativeProfile.deleteMany({ cooperativeId: { $in: oldIds } });
      await Rating.deleteMany({ cooperative: { $in: oldIds } });
      await MembershipApplication.deleteMany({ cooperative: { $in: oldIds } });
      await Cooperative.deleteMany({ _id: { $in: oldIds } });
      await User.deleteMany({ cooperativeId: { $in: oldIds } });
      console.log(`Removed ${oldIds.length} previous seeded cooperatives`);
    }

    await User.deleteMany({ email: { $in: ['admin@coopbank.com.np', 'manager@coopbank.com.np', 'demo@member.com.np'] } });

    // Platform admin
    const platformAdmin = await User.create({
      name: 'Platform Admin',
      email: 'admin@coopbank.com.np',
      password: 'Admin@123',
      role: 'admin',
      status: 'active',
      isVerified: true
    });
    console.log('Platform admin created:', platformAdmin.email);

    const createdCoops = [];

    for (let ci = 0; ci < COOPS.length; ci++) {
      const coopData = COOPS[ci];
      const managerEmail = coopData.name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '') + '@coop.com.np';

      const manager = await User.create({
        name: `${coopData.name} Manager`,
        email: managerEmail,
        password: 'Manager@123',
        role: 'manager',
        status: 'active',
        isVerified: true,
        branch: 'Head Office'
      });

      const coop = await Cooperative.create({
        name: coopData.name,
        address: coopData.address,
        district: coopData.district,
        province: coopData.province,
        establishedYear: coopData.establishedYear,
        category: coopData.category,
        contactEmail: coopData.contactEmail,
        contactPhone: coopData.contactPhone,
        registrationNo: coopData.registrationNo,
        createdBy: platformAdmin._id,
        managers: [manager._id],
        members: [],
        status: 'active',
        subscriptionPlan: 'premium',
        subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      });

      manager.cooperativeId = coop._id;
      await manager.save();

      const profile = await CooperativeProfile.create({
        cooperativeId: coop._id,
        appName: coopData.name,
        description: coopData.description,
        colors: coopData.colors,
        stats: coopData.stats,
        savingsProducts: coopData.savingsProducts,
        loanProducts: coopData.loanProducts,
        services: coopData.services,
        announcements: coopData.announcements
      });

      // Seed 3-5 reviews per cooperative
      const reviewCount = 3 + (coopData.name.length % 3); // 3..5
      for (let i = 0; i < reviewCount; i++) {
        const review = SEED_REVIEWS[i % SEED_REVIEWS.length];
        const reviewer = await User.create({
          name: `Member ${coopData.name.split(' ')[0]} ${i + 1}`,
          email: `seedreviewer${ci}${i}@mail.com`,
          password: 'Member@123',
          role: 'member',
          status: 'active',
          isVerified: true,
          cooperativeId: coop._id
        });
        await Rating.create({
          cooperative: coop._id,
          user: reviewer._id,
          rating: review.rating,
          title: review.title,
          review: review.review,
          isMember: i < reviewCount - 1, // all but last are members
          status: 'published'
        });
      }

      createdCoops.push({ coop, profile, manager });
      console.log(`Seeded: ${coopData.name} (${coopData.district})`);
    }

    // Demo member account (can be used to try the member flow)
    const demoMember = await User.create({
      name: 'Demo Member',
      email: 'demo@member.com.np',
      password: 'Member@123',
      role: 'member',
      status: 'active',
      isVerified: true
    });
    console.log('Demo member created:', demoMember.email);

    console.log('\n============================================================');
    console.log('SEED COMPLETE');
    console.log('============================================================');
    console.log(`Admin:      admin@coopbank.com.np / Admin@123`);
    console.log(`Managers:   <firstword>@coop.com.np / Manager@123`);
    console.log(`Demo member: demo@member.com.np / Member@123`);
    console.log(`Total cooperatives seeded: ${createdCoops.length}`);
    console.log('============================================================');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected for seeding'))
  .then(seed)
  .catch(err => console.error('DB connection error:', err));
