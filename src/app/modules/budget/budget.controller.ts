import { Request, Response } from 'express';
import { startOfMonth, endOfMonth } from 'date-fns';
import { catchAsync } from '../../utils/catchAsync.js';
import { BudgetService } from './budget.service.js';
import { sendResponse } from '../../utils/sendResponse.js';

// ========================================
// 1. বাজেট তৈরি
// ========================================
const createBudget = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { category, amount, period, alertThreshold, note } = req.body;
  
  const now = new Date();
  const startDate = startOfMonth(now);
  const endDate = endOfMonth(now);
  
  const budget = await BudgetService.createBudget(userId, {
    category,
    amount,
    period,
    startDate,
    endDate,
    alertThreshold,
    note
  });
  
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'বাজেট তৈরি করা হয়েছে',
    data: budget,
  });
});

// ========================================
// 2. সব বাজেট পাওয়া
// ========================================
const getAllBudgets = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  
  const period = req.query.period as string;
  const category = req.query.category as string;
  const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
  
  const result = await BudgetService.getAllBudgets(userId, page, limit, period, category, isActive);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'বাজেট লিস্ট পাওয়া গেছে',
    data: result.budgets,
    meta: result.pagination,
  });
});

// ========================================
// 3. নির্দিষ্ট বাজেট পাওয়া
// ========================================
const getBudgetById = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { id } = req.params;
  
  const budget = await BudgetService.getBudgetById(id as string, userId);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'বাজেট পাওয়া গেছে',
    data: budget,
  });
});

// ========================================
// 4. বর্তমান মাসের বাজেট
// ========================================
const getCurrentMonthBudgets = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  
  const result = await BudgetService.getCurrentMonthBudgets(userId);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'বর্তমান মাসের বাজেট পাওয়া গেছে',
    data: result,
  });
});

// ========================================
// 5. বাজেট আপডেট
// ========================================
const updateBudget = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { id } = req.params;
  const { amount, alertThreshold, note, isActive } = req.body;
  
  const budget = await BudgetService.updateBudget(id as string, userId, {
    amount,
    alertThreshold,
    note,
    isActive
  });
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'বাজেট আপডেট করা হয়েছে',
    data: budget,
  });
});

// ========================================
// 6. বাজেট ডিলিট
// ========================================
const deleteBudget = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { id } = req.params;
  
  await BudgetService.deleteBudget(id as string, userId);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'বাজেট ডিলিট করা হয়েছে',
    data: null,
  });
});

// ========================================
// 7. বাজেট সামারি
// ========================================
const getBudgetSummary = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  
  const summary = await BudgetService.getBudgetSummary(userId);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'বাজেট সামারি পাওয়া গেছে',
    data: summary,
  });
});

// ========================================
// ৮. BudgetController অবজেক্ট এক্সপোর্ট
// ========================================
export const BudgetController = {
  createBudget,
  getAllBudgets,
  getBudgetById,
  getCurrentMonthBudgets,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
};