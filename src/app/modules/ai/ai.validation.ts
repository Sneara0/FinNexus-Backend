import { z } from 'zod';

// ========================================
// AI চ্যাট ভ্যালিডেশন
// ========================================
const chatSchema = z.object({
  body: z.object({
    sessionId: z.string().min(1, 'সেশন আইডি প্রয়োজন').optional(),
    message: z
      .string()
      .min(1, 'মেসেজ প্রয়োজন')
      .max(500, 'মেসেজ সর্বোচ্চ ৫০০ অক্ষরের হতে পারে'),
  }),
});

// ========================================
// চ্যাট হিস্টোরি ভ্যালিডেশন
// ========================================
const chatHistorySchema = z.object({
  params: z.object({
    sessionId: z.string().min(1, 'সেশন আইডি প্রয়োজন'),
  }),
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, 'পৃষ্ঠা নম্বর সঠিক নয়')
      .transform(Number)
      .pipe(z.number().min(1))
      .optional()
      .default(1), // ✅ ফিক্সড: নাম্বার হিসেবে ডিফল্ট ভ্যালু
    
    limit: z
      .string()
      .regex(/^\d+$/, 'লিমিট সঠিক নয়')
      .transform(Number)
      .pipe(z.number().min(1).max(100))
      .optional()
      .default(20), // ✅ ফিক্সড: নাম্বার হিসেবে ডিফল্ট ভ্যালু
  }),
});

// ========================================
// বাজেট সুপারিশ ভ্যালিডেশন
// ========================================
const budgetRecommendationSchema = z.object({
  body: z.object({
    monthlyIncome: z
      .number({
        // ✅ ফিক্স: invalid_type_error এর বদলে message ব্যবহার করা হয়েছে
        message: 'মাসিক আয় একটি সংখ্যা হতে হবে', 
      })
      .positive('মাসিক আয় ০ এর বেশি হতে হবে'),
  }),
});

// ========================================
// ফাইন্যান্সিয়াল বিশ্লেষণ ভ্যালিডেশন
// ========================================
const periods = ['week', 'month', 'year', 'all'] as const;

const analyzeSchema = z.object({
  query: z.object({
    period: z
      .enum(periods, {
        // ✅ ফিক্স: errorMap বা invalid_type_error এর বদলে message ব্যবহার করুন
        message: 'পিরিয়ড অবশ্যই week, month, year বা all হতে হবে',
      })
      .default('month'),
    
    limit: z
      .string()
      .regex(/^\d+$/, 'লিমিট সঠিক নয়')
      .transform(Number)
      .pipe(z.number().min(1).max(500))
      .optional()
      .default(50),
  }).optional(),
});

// এক্সপোর্ট অবজেক্ট
export const AIValidation = {
  chatSchema,
  chatHistorySchema,
  budgetRecommendationSchema,
  analyzeSchema,
};

// টাইপ এক্সপোর্ট
export type ChatInput = z.infer<typeof chatSchema>;
export type ChatHistoryInput = z.infer<typeof chatHistorySchema>;
export type BudgetRecommendationInput = z.infer<typeof budgetRecommendationSchema>;
export type AnalyzeInput = z.infer<typeof analyzeSchema>;