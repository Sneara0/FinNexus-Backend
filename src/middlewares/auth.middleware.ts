
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// ========================================
// টাইপ ডিফিনেশন
// ========================================


export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// ========================================
// 1. অথেন্টিকেশন মিডলওয়্যার
// টোকেন ভেরিফাই করে এবং ইউজার তথ্য রিকোয়েস্টে যোগ করে
// ========================================

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. হেডার থেকে টোকেন নেওয়া
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.replace('Bearer ', '') 
      : null;
    
    // 2. টোকেন নেই
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'আপনি লগইন করেননি। দয়া করে লগইন করুন।',
        error: 'NO_TOKEN'
      });
    }
    
    // 3. টোকেন ভেরিফাই করা
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'finnexus_secret') as {
      id: string;
      email: string;
      role: string;
    };
    
    // 4. ইউজার তথ্য রিকোয়েস্টে সেট করা
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };
    
    next();
    
  } catch (error) {
    // টোকেন এক্সপায়ার হয়েছে
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'টোকেনের মেয়াদ শেষ হয়ে গেছে। আবার লগইন করুন।',
        error: 'TOKEN_EXPIRED'
      });
    }
    
    // টোকেন ইনভ্যালিড
    return res.status(401).json({
      success: false,
      message: 'টোকেন বৈধ নয়। আবার লগইন করুন।',
      error: 'INVALID_TOKEN'
    });
  }
};

// ========================================
// 2. অথোরাইজেশন মিডলওয়্যার
// নির্দিষ্ট রোল চেক করে
// ========================================

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // ইউজার তথ্য নেই
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'আপনি লগইন করেননি।',
        error: 'UNAUTHORIZED'
      });
    }
    
    // রোল ম্যাচ করে না
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `এই কাজটি করার জন্য ${roles.join(' বা ')} রোল প্রয়োজন। আপনার রোল: ${req.user.role}`,
        error: 'FORBIDDEN',
        requiredRoles: roles,
        yourRole: req.user.role
      });
    }
    
    next();
  };
};

// ========================================
// 3. অপশনাল অথেন্টিকেশন
// টোকেন থাকলে ইউজার সেট করে, না থাকলে এগিয়ে যায়
// ========================================

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.replace('Bearer ', '') 
      : null;
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'finnexus_secret') as {
        id: string;
        email: string;
        role: string;
      };
      
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
    }
    
    next();
  } catch (error) {
    // টোকেন ভুল হলেও এগিয়ে যাবে
    next();
  }
};

// ========================================
// 4. রেট লিমিট মিডলওয়্যার
// ========================================

export const rateLimitMiddleware = () => {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 মিনিট
    const maxRequests = 100; // সর্বোচ্চ 100 রিকোয়েস্ট
    
    const userRequests = requests.get(ip);
    
    if (!userRequests || now > userRequests.resetTime) {
      requests.set(ip, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }
    
    if (userRequests.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'অনেক বেশি রিকোয়েস্ট করছেন। কিছুক্ষণ পর চেষ্টা করুন।',
        error: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((userRequests.resetTime - now) / 1000)
      });
    }
    
    userRequests.count++;
    next();
  };
};

// ========================================
// 5. লগিং মিডলওয়্যার
// ========================================

export const loggerMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const method = req.method;
    const url = req.url;
    const user = req.user?.email || 'unauthenticated';
    
    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${status} - ${duration}ms - ${user}`);
  });
  
  next();
};
