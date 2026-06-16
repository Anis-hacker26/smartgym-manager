// backend/src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

// ✅ FIX: Disable X-Forwarded-For validation for all limiters
// This is required for Vercel deployment (behind proxy)
const validateConfig = {
  validate: {
    xForwardedForHeader: false, // Disable X-Forwarded-For validation
  },
};

// Less strict for development
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased from 5 to 100 for development
  message: { message: 'Too many login attempts, please try again later' },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  ...validateConfig, // ✅ Added fix
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // Increased from 60 to 200
  message: { message: 'Too many requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health check in development
    return req.path === '/api/health' && process.env.NODE_ENV === 'development';
  },
  ...validateConfig, // ✅ Added fix
});

export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Increased from 3 to 10
  message: { message: 'Too many OTP requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  ...validateConfig, // ✅ Added fix
});

export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: { message: 'Too many verification attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  ...validateConfig, // ✅ Added fix
});

export const loginAttemptLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: { message: 'Too many login attempts from this IP' },
  standardHeaders: true,
  legacyHeaders: false,
  ...validateConfig, // ✅ Added fix
});