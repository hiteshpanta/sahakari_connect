// ------------------------------------------------------------------
// Fallback mock data used when the backend API is unavailable.
// Mirrors the structure of the seeded MongoDB data (see backend/seedCoops.js).
// ------------------------------------------------------------------

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  MEMBER: 'member'
};

export const cooperatives = [
  {
    _id: 'coop001',
    name: 'Sajha Sahakari Sanstha',
    address: 'Balkhu, Kathmandu',
    district: 'Kathmandu',
    province: 'Bagmati',
    establishedYear: 1958,
    category: 'Multi-purpose',
    contactEmail: 'info@sajhasahakari.org',
    contactPhone: '01-5123456',
    registrationNo: 'DOCC-058-001',
    status: 'active',
    subscriptionPlan: 'premium',
    avgRating: 4.7,
    reviewCount: 5,
    memberCount: 12500
  },
  {
    _id: 'coop002',
    name: 'Nepal Gramin Saving & Credit Cooperative',
    address: 'Suryabinayak, Bhaktapur',
    district: 'Bhaktapur',
    province: 'Bagmati',
    establishedYear: 2001,
    category: 'Saving & Credit',
    contactEmail: 'info@nepalgramin.coop',
    contactPhone: '01-6611223',
    registrationNo: 'DOCC-058-042',
    status: 'active',
    subscriptionPlan: 'premium',
    avgRating: 4.2,
    reviewCount: 4,
    memberCount: 8300
  },
  {
    _id: 'coop003',
    name: 'Annapurna Multipurpose Cooperative',
    address: 'Lakeside-6, Pokhara',
    district: 'Kaski',
    province: 'Gandaki',
    establishedYear: 1998,
    category: 'Multi-purpose',
    contactEmail: 'contact@annapurnacoop.com.np',
    contactPhone: '061-452233',
    registrationNo: 'DOCC-058-033',
    status: 'active',
    subscriptionPlan: 'premium',
    avgRating: 4.4,
    reviewCount: 5,
    memberCount: 6400
  },
  {
    _id: 'coop004',
    name: 'Himalaya Saving & Credit Cooperative',
    address: 'Damak-5, Jhapa',
    district: 'Jhapa',
    province: 'Koshi',
    establishedYear: 2005,
    category: 'Saving & Credit',
    contactEmail: 'info@himalayascc.coop',
    contactPhone: '023-581234',
    registrationNo: 'DOCC-058-077',
    status: 'active',
    subscriptionPlan: 'basic',
    avgRating: 4.0,
    reviewCount: 3,
    memberCount: 5200
  },
  {
    _id: 'coop005',
    name: 'Koshi Bikash Saving & Credit Cooperative',
    address: 'Inaruwa-4, Sunsari',
    district: 'Sunsari',
    province: 'Koshi',
    establishedYear: 2003,
    category: 'Saving & Credit',
    contactEmail: 'koshibikash@example.coop',
    contactPhone: '025-521234',
    registrationNo: 'DOCC-058-064',
    status: 'active',
    subscriptionPlan: 'basic',
    avgRating: 4.1,
    reviewCount: 4,
    memberCount: 4100
  },
  {
    _id: 'coop006',
    name: 'Chitwan Multipurpose Cooperative',
    address: 'Bharatpur-10, Chitwan',
    district: 'Chitwan',
    province: 'Bagmati',
    establishedYear: 2002,
    category: 'Agriculture',
    contactEmail: 'chitwancoop@example.coop',
    contactPhone: '056-592233',
    registrationNo: 'DOCC-058-089',
    status: 'active',
    subscriptionPlan: 'premium',
    avgRating: 4.3,
    reviewCount: 4,
    memberCount: 7300
  },
  {
    _id: 'coop007',
    name: 'Lumbini Bikas Saving & Credit Cooperative',
    address: 'Buddhanagar-4, Butwal',
    district: 'Rupandehi',
    province: 'Lumbini',
    establishedYear: 2004,
    category: 'Saving & Credit',
    contactEmail: 'lumbinibikas@example.coop',
    contactPhone: '071-541234',
    registrationNo: 'DOCC-058-101',
    status: 'active',
    subscriptionPlan: 'premium',
    avgRating: 4.5,
    reviewCount: 3,
    memberCount: 5800
  },
  {
    _id: 'coop008',
    name: 'Janahit Saving & Credit Cooperative',
    address: 'Pipra-5, Birgunj',
    district: 'Parsa',
    province: 'Madhesh',
    establishedYear: 2006,
    category: 'Thrift',
    contactEmail: 'janahit@example.coop',
    contactPhone: '051-512233',
    registrationNo: 'DOCC-058-113',
    status: 'active',
    subscriptionPlan: 'basic',
    avgRating: 3.9,
    reviewCount: 3,
    memberCount: 3900
  },
  {
    _id: 'coop009',
    name: 'Gandaki Samajik Saving & Credit Cooperative',
    address: 'Waling-3, Syangja',
    district: 'Syangja',
    province: 'Gandaki',
    establishedYear: 2008,
    category: 'Saving & Credit',
    contactEmail: 'gandakisamajik@example.coop',
    contactPhone: '063-442233',
    registrationNo: 'DOCC-058-125',
    status: 'active',
    subscriptionPlan: 'free',
    avgRating: 4.6,
    reviewCount: 5,
    memberCount: 2700
  },
  {
    _id: 'coop010',
    name: 'Karnali Development Saving & Credit Cooperative',
    address: 'Birendranagar-8, Surkhet',
    district: 'Surkhet',
    province: 'Karnali',
    establishedYear: 2010,
    category: 'Saving & Credit',
    contactEmail: 'karnali@example.coop',
    contactPhone: '083-521234',
    registrationNo: 'DOCC-058-137',
    status: 'active',
    subscriptionPlan: 'basic',
    avgRating: 4.8,
    reviewCount: 4,
    memberCount: 2100
  },
  {
    _id: 'coop011',
    name: 'Sudurpashchim Samriddhi Saving & Credit Cooperative',
    address: 'Attariya-4, Kailali',
    district: 'Kailali',
    province: 'Sudurpashchim',
    establishedYear: 2012,
    category: 'Agriculture',
    contactEmail: 'samriddhi@example.coop',
    contactPhone: '091-512233',
    registrationNo: 'DOCC-058-149',
    status: 'active',
    subscriptionPlan: 'basic',
    avgRating: 4.2,
    reviewCount: 3,
    memberCount: 3500
  },
  {
    _id: 'coop012',
    name: 'Bagmati Cleaning City Consumer Cooperative',
    address: 'Putalisadak-28, Kathmandu',
    district: 'Kathmandu',
    province: 'Bagmati',
    establishedYear: 2000,
    category: 'Consumer',
    contactEmail: 'bagmaticonsumer@example.coop',
    contactPhone: '01-4422334',
    registrationNo: 'DOCC-058-051',
    status: 'active',
    subscriptionPlan: 'premium',
    avgRating: 4.4,
    reviewCount: 4,
    memberCount: 9800
  }
];

export const cooperativeProfiles = cooperatives.map(c => ({
  cooperativeId: c._id,
  appName: c.name,
  description: `${c.name} is a trusted ${c.category.toLowerCase()} cooperative in ${c.district}, ${c.province}, Nepal, serving local communities with savings, credit and development programs.`,
  colors: { primary: '#10B981', secondary: '#3B82F6', accent: '#F59E0B' },
  stats: { memberCount: c.memberCount, totalDeposits: 0, totalLoansDisbursed: 0, totalSavingsProducts: 3 },
  savingsProducts: [
    { name: 'General Savings', description: 'Everyday savings with flexible withdrawals.', interestRate: 6.5 },
    { name: 'Fixed Deposit', description: 'Term deposits with attractive rates.', interestRate: 10.0 },
    { name: 'Recurring Deposit', description: 'Build a habit of monthly savings.', interestRate: 8.5 }
  ],
  loanProducts: [
    {
      name: 'Personal Loan',
      description: 'Quick personal loans for active members.',
      interestRate: 13.5,
      minAmount: 10000,
      maxAmount: 500000,
      minTenure: 3,
      maxTenure: 24,
      collateral: 'Two guarantors or deposit margin',
      eligibility: 'Active member with regular savings',
      processingTime: '2-4 working days'
    },
    {
      name: 'Business Loan',
      description: 'Working capital and expansion loans.',
      interestRate: 12.5,
      minAmount: 50000,
      maxAmount: 3000000,
      minTenure: 6,
      maxTenure: 48,
      collateral: 'Property title or fixed deposit margin',
      eligibility: 'Registered business, 1 year of operations',
      processingTime: '6-10 working days'
    },
    {
      name: 'Agricultural Loan',
      description: 'Seasonal farming and livestock finance.',
      interestRate: 11.0,
      minAmount: 20000,
      maxAmount: 1000000,
      minTenure: 6,
      maxTenure: 48,
      collateral: 'Land title or group guarantee',
      eligibility: 'Farmer member with land records',
      processingTime: '5-8 working days'
    }
  ],
  services: [
    { name: 'SMS Banking', description: 'Balance inquiry and alerts via SMS.' },
    { name: 'Remittance', description: 'Fast domestic fund transfer.' }
  ],
  announcements: [
    { title: 'Digital Membership', content: 'Apply for membership online in minutes.', date: new Date('2025-08-15') },
    { title: 'AGM Announced', content: 'Annual General Meeting coming up soon.', date: new Date('2025-10-01') }
  ]
}));

export const customers = [
  {
    _id: 'cust001',
    name: 'Sita Sharma',
    phone: '9845123456',
    email: 'sita@mail.com',
    address: 'Pokhara-5, Kaski',
    branch: 'Head Office',
    gender: 'Female',
    dob: '1995-03-15',
    citizenshipNo: '33-01-76-12345',
    status: 'active',
    whatsapp: '9845123456',
    cooperativeId: 'coop001',
    joinDate: '2023-01-10'
  },
  {
    _id: 'cust002',
    name: 'Bijay Gurung',
    phone: '9812345678',
    email: 'bijay@mail.com',
    address: 'Bharatpur-10, Chitwan',
    branch: 'Head Office',
    gender: 'Male',
    dob: '1990-08-22',
    citizenshipNo: '35-02-72-54321',
    status: 'active',
    whatsapp: '9812345678',
    cooperativeId: 'coop002',
    joinDate: '2023-03-05'
  },
  {
    _id: 'cust003',
    name: 'Laxmi Shrestha',
    phone: '9861234567',
    email: 'laxmi@mail.com',
    address: 'Lagankhel, Lalitpur',
    branch: 'Head Office',
    gender: 'Female',
    dob: '1988-11-02',
    citizenshipNo: '28-01-88-99887',
    status: 'active',
    whatsapp: '9861234567',
    cooperativeId: 'coop001',
    joinDate: '2022-06-18'
  }
];

export const branches = [
  { _id: 'br001', name: 'Head Office', location: 'Kathmandu', phone: '01-5123456', established: '2010-01-01', status: 'active', customers: 1200, accounts: 1500, loans: 400, cooperativeId: 'coop001' },
  { _id: 'br002', name: 'Pokhara Branch', location: 'Pokhara', phone: '061-452233', established: '2012-05-01', status: 'active', customers: 800, accounts: 950, loans: 250, cooperativeId: 'coop003' },
  { _id: 'br003', name: 'Chitwan Branch', location: 'Chitwan', phone: '056-592233', established: '2015-09-01', status: 'active', customers: 600, accounts: 700, loans: 180, cooperativeId: 'coop006' }
];

export const accounts = [
  { _id: 'acc001', accountNo: 'AAM1000001', customerId: 'cust001', customerName: 'Sita Sharma', type: 'Savings', branch: 'Head Office', balance: 250000, openDate: '2023-01-12', status: 'active', interestRate: 6.5, cooperativeId: 'coop001' },
  { _id: 'acc002', accountNo: 'AAM1000002', customerId: 'cust001', customerName: 'Sita Sharma', type: 'Fixed Deposit', branch: 'Head Office', balance: 500000, openDate: '2023-02-01', status: 'active', interestRate: 10.0, cooperativeId: 'coop001' },
  { _id: 'acc003', accountNo: 'AAM2000001', customerId: 'cust002', customerName: 'Bijay Gurung', type: 'Savings', branch: 'Head Office', balance: 175000, openDate: '2023-03-06', status: 'active', interestRate: 6.5, cooperativeId: 'coop002' },
  { _id: 'acc004', accountNo: 'AAM1000003', customerId: 'cust003', customerName: 'Laxmi Shrestha', type: 'Current', branch: 'Head Office', balance: 820000, openDate: '2022-06-20', status: 'active', interestRate: 4.0, cooperativeId: 'coop001' }
];

export const transactions = [
  { _id: 'txn001', txnNo: 'TXN20250001', accountNo: 'AAM1000001', accountId: 'acc001', customerId: 'cust001', customerName: 'Sita Sharma', type: 'Deposit', amount: 50000, balance: 250000, date: '2025-08-01', time: '10:15 AM', branch: 'Head Office', remarks: 'Savings deposit', status: 'completed', cooperativeId: 'coop001' },
  { _id: 'txn002', txnNo: 'TXN20250002', accountNo: 'AAM1000001', accountId: 'acc001', customerId: 'cust001', customerName: 'Sita Sharma', type: 'Withdrawal', amount: 15000, balance: 235000, date: '2025-08-05', time: '11:30 AM', branch: 'Head Office', remarks: 'ATM withdrawal', status: 'completed', cooperativeId: 'coop001' },
  { _id: 'txn003', txnNo: 'TXN20250003', accountNo: 'AAM2000001', accountId: 'acc003', customerId: 'cust002', customerName: 'Bijay Gurung', type: 'Deposit', amount: 25000, balance: 175000, date: '2025-08-03', time: '02:00 PM', branch: 'Head Office', remarks: 'Salary deposit', status: 'completed', cooperativeId: 'coop002' },
  { _id: 'txn004', txnNo: 'TXN20250004', accountNo: 'AAM1000003', accountId: 'acc004', customerId: 'cust003', customerName: 'Laxmi Shrestha', type: 'Interest Credit', amount: 5400, balance: 825400, date: '2025-07-31', time: '12:00 AM', branch: 'Head Office', remarks: 'Monthly interest', status: 'completed', cooperativeId: 'coop001' }
];

export const loans = [
  { _id: 'loan001', loanNo: 'LAM1000001', customerId: 'cust001', customerName: 'Sita Sharma', accountNo: 'AAM1000001', type: 'Personal', amount: 300000, disbursed: 300000, outstanding: 210000, interestRate: 13.5, tenure: 24, emiAmount: 14500, status: 'active', applyDate: '2024-06-15', approveDate: '2024-06-20', disbursedDate: '2024-06-22', nextEmiDate: '2025-08-15', paidEmis: 8, totalEmis: 24, branch: 'Head Office', purpose: 'Education', cooperativeId: 'coop001' },
  { _id: 'loan002', loanNo: 'LAM1000002', customerId: 'cust003', customerName: 'Laxmi Shrestha', accountNo: 'AAM1000003', type: 'Business', amount: 1000000, disbursed: 1000000, outstanding: 720000, interestRate: 12.5, tenure: 36, emiAmount: 33500, status: 'active', applyDate: '2023-11-10', approveDate: '2023-11-18', disbursedDate: '2023-11-20', nextEmiDate: '2025-08-10', paidEmis: 18, totalEmis: 36, branch: 'Head Office', purpose: 'Shop expansion', cooperativeId: 'coop001' }
];

export const loanRepayments = [
  { _id: 'rep001', loanId: 'loan001', loanNo: 'LAM1000001', amount: 14500, date: '2025-08-15', status: 'paid', method: 'Cash' },
  { _id: 'rep002', loanId: 'loan002', loanNo: 'LAM1000002', amount: 33500, date: '2025-08-10', status: 'paid', method: 'Bank Transfer' }
];

export const users = [
  { _id: 'usr001', name: 'Ram Bahadur Thapa', email: 'ram@coop.com', role: 'manager', status: 'active', cooperativeId: 'coop001' },
  { _id: 'usr002', name: 'Platform Admin', email: 'admin@coopbank.com.np', role: 'admin', status: 'active' },
  { _id: 'usr003', name: 'Sita Sharma', email: 'sita@mail.com', role: 'member', status: 'active', cooperativeId: 'coop001' }
];

export const whatsappLogs = [
  { _id: 'wa001', customerId: 'cust001', customerName: 'Sita Sharma', phone: '9845123456', message: 'Balance inquiry via WhatsApp', status: 'delivered', sentAt: '2025-08-02T10:00:00Z' },
  { _id: 'wa002', customerId: 'cust002', customerName: 'Bijay Gurung', phone: '9812345678', message: 'Loan reminder', status: 'delivered', sentAt: '2025-08-04T09:30:00Z' }
];

export const smsLogs = [
  { _id: 'sms001', customerId: 'cust001', customerName: 'Sita Sharma', phone: '9845123456', message: 'BAL AAM1000001: NPR 250,000', status: 'sent', sentAt: '2025-08-02T10:00:00Z' }
];

export const pendingSyncQueue = [
  { _id: 'sync001', type: 'Transaction', data: 'Deposit to AAM1000005', createdAt: '2025-08-05T10:00:00Z' },
  { _id: 'sync002', type: 'Customer', data: 'New customer: Kiran Rai', createdAt: '2025-08-05T10:05:00Z' }
];

export const monthlyTransactionData = [
  { month: 'Feb', deposits: 1200000, withdrawals: 800000 },
  { month: 'Mar', deposits: 1500000, withdrawals: 950000 },
  { month: 'Apr', deposits: 1400000, withdrawals: 1100000 },
  { month: 'May', deposits: 1800000, withdrawals: 1200000 },
  { month: 'Jun', deposits: 2100000, withdrawals: 1300000 },
  { month: 'Jul', deposits: 2500000, withdrawals: 1600000 }
];

export const loanPortfolioData = [
  { name: 'Agriculture', value: 35 },
  { name: 'Business', value: 30 },
  { name: 'Housing', value: 20 },
  { name: 'Personal', value: 15 }
];

export const branchPerformanceData = [
  { name: 'Head Office', deposits: 2500000, loans: 1800000 },
  { name: 'Pokhara Branch', deposits: 1800000, loans: 1200000 },
  { name: 'Chitwan Branch', deposits: 1200000, loans: 900000 }
];
