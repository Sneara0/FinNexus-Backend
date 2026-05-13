import { z } from 'zod';

// ========================================
// এনাম এবং বেসিক স্কিমা (Enums)
// ========================================
export const UserRoleSchema = z.enum(['ADMIN', 'MANAGER', 'USER']);

// ========================================
// রাউট ভ্যালিডেশন স্কিমা (Routes Validation)
// ========================================

// ১. ইউজার লিস্ট ভ্যালিডেশন (Pagination & Filters)
export const userListSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
    search: z.string().optional(),
    role: UserRoleSchema.optional(),
    status: z.enum(['active', 'blocked']).optional(),
  }),
});

// ২. ইউজার আইডি প্যারামিটার ভ্যালিডেশন
export const userIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'সঠিক ইউজার আইডি প্রদান করুন'),
  }),
});

// ৩. রোল পরিবর্তন ভ্যালিডেশন
export const changeRoleSchema = z.object({
  body: z.object({
    role: UserRoleSchema,
  }),
});

// ৪. ইউজার তথ্য আপডেট ভ্যালিডেশন
export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    role: UserRoleSchema.optional(),
    isActive: z.boolean().optional(),
  }),
});

// ========================================
// হেল্পার ফাংশন (Zod Standards)
// ========================================

export function validateWithZod<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    // .errors এর বদলে .issues ব্যবহার করা হয়েছে
    const errorMessage = result.error.issues.map(e => e.message).join(', ');
    return { success: false, error: errorMessage };
  }
}

export type UserRole = z.infer<typeof UserRoleSchema>;