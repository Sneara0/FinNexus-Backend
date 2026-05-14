import { z } from 'zod';
// ========================================
// বিলিং সাইকেল এনাম
// ========================================
const BillingCycle = z.enum(['daily', 'weekly', 'monthly', 'yearly']);
// ========================================
// 1. সাবস্ক্রিপশন তৈরি ভ্যালিডেশন
// ========================================
export const createSubscriptionSchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে')
            .max(100, 'নাম সর্বোচ্চ ১০০ অক্ষরের হতে পারে')
            .transform(val => val.trim()),
        amount: z
            .number()
            .positive('পরিমাণ ০ এর বেশি হতে হবে')
            .min(1, 'পরিমাণ কমপক্ষে ১ টাকা হতে হবে')
            .max(999999, 'পরিমাণ খুব বেশি'),
        currency: z
            .string()
            .length(3, 'কারেন্সি কোড ৩ অক্ষরের হতে হবে')
            .optional()
            .default('BDT'), // ✅ Optional এর পর default থাকাই ভালো
        billingCycle: BillingCycle,
        startDate: z
            .string()
            .datetime('সঠিক তারিখ দিন')
            .refine((date) => new Date(date) <= new Date(), {
            message: 'শুরু তারিখ ভবিষ্যতের হতে পারে না'
        }),
        category: z
            .string()
            .optional()
            .default('ENTERTAINMENT'),
    }),
});
// ========================================
// 2. সাবস্ক্রিপশন আপডেট ভ্যালিডেশন
// ========================================
export const updateSubscriptionSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'সাবস্ক্রিপশন আইডি প্রয়োজন'),
    }),
    body: z.object({
        name: z
            .string()
            .min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে')
            .max(100, 'নাম সর্বোচ্চ ১০০ অক্ষরের হতে পারে')
            .optional()
            .transform(val => val?.trim()),
        amount: z
            .number()
            .positive('পরিমাণ ০ এর বেশি হতে হবে')
            .min(1)
            .optional(),
        currency: z
            .string()
            .length(3)
            .optional(),
        billingCycle: BillingCycle.optional(),
        category: z
            .string()
            .optional(),
    }),
});
// ========================================
// 3. সাবস্ক্রিপশন আইডি প্যারাম ভ্যালিডেশন
// ========================================
export const subscriptionIdParamSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'সাবস্ক্রিপশন আইডি প্রয়োজন'),
    }),
});
// ========================================
// 4. সাবস্ক্রিপশন লিস্ট ফিল্টার ভ্যালিডেশন (FIXED)
// ========================================
export const subscriptionListSchema = z.object({
    query: z.object({
        page: z
            .string()
            .regex(/^\d+$/, 'পৃষ্ঠা নম্বর সঠিক নয়')
            .transform(Number)
            .pipe(z.number().min(1))
            .optional()
            .default(1), // ✅ '1' এর বদলে 1 (Number) করা হয়েছে
        limit: z
            .string()
            .regex(/^\d+$/, 'লিমিট সঠিক নয়')
            .transform(Number)
            .pipe(z.number().min(1).max(100))
            .optional()
            .default(10), // ✅ '10' এর বদলে 10 (Number) করা হয়েছে
        isActive: z
            .enum(['true', 'false'])
            .optional()
            .transform(val => val === 'true'),
        category: z
            .string()
            .optional()
            .default('all'),
    }),
});
