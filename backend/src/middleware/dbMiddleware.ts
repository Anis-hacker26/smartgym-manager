// backend/src/middleware/dbMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export const ensureDbConnection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if connection exists and is ready
    if (mongoose.connection.readyState !== 1) {
      console.log(`⚠️ DB not connected (state: ${mongoose.connection.readyState}), reconnecting...`);
      // Import connectDB dynamically to avoid circular dependencies
      const { connectDB } = await import('../server');
      await connectDB();
    }
    next();
  } catch (error: any) {
    console.error('❌ DB connection middleware error:', error.message);
    res.status(503).json({
      error: 'Database connection unavailable',
      message: error.message
    });
  }
};