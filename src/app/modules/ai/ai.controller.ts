import { Request, Response } from 'express';
import { prisma } from '../../../config/prisma.js';
import { sendResponse } from '../../utils/sendResponse.js';
import { AIService } from './ai.service.js';
import { catchAsync } from '../../utils/catchAsync.js';
 // নিশ্চিত করুন এটি default import কি না

// চ্যাট রেসপন্স
const chat = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { sessionId, message } = req.body;

  if (!message) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'মেসেজ প্রয়োজন',
    });
  }

  // sessionId কে স্ট্রিং হিসেবে নিশ্চিত করা
  const chatSessionId = (sessionId as string) || `session_${Date.now()}_${userId}`;
  const result = await AIService.generateChatResponse(userId, chatSessionId, message);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'AI রেসপন্স তৈরি হয়েছে',
    data: {
      sessionId: chatSessionId,
      response: result.response,
      chat: result.chat
    },
  });
});

// চ্যাট হিস্টোরি
const getChatHistory = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  // ✅ টাইপ কাস্টিং ফিক্স
  const sessionId = req.params.sessionId as string;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const history = await AIService.getChatHistory(userId, sessionId, page, limit);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'চ্যাট হিস্টোরি পাওয়া গেছে',
    data: history,
  });
});

// চ্যাট সেশনস
const getChatSessions = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const sessions = await AIService.getChatSessions(userId);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'চ্যাট সেশন পাওয়া গেছে',
    data: sessions,
  });
});

// চ্যাট ডিলিট
const deleteChat = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  // ✅ টাইপ কাস্টিং ফিক্স
  const chatId = req.params.chatId as string;

  await AIService.deleteChat(userId, chatId);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'চ্যাট ডিলিট করা হয়েছে',
    data: null,
  });
});

// সেশন ডিলিট
const deleteSession = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  // ✅ টাইপ কাস্টিং ফিক্স
  const sessionId = req.params.sessionId as string;

  await AIService.deleteSession(userId, sessionId);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'সেশন ডিলিট করা হয়েছে',
    data: null,
  });
});

// ফাইন্যান্সিয়াল বিশ্লেষণ
const analyzeFinances = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 50
  });

  const analysis = await AIService.analyzeFinancialData(userId, transactions);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'বিশ্লেষণ সম্পন্ন হয়েছে',
    data: analysis,
  });
});

// বাজেট সুপারিশ
const getBudgetRecommendation = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { monthlyIncome } = req.body;

  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  const expenses = await prisma.transaction.groupBy({
    by: ['category'],
    where: {
      userId,
      type: 'EXPENSE',
      date: { gte: lastMonth }
    },
    _sum: { amount: true }
  });

  const recommendation = await AIService.getBudgetRecommendation(
    userId,
    Number(monthlyIncome), // নিশ্চিত করুন এটি নাম্বার
    expenses.map(e => ({ category: e.category, amount: e._sum.amount || 0 }))
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'বাজেট সুপারিশ তৈরি হয়েছে',
    data: recommendation,
  });
});

export const AIController = {
  chat,
  getChatHistory,
  getChatSessions,
  deleteChat,
  deleteSession,
  analyzeFinances,
  getBudgetRecommendation
};