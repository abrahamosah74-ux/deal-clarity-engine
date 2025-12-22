const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');
const logger = require('./logger');

let redisClient;
let store;

// Initialize Redis client if available
if (process.env.REDIS_URL) {
  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    redisClient.on('connect', () => {
      logger.info('✅ Redis connected for rate limiting');
    });

    redisClient.on('error', (err) => {
      logger.error('Redis connection error:', err);
    });

    store = new RedisStore({
      client: redisClient,
      prefix: 'rate-limit:',
      // Expire keys after 15 minutes
      expiry: 15 * 60,
    });
  } catch (error) {
    logger.error('Failed to initialize Redis for rate limiting:', error);
  }
}

// Default in-memory store
if (!store) {
  store = new rateLimit.MemoryStore();
  logger.warn('Using in-memory store for rate limiting (not recommended for production)');
}

// Global rate limiter (applied to all routes)
const globalLimiter = rateLimit({
  store,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Please try again later'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  },
  keyGenerator: (req) => {
    // Use IP + user ID if authenticated for better rate limiting
    return req.user ? `${req.user.id}:${req.ip}` : req.ip;
  },
  handler: (req, res, next, options) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userId: req.user?.id,
      path: req.path,
      method: req.method
    });
    
    res.status(options.statusCode).json(options.message);
  }
});

// Strict rate limiter for sensitive endpoints
const strictLimiter = rateLimit({
  store,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 requests per hour
  message: {
    error: 'Rate limit exceeded',
    message: 'Too many requests from this IP, please try again in an hour'
  },
  skip: (req) => {
    // Skip for authenticated users with certain roles
    return req.user?.role === 'admin';
  }
});

// Auth-specific rate limiter
const authLimiter = rateLimit({
  store,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 minutes
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again later'
  },
  skipSuccessfulRequests: true, // Don't count successful auth attempts
});

// API key rate limiter (for external API access)
const apiKeyLimiter = rateLimit({
  store,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // 1000 requests per hour per API key
  keyGenerator: (req) => {
    // Use API key from header
    return req.headers['x-api-key'] || req.ip;
  }
});

// Email verification rate limiter (prevent brute force code guessing)
const emailVerificationLimiter = rateLimit({
  store,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 verification attempts per hour per email
  keyGenerator: (req) => {
    // Rate limit by email address
    return req.body?.email || req.ip;
  },
  message: 'Too many verification attempts. Please try again in 1 hour.',
  standardHeaders: true,
  legacyHeaders: false
});

// Email resend rate limiter (prevent email flooding)
const emailResendLimiter = rateLimit({
  store,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 resend attempts per 15 minutes per email
  keyGenerator: (req) => {
    // Rate limit by email address
    return req.body?.email || req.ip;
  },
  message: 'Too many resend attempts. Please wait 15 minutes before trying again.',
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = globalLimiter;
module.exports.globalLimiter = globalLimiter;
module.exports.strictLimiter = strictLimiter;
module.exports.authLimiter = authLimiter;
module.exports.apiKeyLimiter = apiKeyLimiter;
module.exports.emailVerificationLimiter = emailVerificationLimiter;
module.exports.emailResendLimiter = emailResendLimiter;
module.exports.redisClient = redisClient;
module.exports.store = store;
