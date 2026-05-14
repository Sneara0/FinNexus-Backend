import { catchAsync } from '../../utils/catchAsync.js';
import { GoalService } from './goal.service.js';
import { sendResponse } from '../../utils/sendResponse.js'; // ✅ sendSuccess এর বদলে এটি ব্যবহার করুন
// ========================================
// 1. গোল তৈরি
// ========================================
const createGoal = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const { name, targetAmount, deadline, note } = req.body;
    const goal = await GoalService.createGoal(userId, {
        name,
        targetAmount,
        deadline: new Date(deadline),
        note
    });
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'গোল তৈরি করা হয়েছে',
        data: goal,
    });
});
// ========================================
// 2. সব গোল পাওয়া
// ========================================
const getAllGoals = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    // টাইপ সেফটির জন্য explicit কাস্টিং (string | string[] এরর দূর করতে)
    const status = req.query.status;
    const sortBy = req.query.sortBy;
    const result = await GoalService.getAllGoals(userId, page, limit, status, sortBy);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'গোল লিস্ট পাওয়া গেছে',
        meta: result.pagination,
        data: result.goals,
    });
});
// ========================================
// 3. নির্দিষ্ট গোল পাওয়া
// ========================================
const getGoalById = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const { id } = req.params;
    const goal = await GoalService.getGoalById(id, userId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'গোল পাওয়া গেছে',
        data: goal,
    });
});
// ========================================
// 4. গোলে টাকা যোগ করা
// ========================================
const addToGoal = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const { id } = req.params;
    const { amount } = req.body;
    const goal = await GoalService.addToGoal(id, userId, Number(amount));
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `${amount} টাকা গোলে যোগ করা হয়েছে`,
        data: goal,
    });
});
// ========================================
// 5. গোল থেকে টাকা কমানো
// ========================================
const removeFromGoal = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const { id } = req.params;
    const { amount } = req.body;
    const goal = await GoalService.removeFromGoal(id, userId, Number(amount));
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: `${amount} টাকা গোল থেকে কমানো হয়েছে`,
        data: goal,
    });
});
// ========================================
// 6. গোল সম্পন্ন মার্ক করা
// ========================================
const completeGoal = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const { id } = req.params;
    const goal = await GoalService.completeGoal(id, userId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'গোল সম্পন্ন হিসাবে চিহ্নিত করা হয়েছে',
        data: goal,
    });
});
// ========================================
// 7. গোল আপডেট
// ========================================
const updateGoal = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const { id } = req.params;
    const { name, targetAmount, deadline, note } = req.body;
    const goal = await GoalService.updateGoal(id, userId, {
        name,
        targetAmount,
        deadline: deadline ? new Date(deadline) : undefined,
        note
    });
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'গোল আপডেট করা হয়েছে',
        data: goal,
    });
});
// ========================================
// 8. গোল ডিলিট
// ========================================
const deleteGoal = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const { id } = req.params;
    await GoalService.deleteGoal(id, userId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'গোল ডিলিট করা হয়েছে',
        data: null,
    });
});
// ========================================
// 9. গোল ড্যাশবোর্ড
// ========================================
const getGoalDashboard = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const dashboard = await GoalService.getGoalDashboard(userId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'গোল ড্যাশবোর্ড পাওয়া গেছে',
        data: dashboard,
    });
});
// ✅ সব কন্ট্রোলারকে অবজেক্ট হিসেবে এক্সপোর্ট করুন (রাউটের জন্য)
export const GoalController = {
    createGoal,
    getAllGoals,
    getGoalById,
    addToGoal,
    removeFromGoal,
    completeGoal,
    updateGoal,
    deleteGoal,
    getGoalDashboard
};
