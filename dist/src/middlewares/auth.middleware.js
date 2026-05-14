import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
// ========================================
// 1. অথেন্টিকেশন মিডলওয়্যার
// ========================================
export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.replace('Bearer ', '')
            : null;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'আপনি লগইন করেননি। দয়া করে লগইন করুন।',
                error: 'NO_TOKEN'
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'finnexus_secret');
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        };
        next();
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                message: 'টোকেনের মেয়াদ শেষ হয়ে গেছে। আবার লগইন করুন।',
                error: 'TOKEN_EXPIRED'
            });
        }
        return res.status(401).json({
            success: false,
            message: 'টোকেন বৈধ নয়। আবার লগইন করুন।',
            error: 'INVALID_TOKEN'
        });
    }
};
// ========================================
// 2. অথোরাইজেশন মিডলওয়্যার
// ========================================
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'আপনি লগইন করেননি।',
                error: 'UNAUTHORIZED'
            });
        }
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
// ========================================
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ')
            ? authHeader.replace('Bearer ', '')
            : null;
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'finnexus_secret');
            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role
            };
        }
        next();
    }
    catch (error) {
        next();
    }
};
// ========================================
// 4. রেট লিমিট মিডলওয়্যার
// ========================================
const requests = new Map();
export const rateLimitMiddleware = (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = 15 * 60 * 1000;
    const maxRequests = 100;
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
// ========================================
// 5. লগিং মিডলওয়্যার
// ========================================
export const loggerMiddleware = (req, res, next) => {
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
