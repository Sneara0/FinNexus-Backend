import { z } from 'zod';

// ========================================
// ক্যাটাগরি এনাম
// ========================================
const TransactionCategory = z.enum([
  'FOOD', 'TRANSPORT', 'ENTERTAINMENT', 'SHOPPING',
  'UTILITIES', 'HEALTHCARE', 'EDUCATION', 'RENT',
  'SALARY', 'INVESTMENT', 'OTHER'
]);

const BudgetPeriod = z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']);

// ========================================
// 1. বাজেট তৈরি ভ্যালিডেশন
// ========================================
export const createBudgetSchema = z.object({
  body: z.object({
    category: TransactionCategory,
    amount: z
      .number()
      .positive('বাজেট পরিমাণ ০ এর বেশি হতে হবে')
      .min(1, 'বাজেট পরিমাণ কমপক্ষে ১ টাকা হতে হবে')
      .max(999999999, 'বাজেট পরিমাণ খুব বেশি'),
    
    period: BudgetPeriod.default('MONTHLY'),
    
    alertThreshold: z
      .number()
      .min(0, 'এলার্ট থ্রেশহোল্ড ০-১০০ এর মধ্যে হতে হবে')
      .max(100, 'এলার্ট থ্রেশহোল্ড ০-১০০ এর মধ্যে হতে হবে')
      .optional()
      .default(80),
    
    note: z
      .string()
      .max(500, 'নোট সর্বোচ্চ ৫০০ অক্ষরের হতে পারে')
      .optional()
      .nullable(),
  }),
});

// ========================================
// 2. বাজেট আপডেট ভ্যালিডেশন
// ========================================
export const updateBudgetSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'বাজেট আইডি প্রয়োজন'),
  }),
  body: z.object({
    amount: z
      .number()
      .positive('বাজেট পরিমাণ ০ এর বেশি হতে হবে')
      .min(1, 'বাজেট পরিমাণ কমপক্ষে ১ টাকা হতে হবে')
      .optional(),
    
    alertThreshold: z
      .number()
      .min(0, 'এলার্ট থ্রেশহোল্ড ০-১০০ এর মধ্যে হতে হবে')
      .max(100, 'এলার্ট থ্রেশহোল্ড ০-১০০ এর মধ্যে হতে হবে')
      .optional(),
    
    note: z
      .string()
      .max(500, 'নোট সর্বোচ্চ ৫০০ অক্ষরের হতে পারে')
      .optional()
      .nullable(),
    
    isActive: z
      .boolean()
      .optional(),
  }),
});

// ========================================
// 3. বাজেট আইডি প্যারাম ভ্যালিডেশন
// ========================================
export const budgetIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'বাজেট আইডি প্রয়োজন'),
  }),
});

// ========================================
// 4. বাজেট লিস্ট ফিল্টার ভ্যালিডেশন
// ========================================
export const budgetListSchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, 'পৃষ্ঠা নম্বর সঠিক নয়')
      .transform(Number)
      .pipe(z.number().min(1))
      .optional()
      .default(1), // ✅ ফিক্স: '1' থেকে ১ করা হয়েছে
    
    limit: z
      .string()
      .regex(/^\d+$/, 'লিমিট সঠিক নয়')
      .transform(Number)
      .pipe(z.number().min(1).max(100))
      .optional()
      .default(10), // ✅ ফিক্স: '10' থেকে ১০ করা হয়েছে
    
    period: z
      .enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'all'])
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
    
    isActive: z
      .enum(['true', 'false'])
      .optional()
      .transform(val => val === 'true'),
  }),
});

// ========================================
// ৯. BudgetValidation অবজেক্ট এক্সপোর্ট (রাউট ফাইলের জন্য)
// ========================================
export const BudgetValidation = {
  createBudgetSchema,
  updateBudgetSchema,
  budgetIdParamSchema,
  budgetListSchema,
};

// টাইপ এক্সপোর্ট
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type BudgetIdParamInput = z.infer<typeof budgetIdParamSchema>;
export type BudgetListInput = z.infer<typeof budgetListSchema>;