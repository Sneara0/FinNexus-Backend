import { z } from 'zod';
// ========================================
// 1. চ্যাট ভ্যালিডেশন
// ========================================
export const chatSchema = z.object({
    body: z.object({
        message: z
            .string()
            .min(1, 'Message is required')
            .max(2000, 'Message is too long'),
        sessionId: z
            .string()
            .optional()
    })
});
// ========================================
// 2. চ্যাট হিস্টোরি ভ্যালিডেশন (FIXED)
// ========================================
export const chatHistorySchema = z.object({
    params: z.object({
        sessionId: z.string().min(1, 'Session ID is required')
    }),
    query: z.object({
        // .transform(Number) এর পর .default() এ অবশ্যই number দিতে হবে
        page: z
            .string()
            .regex(/^\d+$/, 'Page must be a number')
            .transform(Number)
            .optional()
            .default(1), // ভুল ছিল '1', সঠিক হলো 1
        limit: z
            .string()
            .regex(/^\d+$/, 'Limit must be a number')
            .transform(Number)
            .optional()
            .default(20) // ভুল ছিল '20', সঠিক হলো 20
    })
});
// ========================================
// 3. বাজেট সুপারিশ ভ্যালিডেশন
// ========================================
export const budgetRecommendationSchema = z.object({
    body: z.object({
        monthlyIncome: z
            .number()
            .positive('Monthly income must be positive')
            .min(1000, 'Monthly income must be at least 1000')
            .max(10000000, 'Monthly income is too high')
    })
});
// ========================================
// 4. কন্টেন্ট জেনারেশন ভ্যালিডেশন (FIXED ENUM)
// ========================================
export const contentGenerationSchema = z.object({
    body: z.object({
        // enum এ errorMap সরাসরি কাজ করে না, invalid_type_error ব্যবহার করুন
        type: z.enum(['description', 'summary', 'blog', 'caption', 'email'], {
            // invalid_type_error এর বদলে সরাসরি 'error' বা 'message' ব্যবহার করুন
            // অথবা শুধু একটি স্ট্রিং পাস করুন
            error: 'Type must be description, summary, blog, caption, or email'
        }),
        topic: z
            .string()
            .min(1, 'Topic is required')
            .max(200, 'Topic is too long'),
        tone: z
            .enum(['professional', 'casual', 'friendly', 'formal'])
            .optional()
            .default('professional'),
        length: z
            .enum(['short', 'medium', 'long'])
            .optional()
            .default('medium')
    })
});
// ========================================
// 5. অটো ট্যাগ ভ্যালিডেশন
// ========================================
export const autoTagSchema = z.object({
    body: z.object({
        description: z
            .string()
            .min(1, 'Description is required')
            .max(500, 'Description is too long'),
        amount: z
            .number()
            .positive('Amount must be positive')
            .optional()
    })
});
// ========================================
// 6. ভয়েস কমান্ড ভ্যালিডেশন
// ========================================
export const voiceCommandSchema = z.object({
    body: z.object({
        text: z
            .string()
            .min(1, 'Voice text is required')
            .max(500, 'Voice text is too long')
    })
});
// ========================================
// 7. রিকমেন্ডেশন ভ্যালিডেশন
// ========================================
export const recommendationsSchema = z.object({
    body: z.object({
        limit: z
            .number()
            .min(1, 'Limit must be at least 1')
            .max(20, 'Limit cannot exceed 20')
            .optional()
            .default(4)
    })
});
// ========================================
// এক্সপোর্ট সব স্কিমা
// ========================================
export const AIValidation = {
    chatSchema,
    chatHistorySchema,
    budgetRecommendationSchema,
    contentGenerationSchema,
    autoTagSchema,
    voiceCommandSchema,
    recommendationsSchema
};
