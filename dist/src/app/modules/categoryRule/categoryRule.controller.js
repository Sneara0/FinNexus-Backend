import { CategoryRuleService } from './categoryRule.service.js';
import { catchAsync } from '../../utils/catchAsync.js';
// ✅ sendError ইম্পোর্ট করা হয়েছে যা আগে মিসিং ছিল
import { sendPaginated, sendSuccess, sendError } from '../../utils/sendResponse.js';
// ========================================
// 1. রুল তৈরি
// ========================================
export const createRule = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const { keyword, category, type, priority } = req.body;
    const rule = await CategoryRuleService.createRule(userId, {
        keyword,
        category,
        type,
        priority
    });
    sendSuccess(res, rule, 'ক্যাটাগরি রুল তৈরি করা হয়েছে', 201);
});
// ========================================
// 2. সব রুল পাওয়া
// ========================================
export const getAllRules = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
    const result = await CategoryRuleService.getAllRules(userId, page, limit, isActive);
    sendPaginated(res, result.rules, result.pagination, 'রুল লিস্ট পাওয়া গেছে');
});
// ========================================
// ৩ - ৫: (getRuleById, updateRule, deleteRule)
// ========================================
export const getRuleById = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const { id } = req.params;
    const rule = await CategoryRuleService.getRuleById(id, userId);
    sendSuccess(res, rule, 'রুল পাওয়া গেছে');
});
export const updateRule = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const { id } = req.params;
    const { keyword, category, type, priority, isActive } = req.body;
    const rule = await CategoryRuleService.updateRule(id, userId, {
        keyword,
        category,
        type,
        priority,
        isActive
    });
    sendSuccess(res, rule, 'রুল আপডেট করা হয়েছে');
});
export const deleteRule = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const { id } = req.params;
    await CategoryRuleService.deleteRule(id, userId);
    sendSuccess(res, null, 'রুল ডিলিট করা হয়েছে');
});
// ========================================
// 6. অটো ডিটেক্ট ক্যাটাগরি
// ========================================
export const autoDetectCategory = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const { description } = req.body;
    if (!description) {
        return sendError(res, 'বিবরণ প্রয়োজন', 400);
    }
    const result = await CategoryRuleService.autoDetectCategory(description, userId);
    sendSuccess(res, result, 'ক্যাটাগরি ডিটেক্ট করা হয়েছে');
});
// ========================================
// 7. বাল্ক ডিলিট
// ========================================
export const bulkDeleteRules = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const { ruleIds } = req.body;
    if (!ruleIds || !ruleIds.length) {
        return sendError(res, 'কমপক্ষে একটি রুল আইডি প্রয়োজন', 400);
    }
    const count = await CategoryRuleService.bulkDeleteRules(ruleIds, userId);
    sendSuccess(res, { deletedCount: count }, `${count}টি রুল ডিলিট করা হয়েছে`);
});
// ========================================
// 8. রুল স্ট্যাটাস টগল
// ========================================
export const toggleRuleStatus = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const { id } = req.params;
    const rule = await CategoryRuleService.toggleRuleStatus(id, userId);
    sendSuccess(res, rule, `রুল ${rule?.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে`);
});
// ========================================
// 9. রুল স্ট্যাটিস্টিক্স
// ========================================
export const getRuleStats = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const stats = await CategoryRuleService.getRuleStats(userId);
    sendSuccess(res, stats, 'রুল স্ট্যাটিস্টিক্স পাওয়া গেছে');
});
// ========================================
// 10. সাজেস্টেড রুল
// ========================================
export const getSuggestedRules = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const suggestions = await CategoryRuleService.getSuggestedRules(userId);
    sendSuccess(res, suggestions, 'সাজেস্টেড রুল পাওয়া গেছে');
});
