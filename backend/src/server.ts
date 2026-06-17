// backend/src/server.ts
import './config/env';
import { config } from './config/env';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import helmet from 'helmet';

import { errorHandler } from './middleware/errorHandler';
import { apiLimiter, authLimiter } from './middleware/rateLimiter';
import Membership from './models/Membership';
import { startReminderJobs } from './jobs/reminderJobs';
import { startExpiryReminderJobs } from './jobs/expiryReminderJobs';
import { startCleanupJob } from './jobs/cleanupExpiredMembersJob';
import { startBirthdayJob } from './jobs/birthdayReminderJob';

const app = express();

// ============================================
// ✅ FIX: Enable trust proxy for Vercel
// This tells Express to trust the 'X-Forwarded-For' header set by Vercel's proxy
// This is required for rate limiting to work correctly behind a proxy
// ============================================
app.set('trust proxy', 1); // Trust first proxy (Vercel)

// ============================================
// VALIDATE ENVIRONMENT VARIABLES
// ============================================
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  if (config.nodeEnv === 'production') {
    // Don't exit in serverless, just log
    console.error('⚠️ Running in serverless mode with missing env vars');
  }
}

// Validate JWT secret strength
if (config.jwtSecret && config.jwtSecret.length < 32 && config.nodeEnv === 'production') {
  console.error('❌ JWT_SECRET must be at least 32 characters in production');
  // Don't exit in serverless
}

// ============================================
// CREATE UPLOADS DIRECTORY (Skip in serverless)
// ============================================
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir) && config.nodeEnv !== 'production') {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory:', uploadsDir);
}

// ============================================
// MONGODB CONNECTION (WITH CACHING FOR SERVERLESS)
// ============================================
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(config.mongodbUri, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB connected');
        return mongoose;
      })
      .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        cached.promise = null;
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// ============================================
// CORS CONFIGURATION
// ============================================
const allowedOrigins = config.corsOrigins;

if (config.nodeEnv === 'production') {
  if (allowedOrigins.includes('*')) {
    console.error('❌ Wildcard CORS origin "*" is not allowed in production');
  }
  if (allowedOrigins.includes('http://localhost') || allowedOrigins.includes('http://127.0.0.1')) {
    console.warn('⚠️ Localhost origins should not be used in production CORS');
  }
  console.log(`✅ CORS allowed origins: ${allowedOrigins.join(', ')}`);
}

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    if (config.nodeEnv !== 'production' && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
      return callback(null, true);
    }
    
    console.warn(`CORS blocked origin: ${origin}`);
    const msg = 'CORS policy does not allow access from this origin.';
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie', 'X-CSRF-Token'],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400,
}));

app.options('*', cors());

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('combined'));

// ============================================
// SECURITY HEADERS
// ============================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "blob:", "http://localhost:5000", "http://localhost:5173", "https://images.unsplash.com", "https://ui-avatars.com", "https://images.pexels.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", config.frontendUrl, 'http://localhost:5000', 'http://localhost:5173'],
      frameSrc: ["'self'", "https://www.google.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

// ============================================
// STATIC FILE SERVING (Only in development)
// ============================================
if (config.nodeEnv !== 'production') {
  app.use('/uploads', express.static(uploadsDir, {
    setHeaders: (res, path, stat) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Access-Control-Allow-Origin', config.frontendUrl);
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }));
  
  app.use('/public/uploads', express.static(uploadsDir, {
    setHeaders: (res, path, stat) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Access-Control-Allow-Origin', config.frontendUrl);
    }
  }));
  
  app.use(express.static(path.join(__dirname, '../public')));
} else {
  // Production: Handle favicon to prevent 500 errors
  app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
  });
  
  // Note: In production, use cloud storage for uploads
  console.log('⚠️ Production mode: File uploads should use cloud storage');
}

// ============================================
// RATE LIMITING (Now trust proxy is enabled)
// ============================================
if (config.nodeEnv === 'production') {
  app.use('/api/auth', authLimiter);
  app.use('/api', apiLimiter);
  console.log('✅ Production rate limiting enabled');
} else {
  console.log('⚠️ Development mode: Relaxed rate limiting');
  app.use('/api/auth', authLimiter);
  app.use('/api', apiLimiter);
}

// ============================================
// IMPORT ROUTES
// ============================================
import authRoutes from './routes/authRoutes';
import memberRoutes from './routes/memberRoutes';
import adminRoutes from './routes/adminRoutes';
import membershipRoutes from './routes/membershipRoutes';
import bookingRoutes from './routes/bookingRoutes';
import renewalRoutes from './routes/renewalRoutes';
import equipmentRoutes from './routes/equipmentRoutes';
import notificationRoutes from './routes/notificationRoutes';

// ============================================
// ✅ ROOT ROUTE - API Information
// ============================================
app.get('/', (req, res) => {
  res.json({
    message: 'SmartGym Manager API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      members: '/api/members',
      equipment: '/api/equipment',
      bookings: '/api/bookings',
      renewals: '/api/renewals',
      admin: '/api/admin',
      membership: '/api/membership',
      notifications: '/api/notifications'
    },
    documentation: 'https://github.com/Anis-hacker26/smartgym-manager'
  });
});

// ============================================
// ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/member', memberRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/renewals', renewalRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/notifications', notificationRoutes);

// ============================================
// DEBUG ENDPOINT (Development only)
// ============================================
if (config.nodeEnv !== 'production') {
  app.get('/api/debug/images', (req, res) => {
    fs.readdir(uploadsDir, (err: any, files: string[]) => {
      if (err) {
        return res.json({ error: err.message, uploadsDirectory: uploadsDir });
      }
      res.json({ 
        uploadsDirectory: uploadsDir,
        files: files,
        count: files.length 
      });
    });
  });
  console.log('⚠️ Debug endpoints enabled (development mode only)');
}

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', async (req, res) => {
  try {
    // Try to connect to DB for health check
    await connectDB();
    const dbState = mongoose.connection.readyState;
    const dbStatusMap: { [key: number]: string } = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    const dbStatus = dbStatusMap[dbState] || 'unknown';
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      uptime: process.uptime(),
      environment: config.nodeEnv,
      apiUrl: config.frontendUrl
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message
    });
  }
});

// ============================================
// TEST DB ENDPOINT
// ============================================
app.get('/api/test-db', async (req, res) => {
  try {
    await connectDB();
    res.json({
      status: 'connected',
      readyState: mongoose.connection.readyState
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// ============================================
// 404 HANDLER (Must be last)
// ============================================
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use(errorHandler);

// ============================================
// EXPORT FOR VERCEL (IMPORTANT!)
// ============================================
export default app;

// ============================================
// LOCAL DEVELOPMENT SERVER
// ============================================
if (require.main === module) {
  const PORT = config.port || 5000;
  
  async function startServer() {
    try {
      await connectDB();
      
      // Run startup cleanup
      try {
        const today = new Date();
        const result = await Membership.updateMany(
          { 
            status: 'ACTIVE', 
            expiryDate: { $lt: today } 
          },
          { $set: { status: 'EXPIRED' } }
        );
        console.log(`✅ Startup cleanup: ${result.modifiedCount} memberships marked as EXPIRED`);
      } catch (error) {
        console.error('❌ Startup cleanup error:', error);
      }
      
      startReminderJobs();
      startExpiryReminderJobs();
      startCleanupJob();
      startBirthdayJob();
      
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
        console.log(`📁 Uploads directory: ${uploadsDir}`);
        console.log(`🌍 Environment: ${config.nodeEnv}`);
        console.log(`🔗 Frontend URL: ${config.frontendUrl}`);
        console.log(`📸 Images available at: http://localhost:${PORT}/uploads/`);
        if (config.nodeEnv !== 'production') {
          console.log(`🔧 Debug images: http://localhost:${PORT}/api/debug/images`);
        }
      });
    } catch (err) {
      console.error('❌ Failed to start server:', err);
      process.exit(1);
    }
  }
  
  startServer();
}