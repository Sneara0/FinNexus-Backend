
import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import AdminService from './admin.service.js';
import { sendPaginated, sendSuccess } from '../../utils/sendResponse.js';


// ========================================
// 1. ড্যাশবোর্ড স্ট্যাটিস্টিক্স
// ========================================
export const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await AdminService.getDashboardStats();
  sendSuccess(res, stats, 'ড্যাশবোর্ড স্ট্যাটিস্টিক্স পাওয়া গেছে');
});

// ========================================
// 2. সব ইউজার পাওয়া
// ========================================
export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search as string || '';
  const role = req.query.role as string || 'all';
  const status = req.query.status as string || 'all';
  
  const result = await AdminService.getAllUsers(page, limit, search, role, status);
  
  sendPaginated(res, result.users, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages
  }, 'ইউজার লিস্ট পাওয়া গেছে');
});

// ========================================
// 3. নির্দিষ্ট ইউজার পাওয়া
// ========================================
export const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await AdminService.getUserById(id as string);
  sendSuccess(res, { user }, 'ইউজার পাওয়া গেছে');
});

// ========================================
// 4. ইউজার আপডেট
// ========================================
export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, phone, address, role, isActive } = req.body;
  
  const user = await AdminService.updateUser(id as string, { name, phone, address, role, isActive });
  sendSuccess(res, { user }, 'ইউজার আপডেট করা হয়েছে');
});

// ========================================
// 5. ইউজার ডিলিট
// ========================================
export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await AdminService.deleteUser(id as string);
  sendSuccess(res, null, 'ইউজার ডিলিট করা হয়েছে');
});

// ========================================
// 6. ইউজার রোল পরিবর্তন
// ========================================
export const changeUserRole = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  
  const user = await AdminService.changeUserRole(id as string, role);
  sendSuccess(res, { user }, `ইউজারের রোল ${role} এ পরিবর্তন করা হয়েছে`);
});

// ========================================
// 7. ইউজার স্ট্যাটাস টগল
// ========================================
export const toggleUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await AdminService.toggleUserStatus(id as string);
  const message = user.isActive ? 'ইউজার সক্রিয় করা হয়েছে' : 'ইউজার নিষ্ক্রিয় করা হয়েছে';
  sendSuccess(res, { user }, message);
});

// ========================================
// 8. সিস্টেম হেলথ চেক
// ========================================
export const getSystemHealth = catchAsync(async (req: Request, res: Response) => {
  const health = await AdminService.getSystemHealth();
  sendSuccess(res, health, 'সিস্টেম হেলথ চেক');
});
