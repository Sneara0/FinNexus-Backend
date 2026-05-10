import express from 'express';
 // আপনার প্রজেক্টের মিডলওয়্যারের নাম অনুযায়ী চেক করুন
import { AIController } from './ai.controller.js';
import { AIValidation } from './ai.validation.js';
import { validateRequest } from '../../../middlewares/validation.middleware.js';

const router = express.Router();

// চ্যাট রুট
router.post(
  '/chat',
  validateRequest(AIValidation.chatSchema),
  AIController.chat
);

// চ্যাট হিস্টোরি
router.get(
  '/history/:sessionId',
  validateRequest(AIValidation.chatHistorySchema),
  AIController.getChatHistory
);

// চ্যাট সেশনস
router.get(
  '/sessions',
  AIController.getChatSessions
);

// চ্যাট ডিলিট
router.delete(
  '/chat/:chatId',
  AIController.deleteChat
);

// সেশন ডিলিট
router.delete(
  '/session/:sessionId',
  AIController.deleteSession
);

// ফাইন্যান্সিয়াল বিশ্লেষণ
router.get(
  '/analyze',
  AIController.analyzeFinances
);

// বাজেট সুপারিশ
router.post(
  '/budget-recommendation',
  validateRequest(AIValidation.budgetRecommendationSchema),
  AIController.getBudgetRecommendation
);

export const AIRoutes = router;