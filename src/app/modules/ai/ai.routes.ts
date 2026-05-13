import express from 'express';
import { authenticate } from '../../../middlewares/auth.middleware.js';
import { validateRequest } from '../../../middlewares/validation.middleware.js';
import { AIController } from './ai.controller.js';
import { AIValidation } from './ai.validation.js';

const router = express.Router();

/**
 * @description সকল AI সংশ্লিষ্ট রাউটের জন্য এই মিডলওয়্যারটি কাজ করবে।
 * ইউজার অথেন্টিকেশন নিশ্চিত করা।
 */
router.use(authenticate);

// ----------------------------------------------------------------------
// ১. চ্যাট মডিউল (Chat Module)
// ----------------------------------------------------------------------

// চ্যাট রেসপন্স জেনারেট করা
router.post(
  '/chat',
  validateRequest(AIValidation.chatSchema),
  AIController.chat
);

// সব চ্যাট সেশন রিটার্ন করা
router.get(
  '/sessions',
  AIController.getChatSessions
);

// নির্দিষ্ট সেশনের চ্যাট হিস্টোরি (Pagination সহ)
router.get(
  '/history/:sessionId',
  validateRequest(AIValidation.chatHistorySchema),
  AIController.getChatHistory
);

// একক চ্যাট মেসেজ ডিলিট করা
router.delete(
  '/chat/:chatId',
  AIController.deleteChat
);

// পুরো সেশন ডিলিট করা
router.delete(
  '/session/:sessionId',
  AIController.deleteSession
);

// ----------------------------------------------------------------------
// ২. ফাইন্যান্সিয়াল এনালাইসিস ও বাজেট (Finance & Budget)
// ----------------------------------------------------------------------

// ট্রানজেকশন বিশ্লেষণ ও AI ইনসাইট
router.get(
  '/analyze',
  AIController.analyzeFinances
);

// মাসিক আয়ের ভিত্তিতে স্মার্ট বাজেট রিকমেন্ডেশন
router.post(
  '/budget-recommendation',
  validateRequest(AIValidation.budgetRecommendationSchema),
  AIController.getBudgetRecommendation
);

// ----------------------------------------------------------------------
// ৩. কন্টেন্ট ও অটোমেশন (Content & Automation)
// ----------------------------------------------------------------------

// AI কন্টেন্ট জেনারেটর (Blog, Summary, Email, etc.)
router.post(
  '/generate-content',
  validateRequest(AIValidation.contentGenerationSchema),
  AIController.generateContent
);

// বিবরণ থেকে অটোমেটিক ট্রানজেকশন ক্যাটাগরি ডিটেকশন
router.post(
  '/auto-tag',
  validateRequest(AIValidation.autoTagSchema),
  AIController.autoTagTransaction
);

// ----------------------------------------------------------------------
// ৪. ইন্টেলিজেন্ট ফিচারেস (Voice & Smart Recommendations)
// ----------------------------------------------------------------------

// টেক্সট থেকে ভয়েস কমান্ড প্রসেসিং
router.post(
  '/voice-command',
  validateRequest(AIValidation.voiceCommandSchema),
  AIController.processVoiceCommand
);

// ইউজারের বিহেভিয়ার ভিত্তিক স্মার্ট রিকমেন্ডেশন
router.post(
  '/recommendations',
  validateRequest(AIValidation.recommendationsSchema),
  AIController.getRecommendations
);

export const AIRoutes = router;