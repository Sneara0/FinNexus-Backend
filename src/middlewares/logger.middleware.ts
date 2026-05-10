
import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import path from 'path';

// ========================================
// উইনস্টন লগার কনফিগারেশন
// ========================================

const logDir = 'logs';

// লগ ফরম্যাট
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// কনসোল ফরম্যাট (ডেভেলপমেন্টের জন্য)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
  })
);

// লগার তৈরি
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    // এরর লগ ফাইল
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // সব লগ ফাইল
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// ডেভেলপমেন্টে কনসোলেও লগ দেখানো
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

// ========================================
// HTTP রিকোয়েস্ট লগিং মিডলওয়্যার
// ========================================

export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };
    
    if (res.statusCode >= 500) {
      logger.error('Server Error', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Client Error', logData);
    } else {
      logger.info('Request', logData);
    }
  });
  
  next();
};

// ========================================
// ডাটাবেজ কোয়েরি লগিং
// ========================================

export const logQuery = (query: string, params?: any[]) => {
  logger.debug('Database Query', { query, params });
};

// ========================================
// API কল লগিং
// ========================================

export const logApiCall = (endpoint: string, userId?: string, data?: any) => {
  logger.info('API Call', { endpoint, userId, data });
};

// ========================================
// এরর লগিং
// ========================================

export const logError = (error: Error, context?: any) => {
  logger.error(error.message, {
    stack: error.stack,
    ...context
  });
};

export default logger;
