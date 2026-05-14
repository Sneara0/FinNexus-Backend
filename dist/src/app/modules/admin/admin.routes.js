import { Router } from 'express';
// মিডলওয়্যার ইমপোর্ট
import { authenticate, authorize } from '../../../middlewares/index.js';
import { validateRequest } from '../../../middlewares/validation.middleware.js';
// কন্ট্রোলার ফাংশন ইমপোর্ট
import { getDashboardStats, getSystemHealth, getAllUsers, getUserById, updateUser, deleteUser, changeUserRole, toggleUserStatus } from './admin.controller.js';
// ভ্যালিডেশন স্কিমা ইমপোর্ট (এখানেই আপনার সমস্যা ছিল)
import { userListSchema, userIdParamSchema, updateUserSchema, changeRoleSchema } from './admin.validation.js';
const router = Router();
// সব রাউটের জন্য অথেন্টিকেশন এবং অ্যাডমিন রোল প্রয়োজন
router.use(authenticate);
router.use(authorize('ADMIN'));
// ড্যাশবোর্ড এবং হেলথ
router.get('/dashboard/stats', getDashboardStats);
router.get('/health', getSystemHealth);
// ইউজার ম্যানেজমেন্ট রাউটস
router.get('/users', validateRequest(userListSchema), getAllUsers);
router.get('/users/:id', validateRequest(userIdParamSchema), getUserById);
router.put('/users/:id', validateRequest(updateUserSchema), updateUser);
router.delete('/users/:id', validateRequest(userIdParamSchema), deleteUser);
router.patch('/users/:id/role', validateRequest(changeRoleSchema), changeUserRole);
router.patch('/users/:id/toggle-status', validateRequest(userIdParamSchema), toggleUserStatus);
export const AdminRoutes = router;
