const express = require('express');
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
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { connectDB } = require('./config/database');
const SocketManager = require('./services/socketManager');

// Import routes
const authRoutes = require('./routes/auth');
const calendarRoutes = require('./routes/calendar');
const commitmentRoutes = require('./routes/commitments');
const crmRoutes = require('./routes/crm');
const emailRoutes = require('./routes/email');
const subscriptionRoutes = require('./routes/subscriptions');
const managerRoutes = require('./routes/manager');
const uploadRoutes = require('./routes/upload');
const healthRoutes = require('./routes/health');
const contactRoutes = require('./routes/contacts');
const taskRoutes = require('./routes/tasks');
const noteRoutes = require('./routes/notes');
const analyticsRoutes = require('./routes/analytics');
const dealsRoutes = require('./routes/deals');
const reportsRoutes = require('./routes/reports');
const teamsRoutes = require('./routes/teams');
const automationsRoutes = require('./routes/automations');
const notificationsRoutes = require('./routes/notifications');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Initialize Socket Manager
const socketManager = new SocketManager(io);
socketManager.initializeHandlers();

// Make socketManager available to routes
app.use((req, res, next) => {
  req.socketManager = socketManager;
  next();
});

// Connect to database
connectDB().catch(err => {
  console.error('Failed to connect to database:', err);
});

// Security middleware
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
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Timestamp']
};

// Dynamically set origin to allow all Vercel preview and production deployments
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://deal-clarity-engine.vercel.app', // Production
  /https:\/\/deal-clarity-engine.*\.vercel\.app$/ // Preview deployments
];

corsOptions.origin = function(origin, callback) {
  if (!origin || allowedOrigins.some(allowed => 
    typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
  )) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

app.use(cors(corsOptions));

// Rate limiting (shared config)
app.use('/api/', customLimiter);

// More aggressive rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 requests per hour
  message: {
    error: 'Too many authentication attempts, please try again after an hour'
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/commitments', commitmentRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/automations', automationsRoutes);
app.use('/api/notifications', notificationsRoutes);

// Welcome route
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

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🔌 WebSocket ready for real-time notifications`);
});