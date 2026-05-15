import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { 
  errorHandler, 
  notFoundHandler, 
  loggerMiddleware, 
  rateLimitMiddleware 
} from './middlewares/index.js'; 
import { IndexRoutes } from './routes/index.js';

const app: Application = express();

// --- ১. গ্লোবাল মিডলওয়্যারসমূহ ---

// ✅ প্রফেশনাল CORS কনফিগারেশন
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://finnexus-frontend.vercel.app'
    ];
    // origin না থাকলে (যেমন পোস্টম্যান থেকে রিকোয়েস্ট) বা অ্যালাউড লিস্টে থাকলে অ্যাপ্রুভ করবে
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
}));

// বডি পার্সার (লিমিটসহ যাতে বড় পেলোড সার্ভার ক্র্যাশ না করে)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// রিকোয়েস্ট লগিং এবং রেট লিমিটিং
app.use(loggerMiddleware);
app.use(rateLimitMiddleware); 

// --- ২. রাউটসমূহ ---

// হোম রাউট (সিস্টেম চেক করার জন্য)
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'FinNexus AI Server is running smoothly! 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ✅ মূল API রাউটস
app.use('/api/v1', IndexRoutes);




app.use(notFoundHandler);
app.use(errorHandler);
   


export default app;