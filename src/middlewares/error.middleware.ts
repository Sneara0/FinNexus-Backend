
import { Request, Response, NextFunction } from 'express';

// ========================================
// কাস্টম এরর ক্লাস
// ========================================

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// ========================================
// গ্লোবাল এরর হ্যান্ডলার
// ========================================

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // অ্যাপ এরর
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
  
  // Prisma এরর হ্যান্ডলিং
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      success: false,
      message: 'ডাটাবেজ অপারেশন ব্যর্থ হয়েছে',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
  
  // JWT এরর
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'টোকেন বৈধ নয়।',
      timestamp: new Date().toISOString()
    });
  }
  
  // টোকেন এক্সপায়ার্ড এরর
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'টোকেনের মেয়াদ শেষ হয়ে গেছে।',
      timestamp: new Date().toISOString()
    });
  }
  
  // ডিফল্ট এরর
  console.error('Error:', err);
  
  res.status(500).json({
    success: false,
    message: 'সার্ভারে একটি ত্রুটি ঘটেছে',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    timestamp: new Date().toISOString()
  });
};

// ========================================
// নট ফাউন্ড হ্যান্ডলার
// ========================================

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `রাউট খুঁজে পাওয়া যায়নি: ${req.method} ${req.url}`,
    timestamp: new Date().toISOString()
  });
};