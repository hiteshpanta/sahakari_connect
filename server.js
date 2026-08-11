const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const tenantResolver = require('./middleware/tenantResolver');
const AppError = require('./utils/appError');
const { initSocket } = require('./services/socketService');

// Load environment variables
dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.IO
initSocket(httpServer);

// ======================================================
// SECURITY HEADERS
// ======================================================

app.use(helmet());

app.use(
  helmet.crossOriginResourcePolicy({
    policy: 'cross-origin',
  })
);

// ======================================================
// LOGGING
// ======================================================

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ======================================================
// CORS
// ======================================================

// Allow all origins.
//
// Because credentials are enabled, we use `origin: true`
// instead of `origin: '*'`.
//
// This reflects the requesting Origin back to the browser.
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// ======================================================
// COOKIES
// ======================================================

app.use(cookieParser());

// ======================================================
// RATE LIMITING
// ======================================================

const limiter = rateLimit({
  max: process.env.NODE_ENV === 'development' ? 5000 : 100,

  windowMs: 60 * 60 * 1000, // 1 hour

  message: 'Too many requests from this IP, please try again in an hour!',
});

app.use('/api', limiter);

// ======================================================
// BODY PARSING
// ======================================================

app.use(
  express.json({
    limit: '25mb',
  })
);

// ======================================================
// WEBHOOKS
// ======================================================

// Keep webhook routes before other middleware if your
// payment provider requires the raw request body.
app.use('/api/webhooks', require('./routes/webhookRoutes'));

// ======================================================
// SECURITY / PARAMETER POLLUTION
// ======================================================

app.use(hpp());

// ======================================================
// STATIC UPLOADS
// ======================================================

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

// ======================================================
// TENANT RESOLUTION
// ======================================================

app.use(tenantResolver);

// ======================================================
// PUBLIC TENANT CONFIGURATION
// ======================================================

app.get('/api/public/tenant', (req, res) => {
  if (req.tenant) {
    return res.json({
      success: true,
      profile: req.tenant,
    });
  }

  return res.json({
    success: true,
    profile: {
      appName: 'Platform Platform',

      colors: {
        primary: '#0f172a',
        secondary: '#3b82f6',
        accent: '#10b981',
      },

      logo: '',
      favicon: '',
    },
  });
});

// ======================================================
// API ROUTES
// ======================================================

// Authentication
app.use('/api/auth', require('./routes/authRoutes'));

// Users
app.use('/api/users', require('./routes/userRoutes'));

// Branches
app.use('/api/branches', require('./routes/branchRoutes'));

// Customers
app.use('/api/customers', require('./routes/customerRoutes'));

// Accounts
app.use('/api/accounts', require('./routes/accountRoutes'));

// Transactions
app.use('/api/transactions', require('./routes/transactionRoutes'));

// Withdrawals
app.use('/api/withdrawals', require('./routes/withdrawalRoutes'));

// Loans
app.use('/api/loans', require('./routes/loanRoutes'));

// Dashboard
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Cooperatives
app.use('/api/cooperatives', require('./routes/cooperativeRoutes'));

// Cooperative KYC
app.use(
  '/api/cooperative-kyc',
  require('./routes/cooperativeKycRoutes')
);

// Member
app.use('/api/member', require('./routes/memberRoutes'));

// Payments
app.use('/api/payments', require('./routes/paymentRoutes'));

// SMS
app.use('/api/sms', require('./routes/smsRoutes'));

// ======================================================
// HEALTH CHECK
// ======================================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    environment: process.env.NODE_ENV || 'production',
  });
});

// ======================================================
// UNDEFINED ROUTES
// ======================================================

app.use((req, res, next) => {
  next(
    new AppError(
      `Can't find ${req.originalUrl} on this server!`,
      404
    )
  );
});

// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use(errorHandler);

// ======================================================
// DATABASE CONNECTION
// ======================================================

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');

    const PORT = process.env.PORT || 5000;

    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('MongoDB connection error:', err);

    process.exit(1);
  });
