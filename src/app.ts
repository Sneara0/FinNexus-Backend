import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { 
  errorHandler, 
  notFoundHandler, 
  loggerMiddleware, 
  rateLimitMiddleware 
} from './middlewares/index.js'; 
import { IndexRoutes } from './routes/index.js';


// ✅ অথ রাউট ইম্পোর্ট (পাথটি আপনার ফোল্ডার অনুযায়ী চেক করুন)


const app: Application = express();

// --- গ্লোবাল মিডলওয়্যারসমূহ ---
app.use(cors());
app.use(express.json());
app.use(loggerMiddleware);
app.use(rateLimitMiddleware());

// --- রাউটসমূহ ---

// হোম রাউট
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'FinNexus AI Server is running smoothly! 🚀',
  });
});

// ✅ API রাউটস সেটআপ
app.use('/api/v1',IndexRoutes);


// --- এরর হ্যান্ডলিং (সবার শেষে থাকবে) ---
app.use(notFoundHandler);
app.use(errorHandler);

export default app;