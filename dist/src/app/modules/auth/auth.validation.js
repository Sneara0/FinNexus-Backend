import { z } from 'zod';
// রেজিস্ট্রেশন ভ্যালিডেশন
const registerSchema = z.object({
    body: z.object({
        // .min(1, "...") ব্যবহার করলে required_error এর ঝামেলা থাকে না
        name: z.string().min(1, "নাম প্রদান করা আবশ্যক"),
        email: z
            .string()
            .min(1, "ইমেইল প্রয়োজন")
            .email("সঠিক ইমেইল ঠিকানা দিন"),
        password: z
            .string()
            .min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"),
    }),
});
// লগইন ভ্যালিডেশন
const loginSchema = z.object({
    body: z.object({
        email: z
            .string()
            .min(1, "ইমেইল প্রয়োজন")
            .email("সঠিক ইমেইল দিন"),
        password: z
            .string()
            .min(1, "পাসওয়ার্ড প্রয়োজন"),
    }),
});
// পাসওয়ার্ড পরিবর্তন ভ্যালিডেশন
const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string().min(1, "বর্তমান পাসওয়ার্ড প্রয়োজন"),
        newPassword: z.string().min(6, "নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"),
    }),
});
export const AuthValidation = {
    registerSchema,
    loginSchema,
    changePasswordSchema,
};
