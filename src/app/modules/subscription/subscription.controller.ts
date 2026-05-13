
import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { SubscriptionService } from './subscription.service.js';
import { sendError, sendPaginated, sendSuccess } from '../../utils/sendResponse.js';


// ========================================
// 1. সাবস্ক্রিপশন তৈরি
// ========================================
export const createSubscription = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { name, amount, currency, billingCycle, startDate, category } = req.body;
  
  const subscription = await SubscriptionService.createSubscription(userId, {
    name,
    amount,
    currency,
    billingCycle,
    startDate: new Date(startDate),
    category
  });
  
  sendSuccess(res, subscription, 'সাবস্ক্রিপশন তৈরি করা হয়েছে', 201);
});

// ========================================
// 2. সব সাবস্ক্রিপশন পাওয়া
// ========================================
export const getAllSubscriptions = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
  const category = req.query.category as string;
  
  const result = await SubscriptionService.getAllSubscriptions(userId, page, limit, isActive, category);
  
  sendPaginated(res, result.subscriptions, result.pagination, 'সাবস্ক্রিপশন লিস্ট পাওয়া গেছে');
});

// ========================================
// 3. নির্দিষ্ট সাবস্ক্রিপশন পাওয়া
// ========================================
export const getSubscriptionById = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { id } = req.params;
  
  const subscription = await SubscriptionService.getSubscriptionById(id as string, userId);
  sendSuccess(res, subscription, 'সাবস্ক্রিপশন পাওয়া গেছে');
});

// ========================================
// 4. সাবস্ক্রিপশন আপডেট
// ========================================
export const updateSubscription = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { id } = req.params;
  const { name, amount, currency, billingCycle, category } = req.body;
  
  const subscription = await SubscriptionService.updateSubscription(id as string, userId, {
    name,
    amount,
    currency,
    billingCycle,
    category
  });
  
  sendSuccess(res, subscription, 'সাবস্ক্রিপশন আপডেট করা হয়েছে');
});

// ========================================
// 5. সাবস্ক্রিপশন বাতিল (সফট ডিলিট)
// ========================================
export const cancelSubscription = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { id } = req.params;
  
  const subscription = await SubscriptionService.cancelSubscription(id as string, userId);
  sendSuccess(res, subscription, 'সাবস্ক্রিপশন বাতিল করা হয়েছে');
});

// ========================================
// 6. সাবস্ক্রিপশন পুনরায় সক্রিয়
// ========================================
export const reactivateSubscription = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { id } = req.params;
  
  const subscription = await SubscriptionService.reactivateSubscription(id as string, userId);
  sendSuccess(res, subscription, 'সাবস্ক্রিপশন পুনরায় সক্রিয় করা হয়েছে');
});

// ========================================
// 7. সাবস্ক্রিপশন ডিলিট (হার্ড ডিলিট)
// ========================================
export const deleteSubscription = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { id } = req.params;
  
  await SubscriptionService.deleteSubscription(id as string, userId);
  sendSuccess(res, null, 'সাবস্ক্রিপশন ডিলিট করা হয়েছে');
});

// ========================================
// 8. সাবস্ক্রিপশন সামারি (ড্যাশবোর্ড)
// ========================================
export const getSubscriptionSummary = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  
  const summary = await SubscriptionService.getSubscriptionSummary(userId);
  sendSuccess(res, summary, 'সাবস্ক্রিপশন সামারি পাওয়া গেছে');
});

// ========================================
// 9. প্রসেস রিনিউয়াল (অ্যাডমিন/ক্রন জব)
// ========================================
export const processRenewals = catchAsync(async (req: Request, res: Response) => {
  // শুধু অ্যাডমিনের জন্য
  if ((req as any).user?.role !== 'ADMIN') {
    return sendError(res, 'শুধু অ্যাডমিন এই কাজ করতে পারেন', 403);
  }
  
  const result = await SubscriptionService.processRenewals();
  sendSuccess(res, result, `${result.processed}টি সাবস্ক্রিপশন রিনিউ করা হয়েছে`);
});

// ========================================
// 10. রিমাইন্ডার পাঠানো (অ্যাডমিন/ক্রন জব)
// ========================================
export const sendReminders = catchAsync(async (req: Request, res: Response) => {
  if ((req as any).user?.role !== 'ADMIN') {
    return sendError(res, 'শুধু অ্যাডমিন এই কাজ করতে পারেন', 403);
  }
  
  const count = await SubscriptionService.sendReminders();
  sendSuccess(res, { remindersSent: count }, `${count}টি রিমাইন্ডার পাঠানো হয়েছে`);
});
