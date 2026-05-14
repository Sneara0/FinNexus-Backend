// ✅ সঠিক সার্ভিস ফাইল ইম্পোর্ট করুন
import { sendSuccess } from '../../utils/sendResponse.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { NotificationService } from './notification.service.js';
// যদি আপনার কাছে আলাদা sendPaginated ফাংশন না থাকে, তবে এটি ব্যবহার করতে পারেন
const sendPaginated = (res, data, meta, message) => {
    res.status(200).json({
        success: true,
        message,
        meta,
        data,
    });
};
// ========================================
// 1. সব নোটিফিকেশন পাওয়া
// ========================================
export const getAllNotifications = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const isRead = req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined;
    const type = req.query.type;
    // সার্ভিসের getUserNotifications মেথডটি ব্যবহার করা হয়েছে
    const result = await NotificationService.getUserNotifications(userId, { page, limit, isRead, type });
    sendPaginated(res, result.notifications, result.meta, 'নোটিফিকেশন পাওয়া গেছে');
});
// ========================================
// 2. নির্দিষ্ট নোটিফিকেশন পাওয়া
// ========================================
export const getNotificationById = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const { id } = req.params;
    // সার্ভিসে getNotificationById মেথডটি নিশ্চিত করুন
    const notification = await NotificationService.markAsRead(id, userId);
    sendSuccess(res, notification, 'নোটিফিকেশন পাওয়া গেছে');
});
// ========================================
// 3. নোটিফিকেশন রিড মার্ক করা
// ========================================
export const markAsRead = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const { id } = req.params;
    const notification = await NotificationService.markAsRead(id, userId);
    sendSuccess(res, notification, 'নোটিফিকেশন রিড মার্ক করা হয়েছে');
});
// ========================================
// 4. সব নোটিফিকেশন রিড মার্ক করা
// ========================================
export const markAllAsRead = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const result = await NotificationService.markAllAsRead(userId);
    sendSuccess(res, { count: result.count }, 'সব নোটিফিকেশন রিড মার্ক করা হয়েছে');
});
// ========================================
// 5. নোটিফিকেশন ডিলিট
// ========================================
export const deleteNotification = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const { id } = req.params;
    await NotificationService.deleteNotification(id, userId);
    sendSuccess(res, null, 'নোটিফিকেশন ডিলিট করা হয়েছে');
});
// ========================================
// 6. সব নোটিফিকেশন ডিলিট
// ========================================
export const deleteAllNotifications = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const count = await NotificationService.deleteAllNotifications(userId);
    sendSuccess(res, { count }, 'সব নোটিফিকেশন ডিলিট করা হয়েছে');
});
// ========================================
// 7. আনরিড কাউন্ট
// ========================================
export const getUnreadCount = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    // মেটাডাটা থেকে আনরিড কাউন্ট নেওয়া হচ্ছে
    const result = await NotificationService.getUserNotifications(userId, { page: 1, limit: 1 });
    sendSuccess(res, { unreadCount: result.unreadCount }, 'আনরিড কাউন্ট পাওয়া গেছে');
});
