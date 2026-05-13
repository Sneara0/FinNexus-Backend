import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { UserService } from './user.service.js';
import { sendResponse } from '../../utils/sendResponse.js';

// ========================================
// 1. সব ইউজার পাওয়া (অ্যাডমিন)
// ========================================
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search as string;
  const role = req.query.role as string;
  const status = req.query.status as string;
  
  const result = await UserService.getAllUsers(page, limit, search, role, status);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'ইউজার লিস্ট পাওয়া গেছে',
    data: result.users,
    meta: result.pagination,
  });
});

// ========================================
// 2. নির্দিষ্ট ইউজার পাওয়া (অ্যাডমিন)
// ========================================
const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await UserService.getUserById(id as string);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'ইউজার পাওয়া গেছে',
    data: user,
  });
});

// ========================================
// 3. নিজের প্রোফাইল পাওয়া
// ========================================
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const user = await UserService.getMyProfile(userId);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'প্রোফাইল পাওয়া গেছে',
    data: user,
  });
});

// ========================================
// 4. নিজের প্রোফাইল আপডেট
// ========================================
const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { name, phone, address, avatar } = req.body;
  
  const user = await UserService.updateMyProfile(userId, { name, phone, address, avatar });
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'প্রোফাইল আপডেট করা হয়েছে',
    data: user,
  });
});

// ========================================
// 5. ইউজার আপডেট (অ্যাডমিন)
// ========================================
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, phone, address, avatar, role } = req.body;
  
  const user = await UserService.updateUser(id as string, { name, phone, address, avatar, role });
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'ইউজার আপডেট করা হয়েছে',
    data: user,
  });
});

// ========================================
// 6. ইউজার নিষ্ক্রিয় করা (অ্যাডমিন)
// ========================================
const deactivateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await UserService.deactivateUser(id as string);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'ইউজার নিষ্ক্রিয় করা হয়েছে',
    data: user,
  });
});

// ========================================
// 7. ইউজার সক্রিয় করা (অ্যাডমিন)
// ========================================
const activateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await UserService.activateUser(id as string);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'ইউজার সক্রিয় করা হয়েছে',
    data: user,
  });
});

// ========================================
// 8. ইউজার রোল পরিবর্তন (অ্যাডমিন)
// ========================================
const changeUserRole = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  
  const user = await UserService.changeUserRole(id as string, role);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `ইউজারের রোল ${role} এ পরিবর্তন করা হয়েছে`,
    data: user,
  });
});

// ========================================
// 9. ইউজার ডিলিট (অ্যাডমিন)
// ========================================
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await UserService.deleteUser(id as string);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'ইউজার ডিলিট করা হয়েছে',
    data: null,
  });
});

// ========================================
// 10. ইউজার স্ট্যাটিস্টিক্স (অ্যাডমিন)
// ========================================
const getUserStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await UserService.getUserStats();
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'ইউজার স্ট্যাটিস্টিক্স পাওয়া গেছে',
    data: stats,
  });
});

// ========================================
// 11. ইউজার সার্চ (অ্যাডমিন)
// ========================================
const searchUsers = catchAsync(async (req: Request, res: Response) => {
  const q = req.query.q as string;
  const limit = Number(req.query.limit) || 10;
  
  if (!q) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: 'সার্চ টার্ম প্রয়োজন',
    });
  }
  
  const users = await UserService.searchUsers(q, limit);
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'সার্চ রেজাল্ট পাওয়া গেছে',
    data: users,
  });
});

// অবজেক্ট আকারে সব কন্ট্রোলার এক্সপোর্ট করা হলো
export const UserController = {
  getAllUsers,
  getUserById,
  getMyProfile,
  updateMyProfile,
  updateUser,
  deactivateUser,
  activateUser,
  changeUserRole,
  deleteUser,
  getUserStats,
  searchUsers,
};