const express = require('express');
console.log('✓ Imported express');
// Version: 1.0.1 - Password reset fixes
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const customLimiter = require('./config/rateLimit');
const multer = require('multer');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
console.log('✓ All requires loaded');

// Log environment information early
console.log('\n=== STARTUP DIAGNOSTICS ===');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
console.log(`PORT: ${process.env.PORT || '5000'}`);
console.log(`RENDER: ${process.env.RENDER || 'undefined'}`);
console.log(`RENDER_INSTANCE_ID: ${process.env.RENDER_INSTANCE_ID || 'undefined'}`);
console.log(`========================\n`);

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Log email configuration status
console.log('\n=== EMAIL CONFIGURATION ===');
const hasEmailUser = !!process.env.EMAIL_USER;
const hasEmailPass = !!process.env.EMAIL_PASSWORD;
console.log(`EMAIL_USER configured: ${hasEmailUser ? '✅ YES' : '❌ NO'}`);
console.log(`EMAIL_PASSWORD configured: ${hasEmailPass ? '✅ YES' : '❌ NO'}`);
if (hasEmailUser) {
  const user = process.env.EMAIL_USER;
  console.log(`EMAIL_USER: ${user.substring(0, 3)}***@${user.split('@')[1] || 'unknown'}`);
}
console.log(`========================\n`);
console.log('✓ Env loaded');

const { connectDB } = require('./config/database');
const SocketManager = require('./services/socketManager');
console.log('✓ Dependencies loaded');

// Import routes
const authRoutes = require('./routes/auth');
const calendarRoutes = require('./routes/calendar');
const commitmentRoutes = require('./routes/commitments');
const crmRoutes = require('./routes/crm');
const emailRoutes = require('./routes/email');
const emailTemplatesRoutes = require('./routes/emailTemplates');
const subscriptionRoutes = require('./routes/subscriptions');
const managerRoutes = require('./routes/manager');
const uploadRoutes = require('./routes/upload');
const healthRoutes = require('./routes/health');
const contactRoutes = require('./routes/contacts');
const taskRoutes = require('./routes/tasks');
const noteRoutes = require('./routes/notes');
const analyticsRoutes = require('./routes/analytics');
const dealsRoutes = require('./routes/deals');
const bulkOperationsRoutes = require('./routes/bulkOperations');
const forecastingRoutes = require('./routes/forecasting');
const reportsRoutes = require('./routes/reports');
const teamsRoutes = require('./routes/teams');
const automationsRoutes = require('./routes/automations');
const notificationsRoutes = require('./routes/notifications');
console.log('✓ All routes imported');

const app = express();
console.log('✓ Express app created');

// Trust proxy headers from Render/load balancers (required for rate limiting and IP detection)
app.set('trust proxy', 1);
console.log('✓ Proxy trust configured');

const server = http.createServer(app);
console.log('✓ HTTP server created');

const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});
console.log('✓ Socket.io initialized');

// Initialize Socket Manager
const socketManager = new SocketManager(io);
socketManager.initializeHandlers();
console.log('✓ SocketManager initialized');

// Add global error handlers
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  if (reason instanceof Error) {
    console.error(reason.stack);
  }
});
console.log('✓ Error handlers registered');

// Make socketManager available to routes
app.use((req, res, next) => {
  req.socketManager = socketManager;
  next();
});
console.log('✓ SocketManager middleware added');

// Connect to database
console.log('⏳ Connecting to database...');
connectDB().catch(err => {
  console.error('Failed to connect to database:', err);
});
console.log('✓ connectDB() called');


// Security middleware
console.log('⏳ Setting up middleware...');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000']
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'https://deal-clarity-engine.vercel.app',
      'https://dealclarity-engine.vercel.app',
      'https://app.deal-clarity.com',
      'https://deal-clarity-engine.onrender.com',
      /https:\/\/deal-clarity-engine.*\.vercel\.app$/,
      /https:\/\/dealclarity-engine.*\.vercel\.app$/
    ];
    
    if (!origin || allowedOrigins.some(allowed => 
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    )) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      callback(null, true); // Allow anyway for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Timestamp'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Rate limiting (shared config)
app.use('/api/', customLimiter);

// More aggressive rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes (more lenient)
  message: {
    error: 'Too many authentication attempts, please try again in 15 minutes'
  },
  skip: (req, res) => {
    // Skip rate limiting for local development
    return process.env.NODE_ENV === 'development';
  }
});

app.use('/api/auth/', authLimiter);

// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (for uploads)
app.use('/uploads', express.static('uploads'));
console.log('✓ Middleware configured');

// Routes
console.log('⏳ Registering routes...');
app.use('/api/auth', authRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/commitments', commitmentRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/email-templates', emailTemplatesRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/deals', bulkOperationsRoutes);
app.use('/api/forecasting', forecastingRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/automations', automationsRoutes);
app.use('/api/notifications', notificationsRoutes);
console.log('✓ All routes registered');

// Welcome route
console.log('⏳ Setting up welcome route...');
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Deal Clarity Engine API',
    version: '1.0.0',
    documentation: `${req.protocol}://${req.get('host')}/api/docs`,
    health: `${req.protocol}://${req.get('host')}/api/health`
  });
});

// API documentation
app.get('/api/docs', (req, res) => {
  res.json({
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        profile: 'GET /api/auth/me'
      },
      calendar: {
        events: 'GET /api/calendar/events',
        connect: 'POST /api/calendar/connect'
      },
      commitments: {
        create: 'POST /api/commitments',
        stats: 'GET /api/commitments/stats'
      },
      subscriptions: {
        initialize: 'POST /api/subscriptions/initialize',
        verify: 'GET /api/subscriptions/verify/:reference'
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  // Handle multer errors
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      error: 'File upload error',
      message: err.message
    });
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token'
    });
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});
console.log('✓ Error handlers configured');

// Graceful shutdown
console.log('⏳ Setting up server listen...');
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close()
      .then(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
      })
      .catch((err) => {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
      });
  });
});

const PORT = parseInt(process.env.PORT || '5000', 10);
// Bind to 0.0.0.0 if on Render (check for RENDER env var) or if NODE_ENV is production
// Also check for process.env.DYNO (Heroku) for compatibility
const isProduction = process.env.NODE_ENV === 'production' || 
                     process.env.RENDER === 'true' || 
                     !!process.env.RENDER_INSTANCE_ID;
const HOST = isProduction ? '0.0.0.0' : '127.0.0.1';
const listenPromise = new Promise((resolve, reject) => {
  console.log(`⏳ Calling server.listen() on ${HOST}:${PORT}...`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
  console.log(`   RENDER: ${process.env.RENDER || 'undefined'}`);
  console.log(`   RENDER_INSTANCE_ID: ${process.env.RENDER_INSTANCE_ID || 'undefined'}`);
  console.log(`   isProduction: ${isProduction}`);
  server.listen(PORT, HOST, () => {
    console.log(`🚀 Backend running on http://${HOST}:${PORT}`);
    console.log(`📁 Environment: ${isProduction ? 'production' : 'development'}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log(`🔌 WebSocket ready for real-time notifications`);
    resolve();
  });
});
console.log('✓ server.listen() called, waiting for listening event...');

server.on('listening', () => {
  console.log(`✓ Server is now listening on port ${PORT}`);
  console.log('✓ Backend is fully operational and ready for requests');
  console.log('-------------------------------------------');
  setInterval(() => {
    // Keep process alive
  }, 60000);
});

server.on('error', (err) => {
  console.error('❌ Server socket error:', err.message);
  console.error('Code:', err.code);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    console.error(err.stack);
    process.exit(1);
  }
});

// Also wait for the listenPromise to resolve
listenPromise.then(() => {
  console.log('✓ listenPromise resolved - server is ready');
}).catch((err) => {
  console.error('❌ listenPromise rejected:', err);
  process.exit(1);
});