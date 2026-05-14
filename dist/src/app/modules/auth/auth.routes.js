import { Router } from 'express';
import { register, login, demoLogin, getProfile, updateProfile, changePassword, getDemoCredentials } from './auth.controller.js';
import { authenticate } from '../../../middlewares/auth.middleware.js';
import { validateRequest } from '../../../middlewares/validation.middleware.js'; // পাথ ঠিক আছে কি না দেখে নিন
import { AuthValidation } from './auth.validation.js';
const router = Router();
// ========================================
// পাবলিক রাউট (লগইন ছাড়া অ্যাক্সেস)
// ========================================
// ভ্যালিডেশন সহ রেজিস্ট্রেশন
router.post('/register', validateRequest(AuthValidation.registerSchema), register);
// ভ্যালিডেশন সহ লগইন
router.post('/login', validateRequest(AuthValidation.loginSchema), login);
router.post('/demo-login', demoLogin);
router.get('/demo-credentials', getDemoCredentials);
// ========================================
// প্রাইভেট রাউট (লগইন প্রয়োজন)
// ========================================
router.use(authenticate);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
// ভ্যালিডেশন সহ পাসওয়ার্ড পরিবর্তন
router.post('/change-password', validateRequest(AuthValidation.changePasswordSchema), changePassword);
export const AuthRoutes = router;
