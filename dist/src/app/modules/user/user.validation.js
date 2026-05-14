import { z } from 'zod';
// ========================================
// ফোন নম্বর ভ্যালিডেশন রেজেক্স
// ========================================
const phoneRegex = /^(\+88)?01[3-9]\d{8}$/;
// Enum-এর জন্য কনস্ট্যান্ট (as const অবশ্যই লাগবে)
const userRoles = ['USER', 'MANAGER', 'ADMIN'];
const filterRoles = ['USER', 'MANAGER', 'ADMIN', 'all'];
const statuses = ['active', 'inactive', 'all'];
// ========================================
// 1. প্রোফাইল আপডেট ভ্যালিডেশন (নিজের)
// ========================================
const updateProfileSchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে')
            .max(50, 'নাম সর্বোচ্চ ৫০ অক্ষরের হতে পারে')
            .optional()
            .transform(val => val?.trim()),
        phone: z
            .string()
            .regex(phoneRegex, 'সঠিক ফোন নম্বর দিন। উদাহরণ: 017XXXXXXXX বা +88017XXXXXXXX')
            .optional()
            .nullable()
            .transform(val => val?.trim()),
        address: z
            .string()
            .max(200, 'ঠিকানা সর্বোচ্চ ২০০ অক্ষরের হতে পারে')
            .optional()
            .nullable()
            .transform(val => val?.trim()),
        avatar: z
            .string()
            .url('সঠিক URL দিন')
            .optional()
            .nullable(),
    }),
});
// ========================================
// 2. ইউজার আপডেট ভ্যালিডেশন (অ্যাডমিনের জন্য)
// ========================================
const updateUserSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'ইউজার আইডি প্রয়োজন'),
    }),
    body: z.object({
        name: z
            .string()
            .min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে')
            .max(50, 'নাম সর্বোচ্চ ৫০ অক্ষরের হতে পারে')
            .optional()
            .transform(val => val?.trim()),
        phone: z
            .string()
            .regex(phoneRegex, 'সঠিক ফোন নম্বর দিন')
            .optional()
            .nullable()
            .transform(val => val?.trim()),
        address: z
            .string()
            .max(200, 'ঠিকানা সর্বোচ্চ ২০০ অক্ষরের হতে পারে')
            .optional()
            .nullable()
            .transform(val => val?.trim()),
        avatar: z
            .string()
            .url('সঠিক URL দিন')
            .optional()
            .nullable(),
        role: z.enum(userRoles, {
            message: 'রোল অবশ্যই USER, MANAGER বা ADMIN হতে হবে'
        }).optional(),
    }),
});
// ========================================
// 3. ইউজার রোল পরিবর্তন ভ্যালিডেশন
// ========================================
const changeRoleSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'ইউজার আইডি প্রয়োজন'),
    }),
    body: z.object({
        role: z.enum(userRoles, {
            message: 'রোল অবশ্যই USER, MANAGER বা ADMIN হতে হবে'
        }),
    }),
});
// ========================================
// 4. ইউজার আইডি প্যারাম ভ্যালিডেশন
// ========================================
const userIdParamSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'ইউজার আইডি প্রয়োজন'),
    }),
});
// ========================================
// 5. ইউজার লিস্ট ফিল্টার ভ্যালিডেশন
// ========================================
const userListSchema = z.object({
    query: z.object({
        page: z
            .string()
            .regex(/^\d+$/, 'পৃষ্ঠা নম্বর সঠিক নয়')
            .transform(Number)
            .pipe(z.number().min(1))
            .optional()
            .default(1),
        limit: z
            .string()
            .regex(/^\d+$/, 'লিমিট সঠিক নয়')
            .transform(Number)
            .pipe(z.number().min(1).max(100))
            .optional()
            .default(10),
        search: z
            .string()
            .max(50, 'সার্চ টার্ম সর্বোচ্চ ৫০ অক্ষরের হতে পারে')
            .optional()
            .transform(val => val?.trim()),
        role: z
            .enum(filterRoles, {
            message: 'রোল অবশ্যই USER, MANAGER, ADMIN বা all হতে হবে'
        })
            .default('all'),
        status: z
            .enum(statuses, {
            message: 'স্ট্যাটাস অবশ্যই active, inactive বা all হতে হবে'
        })
            .default('all'),
    }),
});
// ========================================
// 6. ইউজার সার্চ ভ্যালিডেশন
// ========================================
const searchUserSchema = z.object({
    query: z.object({
        q: z
            .string()
            .min(1, 'সার্চ টার্ম প্রয়োজন')
            .max(50, 'সার্চ টার্ম সর্বোচ্চ ৫০ অক্ষরের হতে পারে')
            .transform(val => val.trim()),
        limit: z
            .string()
            .regex(/^\d+$/, 'লিমিট সঠিক নয়')
            .transform(Number)
            .pipe(z.number().min(1).max(50))
            .optional()
            .default(10),
    }),
});
// ========================================
// 7. একাধিক ইউজার আইডি ভ্যালিডেশন
// ========================================
const userIdsSchema = z.object({
    body: z.object({
        ids: z
            .array(z.string().min(1, 'ইউজার আইডি প্রয়োজন'))
            .min(1, 'কমপক্ষে একটি ইউজার আইডি প্রয়োজন')
            .max(100, 'সর্বোচ্চ ১০০টি ইউজার আইডি দেওয়া যাবে'),
    }),
});
// ========================================
// 8. নিজের পাসওয়ার্ড পরিবর্তন ভ্যালিডেশন
// ========================================
const changeMyPasswordSchema = z.object({
    body: z.object({
        currentPassword: z
            .string()
            .min(1, 'বর্তমান পাসওয়ার্ড প্রয়োজন'),
        newPassword: z
            .string()
            .min(6, 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে')
            .max(50, 'নতুন পাসওয়ার্ড সর্বোচ্চ ৫০ অক্ষরের হতে পারে'),
        confirmPassword: z
            .string()
            .min(1, 'কনফার্ম পাসওয়ার্ড প্রয়োজন'),
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: "পাসওয়ার্ড মিলছে না",
        path: ['confirmPassword'],
    }),
});
// ========================================
// ৯. UserValidation অবজেক্ট এক্সপোর্ট (এটি মিসিং ছিল)
// ========================================
export const UserValidation = {
    updateProfileSchema,
    updateUserSchema,
    changeRoleSchema,
    userIdParamSchema,
    userListSchema,
    searchUserSchema,
    userIdsSchema,
    changeMyPasswordSchema,
};
