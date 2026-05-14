import { z } from 'zod';
// ========================================
// এনাম ভ্যালিডেশন
// ========================================
const TransactionType = z.enum(['INCOME', 'EXPENSE', 'TRANSFER']);
const TransactionCategory = z.enum([
    'FOOD', 'TRANSPORT', 'ENTERTAINMENT', 'SHOPPING',
    'UTILITIES', 'HEALTHCARE', 'EDUCATION', 'RENT',
    'SALARY', 'INVESTMENT', 'OTHER'
]);
// ========================================
// 1. ট্রানজেকশন তৈরি ভ্যালিডেশন
// ========================================
export const createTransactionSchema = z.object({
    body: z.object({
        type: TransactionType,
        amount: z
            .number()
            .positive('পরিমাণ ০ এর বেশি হতে হবে')
            .min(1, 'পরিমাণ কমপক্ষে ১ টাকা হতে হবে')
            .max(999999999, 'পরিমাণ খুব বেশি'),
        description: z
            .string()
            .max(200, 'বিবরণ সর্বোচ্চ ২০০ অক্ষরের হতে পারে')
            .optional()
            .nullable()
            .transform(val => val?.trim()),
        date: z
            .string()
            .datetime()
            .optional()
            .nullable(),
        category: TransactionCategory.optional(),
        currency: z
            .string()
            .length(3, 'কারেন্সি কোড ৩ অক্ষরের হতে হবে')
            .default('BDT'),
        location: z
            .string()
            .max(100, 'লোকেশন সর্বোচ্চ ১০০ অক্ষরের হতে পারে')
            .optional()
            .nullable()
            .transform(val => val?.trim()),
        tags: z
            .array(z.string().max(20, 'ট্যাগ সর্বোচ্চ ২০ অক্ষরের হতে পারে'))
            .max(10, 'সর্বোচ্চ ১০টি ট্যাগ দেওয়া যাবে')
            .optional()
            .default([]),
        receiptUrl: z
            .string()
            .url('সঠিক URL দিন')
            .optional()
            .nullable(),
        isRecurring: z
            .boolean()
            .default(false),
    }),
});
// ========================================
// 2. ট্রানজেকশন আপডেট ভ্যালিডেশন
// ========================================
export const updateTransactionSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'ট্রানজেকশন আইডি প্রয়োজন'),
    }),
    body: z.object({
        type: TransactionType.optional(),
        amount: z.number().positive().min(1).optional(),
        description: z.string().max(200).optional().nullable(),
        date: z.string().datetime().optional().nullable(),
        category: TransactionCategory.optional(),
        currency: z.string().length(3).optional(),
        location: z.string().max(100).optional().nullable(),
        tags: z.array(z.string().max(20)).max(10).optional(),
        receiptUrl: z.string().url().optional().nullable(),
        isRecurring: z.boolean().optional(),
    }),
});
// ========================================
// 3. ট্রানজেকশন আইডি প্যারাম ভ্যালিডেশন
// ========================================
export const transactionIdParamSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'ট্রানজেকশন আইডি প্রয়োজন'),
    }),
});
// ========================================
// 4. ট্রানজেকশন লিস্ট ফিল্টার ভ্যালিডেশন (FIXED)
// ========================================
export const transactionListSchema = z.object({
    query: z.object({
        page: z
            .string()
            .regex(/^\d+$/, 'পৃষ্ঠা নম্বর সঠিক নয়')
            .transform(Number)
            .pipe(z.number().min(1))
            .optional()
            .default(1), // ✅ '1' এর বদলে 1 (Number) হবে
        limit: z
            .string()
            .regex(/^\d+$/, 'লিমিট সঠিক নয়')
            .transform(Number)
            .pipe(z.number().min(1).max(100))
            .optional()
            .default(10), // ✅ '10' এর বদলে 10 (Number) হবে
        type: z
            .enum(['INCOME', 'EXPENSE', 'TRANSFER', 'all'])
            .optional()
            .default('all'),
        category: z
            .enum([
            'FOOD', 'TRANSPORT', 'ENTERTAINMENT', 'SHOPPING',
            'UTILITIES', 'HEALTHCARE', 'EDUCATION', 'RENT',
            'SALARY', 'INVESTMENT', 'OTHER', 'all'
        ])
            .optional()
            .default('all'),
        startDate: z
            .string()
            .datetime()
            .optional(),
        endDate: z
            .string()
            .datetime()
            .optional(),
        minAmount: z
            .string()
            .regex(/^\d+(\.\d+)?$/, 'পরিমাণ সঠিক নয়')
            .transform(Number)
            .optional(),
        maxAmount: z
            .string()
            .regex(/^\d+(\.\d+)?$/, 'পরিমাণ সঠিক নয়')
            .transform(Number)
            .optional(),
        search: z
            .string()
            .max(50, 'সার্চ টার্ম সর্বোচ্চ ৫০ অক্ষরের হতে পারে')
            .optional()
            .transform(val => val?.trim()),
        isRecurring: z
            .enum(['true', 'false'])
            .optional()
            .transform(val => val === 'true'),
    }),
}).refine(data => {
    if (data.query.startDate && data.query.endDate) {
        return new Date(data.query.startDate) <= new Date(data.query.endDate);
    }
    return true;
}, {
    message: 'শুরু তারিখ শেষ তারিখের আগে হতে হবে',
    path: ['query', 'startDate']
});
// ========================================
// 5. বাল্ক ইম্পোর্ট ভ্যালিডেশন
// ========================================
export const bulkImportSchema = z.object({
    body: z.object({
        transactions: z
            .array(z.object({
            type: TransactionType,
            amount: z.number().positive(),
            description: z.string().optional(),
            date: z.string().datetime().optional(),
            category: TransactionCategory.optional(),
        }))
            .min(1, 'কমপক্ষে একটি ট্রানজেকশন দিন')
            .max(500, 'সর্বোচ্চ ৫০০ ট্রানজেকশন একসাথে ইম্পোর্ট করা যাবে'),
    }),
});
// ========================================
// 6. ক্যাটাগরি বিশ্লেষণ ভ্যালিডেশন
// ========================================
export const categoryAnalysisSchema = z.object({
    query: z.object({
        startDate: z.string().datetime('সঠিক তারিখ দিন'),
        endDate: z.string().datetime('সঠিক তারিখ দিন'),
    }),
}).refine(data => {
    return new Date(data.query.startDate) <= new Date(data.query.endDate);
}, {
    message: 'শুরু তারিখ শেষ তারিখের আগে হতে হবে',
    path: ['query']
});
