const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
// const mongoSanitize = require('express-mongo-sanitize');
// const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const tenantResolver = require('./middleware/tenantResolver');
const AppError = require('./utils/appError');
const { initSocket } = require('./services/socketService');

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
initSocket(httpServer);

// Middleware
// Set security HTTP headers
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Allow images to load across domains if needed

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const cookieParser = require('cookie-parser');

// Allow origins from CORS_ORIGINS (comma-separated), defaulting to local dev
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Allow non-browser clients (curl, cloudflared, tests) with no Origin header
    if (!origin || corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new AppError(`Origin ${origin} not allowed by CORS`, 403));
    }
  },
  credentials: true
}));

app.use(cookieParser());

// Limit requests from same API
const limiter = rateLimit({
  max: process.env.NODE_ENV === 'development' ? 5000 : 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

app.use(express.json({ limit: '25mb' }));

app.use('/api/webhooks', require('./routes/webhookRoutes'));


// Data sanitization against NoSQL query injection
// app.use(mongoSanitize({ replaceWith: '_'}));

// Data sanitization against XSS
// app.use(xss());

// Prevent parameter pollution
app.use(hpp());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Tenant Resolution Middleware
app.use(tenantResolver);

// Public Tenant Configuration Endpoint
app.get('/api/public/tenant', (req, res) => {
  if (req.tenant) {
    res.json({ success: true, profile: req.tenant });
  } else {
    // Return a default generic profile if no tenant found for the domain
    res.json({
      success: true,
      profile: {
        appName: 'Platform Platform',
        colors: { primary: '#0f172a', secondary: '#3b82f6', accent: '#10b981' },
        logo: '',
        favicon: ''
      }
    });
  }
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/branches', require('./routes/branchRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/accounts', require('./routes/accountRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/withdrawals', require('./routes/withdrawalRoutes'));
app.use('/api/loans', require('./routes/loanRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/cooperatives', require('./routes/cooperativeRoutes'));
app.use('/api/cooperative-kyc', require('./routes/cooperativeKycRoutes'));
app.use('/api/member', require('./routes/memberRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/sms', require('./routes/smsRoutes'));

// Handle undefined routes
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(errorHandler);

// Database Connection
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
  });
