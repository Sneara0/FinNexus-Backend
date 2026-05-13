import { z } from 'zod';

// ========================================
// 1. নোটিফিকেশন আইডি প্যারাম ভ্যালিডেশন
// ========================================
export const notificationIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'নোটিফিকেশন আইডি প্রয়োজন'),
  }),
});

// ========================================
// 2. নোটিফিকেশন লিস্ট ফিল্টার ভ্যালিডেশন
// ========================================
export const notificationListSchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, 'পৃষ্ঠা নম্বর সঠিক নয়')
      .optional()
      .transform((val) => (val ? Number(val) : 1)), // স্ট্রিং থাকলে নাম্বার করো, নাহলে ১
    
    limit: z
      .string()
      .regex(/^\d+$/, 'লিমিট সঠিক নয়')
      .optional()
      .transform((val) => (val ? Number(val) : 10)), // স্ট্রিং থাকলে নাম্বার করো, নাহলে ১০
    
    isRead: z
      .enum(['true', 'false'])
      .optional()
      .transform((val) => (val === undefined ? undefined : val === 'true')),
    
    type: z
      .enum(['BUDGET_ALERT', 'GOAL_ACHIEVED', 'SUBSCRIPTION_RENEWAL', 'AI_INSIGHT', 'WEEKLY_REPORT', 'PAYMENT_REMINDER', 'all'])
      .optional()
      .default('all'),
  }),
});

// ========================================
// 3. নোটিফিকেশন তৈরি ভ্যালিডেশন
// ========================================
const notificationBaseBody = z.object({
  title: z
    .string()
    .min(1, 'টাইটেল প্রয়োজন')
    .max(100, 'টাইটেল সর্বোচ্চ ১০০ অক্ষরের হতে পারে'),
  
  message: z
    .string()
    .min(1, 'মেসেজ প্রয়োজন')
    .max(500, 'মেসেজ সর্বোচ্চ ৫০০ অক্ষরের হতে পারে'),
  
  type: z.enum(['BUDGET_ALERT', 'GOAL_ACHIEVED', 'SUBSCRIPTION_RENEWAL', 'AI_INSIGHT', 'WEEKLY_REPORT', 'PAYMENT_REMINDER']),
  
  link: z
    .string()
    .url('সঠিক URL দিন')
    .optional()
    .nullable(),
  
  metadata: z.any().optional()
});

export const createNotificationSchema = z.object({
  body: notificationBaseBody,
});

// ========================================
// 4. বাল্ক নোটিফিকেশন তৈরি ভ্যালিডেশন
// ========================================
export const bulkCreateNotificationSchema = z.object({
  body: notificationBaseBody.extend({
    userIds: z
      .array(z.string().min(1, 'ইউজার আইডি প্রয়োজন'))
      .min(1, 'কমপক্ষে একটি ইউজার আইডি প্রয়োজন')
      .max(100, 'সর্বোচ্চ ১০০টি ইউজার আইডি দেওয়া যাবে'),
  }),
});

// ========================================
// টাইপ এক্সপোর্ট
// ========================================
export type NotificationIdParamInput = z.infer<typeof notificationIdParamSchema>;
export type NotificationListInput = z.infer<typeof notificationListSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type BulkCreateNotificationInput = z.infer<typeof bulkCreateNotificationSchema>;