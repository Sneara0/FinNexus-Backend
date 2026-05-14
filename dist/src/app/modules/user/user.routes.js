import { Router } from 'express';
// ১. মিডলওয়্যার ইম্পোর্ট ফিক্স (ভুল পাথ ছিল)
// ২. ভ্যালিডেশন ইম্পোর্ট ফিক্স (পাথ ঠিক করা হয়েছে)
// ৩. কন্ট্রোলার ইম্পোর্ট ফিক্স (এক্সটেনশন .js এবং অবজেক্ট ইম্পোর্ট)
import { UserController } from './user.controller.js';
import { UserValidation } from './user.validation.js';
import { validateRequest } from '../../../middlewares/validation.middleware.js';
const router = Router();
// প্রোফাইল রুট
router.get('/me', UserController.getMyProfile);
router.patch('/update-profile', validateRequest(UserValidation.updateProfileSchema), UserController.updateMyProfile);
// অ্যাডমিন রুট - সব ইউজার দেখা
router.get('/', UserController.getAllUsers);
// ইউজার রোল পরিবর্তন
router.patch('/change-role/:id', validateRequest(UserValidation.changeRoleSchema), UserController.changeUserRole);
export const UserRoutes = router;
