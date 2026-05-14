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

// --- গ্লোবাল মিডলওয়্যারসমূহ ---

// ✅ CORS কনফিগারেশন
app.use(cors({
  origin: [
    'http://localhost:3000', // লোকাল ডেভেলপমেন্টের জন্য
    
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true, // যদি কুকি বা অথেন্টিকেশন হেডার ব্যবহার করেন
}));

app.use(express.json());

// ১. রিকোয়েস্ট লগ করার জন্য
app.use(loggerMiddleware);

// ২. রেট লিমিট 
app.use(rateLimitMiddleware); 

// --- রাউটসমূহ ---

// হোম রাউট
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'FinNexus AI Server is running smoothly! 🚀',
  });
});

// ✅ API রাউটস সেটআপ
app.use('/api/v1', IndexRoutes);

// --- এরর হ্যান্ডলিং (সবার শেষে থাকবে) ---

app.use(notFoundHandler);
app.use(errorHandler);

export default app;