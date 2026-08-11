
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

// ======================================================
// LOAD ENVIRONMENT VARIABLES
// ======================================================

dotenv.config();

// ======================================================
// INITIALIZE APP
// ======================================================

const app = express();
const httpServer = http.createServer(app);

// ======================================================
// TRUST PROXY
// ======================================================
//
// Render runs the application behind a reverse proxy.
// This allows Express to correctly read X-Forwarded-For
// and allows express-rate-limit to identify client IPs.
//
// IMPORTANT: This must be set before the rate limiter.
//

app.set('trust proxy', 1);

// ======================================================
// INITIALIZE SOCKET.IO
// ======================================================

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
//
// Frontend:
// https://sahakari.hiteshpant.com.np
//
// Backend:
// https://sahakari-connect.onrender.com
//
// Credentials are enabled because authentication may use
// HTTP-only cookies.
//

const allowedOrigins = [
  'https://sahakari.hiteshpant.com.np',

  // Add localhost development URLs if needed
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin header
      // such as server-to-server requests, health checks,
      // and some development tools.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // In development, allow any origin.
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }

      return callback(
        new Error('Not allowed by CORS')
      );
    },
    credentials: true,
    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
    ],
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

  windowMs: 60 * 60 * 1000,

  message: {
    success: false,
    message:
      'Too many requests from this IP, please try again in an hour!',
  },

  standardHeaders: true,
  legacyHeaders: false,
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

app.use(
  express.urlencoded({
    extended: true,
    limit: '25mb',
  })
);

// ======================================================
// WEBHOOKS
// ======================================================
//
// Keep webhook routes before other middleware if your
// payment provider requires the raw request body.
//

app.use(
  '/api/webhooks',
  require('./routes/webhookRoutes')
);

// ======================================================
// SECURITY / PARAMETER POLLUTION
// ======================================================

app.use(hpp());

// ======================================================
// STATIC UPLOADS
// ======================================================

app.use(
  '/uploads',
  express.static(
    path.join(__dirname, 'uploads')
  )
);

// ======================================================
// TENANT RESOLUTION
// ======================================================

app.use(tenantResolver);

// ======================================================
// ROOT API STATUS
// ======================================================

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Sahakari Connect API is running',
    environment:
      process.env.NODE_ENV || 'production',
  });
});

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

// ------------------------------------------------------
// Authentication
// ------------------------------------------------------

app.use(
  '/api/auth',
  require('./routes/authRoutes')
);

// ------------------------------------------------------
// Users
// ------------------------------------------------------

app.use(
  '/api/users',
  require('./routes/userRoutes')
);

// ------------------------------------------------------
// Branches
// ------------------------------------------------------

app.use(
  '/api/branches',
  require('./routes/branchRoutes')
);

// ------------------------------------------------------
// Customers
// ------------------------------------------------------

app.use(
  '/api/customers',
  require('./routes/customerRoutes')
);

// ------------------------------------------------------
// Accounts
// ------------------------------------------------------

app.use(
  '/api/accounts',
  require('./routes/accountRoutes')
);

// ------------------------------------------------------
// Transactions
// ------------------------------------------------------

app.use(
  '/api/transactions',
  require('./routes/transactionRoutes')
);

// ------------------------------------------------------
// Withdrawals
// ------------------------------------------------------

app.use(
  '/api/withdrawals',
  require('./routes/withdrawalRoutes')
);

// ------------------------------------------------------
// Loans
// ------------------------------------------------------

app.use(
  '/api/loans',
  require('./routes/loanRoutes')
);

// ------------------------------------------------------
// Dashboard
// ------------------------------------------------------

app.use(
  '/api/dashboard',
  require('./routes/dashboardRoutes')
);

// ------------------------------------------------------
// Cooperatives
// ------------------------------------------------------

app.use(
  '/api/cooperatives',
  require('./routes/cooperativeRoutes')
);

// ------------------------------------------------------
// Cooperative KYC
// ------------------------------------------------------

app.use(
  '/api/cooperative-kyc',
  require('./routes/cooperativeKycRoutes')
);

// ------------------------------------------------------
// Member
// ------------------------------------------------------

app.use(
  '/api/member',
  require('./routes/memberRoutes')
);

// ------------------------------------------------------
// Payments
// ------------------------------------------------------

app.use(
  '/api/payments',
  require('./routes/paymentRoutes')
);

// ------------------------------------------------------
// SMS
// ------------------------------------------------------

app.use(
  '/api/sms',
  require('./routes/smsRoutes')
);

// ======================================================
// HEALTH CHECK
// ======================================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    environment:
      process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
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

    // ==================================================
    // START SERVER
    // ==================================================

    const PORT = process.env.PORT || 5000;

    httpServer.listen(PORT, () => {
      logger.info(
        `Server running on port ${PORT}`
      );
    });
  })
  .catch((err) => {
    logger.error(
      'MongoDB connection error:',
      err
    );

    process.exit(1);
  });

