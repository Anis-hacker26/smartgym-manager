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
// ============================================
app.set('trust proxy', 1);

// ============================================
// VALIDATE ENVIRONMENT VARIABLES
// ============================================
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  if (config.nodeEnv === 'production') {
    console.error('⚠️ Running in serverless mode with missing env vars');
  }
}

if (config.jwtSecret && config.jwtSecret.length < 32 && config.nodeEnv === 'production') {
  console.error('❌ JWT_SECRET must be at least 32 characters in production');
}

// ============================================
// CREATE UPLOADS DIRECTORY
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
    if (mongoose.connection.readyState === 1) {
      return cached.conn;
    } else {
      cached.conn = null;
      cached.promise = null;
    }
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      maxPoolSize: 10,
      minPoolSize: 1,
      connectTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
    };

    console.log('🔄 Connecting to MongoDB...');
    cached.promise = mongoose.connect(config.mongodbUri, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB connected successfully');
        console.log(`📊 Database: ${mongoose.connection.name}`);
        console.log(`🔗 Connection state: ${mongoose.connection.readyState}`);
        return mongoose;
      })
      .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        cached.promise = null;
        throw err;
      });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}

export { connectDB };

// ============================================
// CORS CONFIGURATION
// ============================================
const allowedOrigins = config.corsOrigins;

if (config.nodeEnv === 'production') {
  console.log(`✅ CORS allowed origins: ${allowedOrigins.join(', ')}`);
}

app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'https://smartgym-manager-kb85.vercel.app',
      'https://smartgym-manager.vercel.app',
      'https://smartgym-frontend.vercel.app',
      'http://localhost:5173'
    ];
    
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // ✅ MUST be true
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie'],
  exposedHeaders: ['Set-Cookie'], // ✅ Important for cross-site
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
// STATIC FILE SERVING
// ============================================
if (config.nodeEnv !== 'production') {
  app.use('/uploads', express.static(uploadsDir, {
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Access-Control-Allow-Origin', config.frontendUrl);
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }));
  
  app.use('/public/uploads', express.static(uploadsDir, {
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Access-Control-Allow-Origin', config.frontendUrl);
    }
  }));
  
  app.use(express.static(path.join(__dirname, '../public')));
} else {
  app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
  });
  console.log('⚠️ Production mode: File uploads should use cloud storage');
}

// ============================================
// RATE LIMITING
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
// ✅ DB CONNECTION MIDDLEWARE
// ============================================
import { ensureDbConnection } from './middleware/dbMiddleware';

// Apply DB connection check to all API routes
app.use('/api', ensureDbConnection);

// ============================================
// ROOT ROUTE
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
// DEBUG ENDPOINTS
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
    const dbState = mongoose.connection.readyState;
    const dbStatusMap: { [key: number]: string } = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
      99: 'uninitialized'
    };
    
    let dbStatus = dbStatusMap[dbState] || 'unknown';
    
    if (dbState === 0 || dbState === 99) {
      console.log('🔄 Health check: DB disconnected, attempting reconnect...');
      try {
        await connectDB();
        dbStatus = 'connected (reconnected)';
      } catch (err) {
        dbStatus = 'reconnection failed';
      }
    }
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      readyState: dbState,
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
// DEBUG DB ENDPOINT
// ============================================
app.get('/api/debug-db', async (req, res) => {
  try {
    await connectDB();
    const collections = await mongoose.connection.db?.listCollections().toArray();
    res.json({
      connectionState: mongoose.connection.readyState,
      databaseName: mongoose.connection.name,
      collections: collections?.map(c => c.name) || [],
      modelNames: mongoose.modelNames()
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message
    });
  }
});

// ============================================
// 404 HANDLER
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
// EXPORT FOR VERCEL
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