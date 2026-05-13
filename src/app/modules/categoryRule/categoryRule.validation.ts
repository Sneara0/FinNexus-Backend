import { z } from 'zod';

// ========================================
// ক্যাটাগরি এনাম
// ========================================
const TransactionCategory = z.enum([
  'FOOD', 'TRANSPORT', 'ENTERTAINMENT', 'SHOPPING',
  'UTILITIES', 'HEALTHCARE', 'EDUCATION', 'RENT',
  'SALARY', 'INVESTMENT', 'OTHER'
]);

const TransactionType = z.enum(['INCOME', 'EXPENSE', 'TRANSFER']);

// ========================================
// 1. রুল তৈরি ভ্যালিডেশন
// ========================================
export const createRuleSchema = z.object({
  body: z.object({
    keyword: z
      .string()
      .min(1, 'কীওয়ার্ড প্রয়োজন')
      .max(50, 'কীওয়ার্ড সর্বোচ্চ ৫০ অক্ষরের হতে পারে')
      .transform(val => val.trim()),
    
    category: TransactionCategory,
    
    type: TransactionType.optional(),
    
    priority: z
      .number()
      .int('প্রায়োরিটি পূর্ণ সংখ্যা হতে হবে')
      .min(0, 'প্রায়োরিটি ০ বা তার বেশি হতে হবে')
      .max(100, 'প্রায়োরিটি সর্বোচ্চ ১০০ হতে পারে')
      .optional()
      .default(0),
  }),
});

// ========================================
// 2. রুল আপডেট ভ্যালিডেশন
// ========================================
export const updateRuleSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'রুল আইডি প্রয়োজন'),
  }),
  body: z.object({
    keyword: z
      .string()
      .min(1, 'কীওয়ার্ড প্রয়োজন')
      .max(50, 'কীওয়ার্ড সর্বোচ্চ ৫০ অক্ষরের হতে পারে')
      .optional()
      .transform(val => val?.trim()),
    
    category: TransactionCategory.optional(),
    
    type: TransactionType.optional().nullable(),
    
    priority: z
      .number()
      .int('প্রায়োরিটি পূর্ণ সংখ্যা হতে হবে')
      .min(0, 'প্রায়োরিটি ০ বা তার বেশি হতে হবে')
      .max(100, 'প্রায়োরিটি সর্বোচ্চ ১০০ হতে পারে')
      .optional(),
    
    isActive: z
      .boolean()
      .optional(),
  }),
});

// ========================================
// 3. রুল আইডি প্যারাম ভ্যালিডেশন
// ========================================
export const ruleIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'রুল আইডি প্রয়োজন'),
  }),
});

// ========================================
// 4. রুল লিস্ট ফিল্টার ভ্যালিডেশন (FIXED ✅)
// ========================================
export const ruleListSchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, 'পৃষ্ঠা নম্বর সঠিক নয়')
      .transform(Number)
      .pipe(z.number().min(1))
      .optional()
      .default(1), // ✅ '1' থেকে 1 করা হয়েছে
    
    limit: z
      .string()
      .regex(/^\d+$/, 'লিমিট সঠিক নয়')
      .transform(Number)
      .pipe(z.number().min(1).max(100))
      .optional()
      .default(10), // ✅ '10' থেকে 10 করা হয়েছে
    
    isActive: z
      .enum(['true', 'false'])
      .optional()
      .transform(val => val === 'true'),
  }),
});

// ========================================
// 5. অটো ডিটেক্ট ভ্যালিডেশন
// ========================================
export const autoDetectSchema = z.object({
  body: z.object({
    description: z
      .string()
      .min(1, 'বিবরণ প্রয়োজন')
      .max(200, 'বিবরণ সর্বোচ্চ ২০০ অক্ষরের হতে পারে')
      .transform(val => val.trim()),
  }),
});

// ========================================
// 6. বাল্ক ডিলিট ভ্যালিডেশন
// ========================================
export const bulkDeleteSchema = z.object({
  body: z.object({
    ruleIds: z
      .array(z.string().min(1, 'রুল আইডি প্রয়োজন'))
      .min(1, 'কমপক্ষে একটি রুল আইডি প্রয়োজন')
      .max(100, 'সর্বোচ্চ ১০০টি রুল আইডি দেওয়া যাবে'),
  }),
});

// ========================================
// টাইপ এক্সপোর্ট
// ========================================
export type CreateRuleInput = z.infer<typeof createRuleSchema>;
export type UpdateRuleInput = z.infer<typeof updateRuleSchema>;
export type RuleIdParamInput = z.infer<typeof ruleIdParamSchema>;
export type RuleListInput = z.infer<typeof ruleListSchema>;
export type AutoDetectInput = z.infer<typeof autoDetectSchema>;
export type BulkDeleteInput = z.infer<typeof bulkDeleteSchema>;