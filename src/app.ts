import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { 
  errorHandler, 
  notFoundHandler, 
  loggerMiddleware, 
  rateLimitMiddleware 
} from './middlewares/index.js'; 
import { IndexRoutes } from './routes/index.js';
//import { IndexRoutes } from './routes/index.js';

const app: Application = express();

// --- গ্লোবাল মিডলওয়্যারসমূহ ---
app.use(cors());
app.use(express.json());

// ১. রিকোয়েস্ট লগ করার জন্য
app.use(loggerMiddleware);

// ২. রেট লিমিট (ব্র্যাকেট ছাড়া ব্যবহার করুন, কারণ এটি সরাসরি মিডলওয়্যার)
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

// ৩. যদি কোনো রাউট না পাওয়া যায়
app.use(notFoundHandler);

// ৪. গ্লোবাল এরর হ্যান্ডলার
app.use(errorHandler);

export default app;