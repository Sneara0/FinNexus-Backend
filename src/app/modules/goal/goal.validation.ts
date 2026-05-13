import { z } from 'zod';

// ========================================
// 1. গোল তৈরি ভ্যালিডেশন
// ========================================
export const createGoalSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'গোলের নাম কমপক্ষে ২ অক্ষরের হতে হবে')
      .max(100, 'গোলের নাম সর্বোচ্চ ১০০ অক্ষরের হতে পারে')
      .transform(val => val.trim()),
    
    targetAmount: z
      .number()
      .positive('টার্গেট পরিমাণ ০ এর বেশি হতে হবে')
      .min(100, 'টার্গেট পরিমাণ কমপক্ষে ১০০ টাকা হতে হবে')
      .max(999999999, 'টার্গেট পরিমাণ খুব বেশি'),
    
    deadline: z
      .string()
      .datetime()
      .refine((date) => new Date(date) > new Date(), {
        message: 'ডেডলাইন ভবিষ্যতের তারিখ হতে হবে'
      }),
    
    note: z
      .string()
      .max(500, 'নোট সর্বোচ্চ ৫০০ অক্ষরের হতে পারে')
      .optional()
      .nullable()
      .transform(val => val?.trim()),
  }),
});

// ========================================
// 2. গোল আপডেট ভ্যালিডেশন
// ========================================
export const updateGoalSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'গোল আইডি প্রয়োজন'),
  }),
  body: z.object({
    name: z
      .string()
      .min(2, 'গোলের নাম কমপক্ষে ২ অক্ষরের হতে হবে')
      .max(100, 'গোলের নাম সর্বোচ্চ ১০০ অক্ষরের হতে পারে')
      .optional()
      .transform(val => val?.trim()),
    
    targetAmount: z
      .number()
      .positive('টার্গেট পরিমাণ ০ এর বেশি হতে হবে')
      .min(100, 'টার্গেট পরিমাণ কমপক্ষে ১০০ টাকা হতে হবে')
      .optional(),
    
    deadline: z
      .string()
      .datetime()
      .refine((date) => new Date(date) > new Date(), {
        message: 'ডেডলাইন ভবিষ্যতের তারিখ হতে হবে'
      })
      .optional(),
    
    note: z
      .string()
      .max(500, 'নোট সর্বোচ্চ ৫০০ অক্ষরের হতে পারে')
      .optional()
      .nullable()
      .transform(val => val?.trim()),
  }),
});

// ========================================
// 3. গোল আইডি প্যারাম ভ্যালিডেশন
// ========================================
export const goalIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'গোল আইডি প্রয়োজন'),
  }),
});

// ========================================
// 4. টাকা যোগ/কমানো ভ্যালিডেশন
// ========================================
export const addRemoveAmountSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'গোল আইডি প্রয়োজন'),
  }),
  body: z.object({
    amount: z
      .number()
      .positive('পরিমাণ ০ এর বেশি হতে হবে')
      .min(1, 'পরিমাণ কমপক্ষে ১ টাকা হতে হবে')
      .max(9999999, 'একবারে এত টাকা যোগ করা যাবে না'),
  }),
});

// ========================================
// 5. গোল লিস্ট ফিল্টার ভ্যালিডেশন
// ========================================
export const goalListSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .default('1')
      .transform((val) => Number(val))
      .pipe(z.number().min(1)),
    
    limit: z
      .string()
      .optional()
      .default('10')
      .transform((val) => Number(val))
      .pipe(z.number().min(1).max(100)),
    
    // ✅ সমাধান: 'invalid_type_error' এর বদলে সরাসরি 'message' অথবা 'error' ব্যবহার
    status: z
      .enum(['active', 'completed', 'all'] as const, {
        error: 'স্ট্যাটাস active, completed বা all হতে হবে',
      })
      .optional()
      .default('all'),
    
    sortBy: z
      .enum(['deadline', 'progress', 'target', 'created'] as const, {
        message: 'sortBy deadline, progress, target বা created হতে হবে',
      })
      .optional()
      .default('created'),
  }),
});

// ========================================
// টাইপ এক্সপোর্ট
// ========================================
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type GoalIdParamInput = z.infer<typeof goalIdParamSchema>;
export type AddRemoveAmountInput = z.infer<typeof addRemoveAmountSchema>;
export type GoalListInput = z.infer<typeof goalListSchema>;