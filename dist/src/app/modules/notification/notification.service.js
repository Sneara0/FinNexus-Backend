import { prisma } from '../../lib/prisma.js';
export class NotificationService {
    /**
     * ১. নোটিফিকেশন তৈরি
     */
    static async createNotification(userId, data) {
        return await prisma.notification.create({
            data: {
                userId,
                title: data.title,
                message: data.message,
                type: data.type,
                link: data.link || null,
                metadata: data.metadata || {},
                isRead: false
            }
        });
    }
    /**
     * ২. সব নোটিফিকেশন পাওয়া (প্যাজিনেশনসহ)
     */
    static async getUserNotifications(userId, query) {
        const { page = 1, limit = 10, type, isRead } = query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {
            userId,
            ...(type && { type }),
            ...(isRead !== undefined && { isRead })
        };
        const [notifications, total, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma.notification.count({ where }),
            prisma.notification.count({ where: { userId, isRead: false } })
        ]);
        return {
            notifications,
            unreadCount,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }
        };
    }
    /**
     * ৩. ভেরিফিকেশন হেল্পার
     */
    static async getVerifiedNotification(id, userId) {
        const notification = await prisma.notification.findFirst({ where: { id, userId } });
        if (!notification)
            throw new Error('Notification not found or access denied');
        return notification;
    }
    static async markAsRead(id, userId) {
        await this.getVerifiedNotification(id, userId);
        return await prisma.notification.update({
            where: { id },
            data: { isRead: true, readAt: new Date() }
        });
    }
    static async markAllAsRead(userId) {
        return await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true, readAt: new Date() }
        });
    }
    /**
     * ৪. ট্রানজেকশন সার্ভিস থেকে কল করা মেথড (FIXED NAME)
     */
    static async createBudgetAlert(userId, category, spent, limit) {
        const percent = Math.round((spent / limit) * 100);
        return await this.createNotification(userId, {
            title: percent >= 100 ? '⚠️ Budget Exceeded!' : '⚡ Budget Warning',
            message: `${category} ক্যাটাগরিতে আপনার বাজেটের ${percent}% খরচ হয়েছে। (খরচ: ${spent} BDT)`,
            type: 'BUDGET_ALERT',
            metadata: { category, spent, limit, percent }
        });
    }
    // আগের নামটিও রেখে দিচ্ছি যদি অন্য কোথাও ব্যবহার করে থাকেন
    static async sendBudgetAlert(userId, details) {
        return this.createBudgetAlert(userId, details.category, details.spent, details.budget);
    }
    static async sendGoalMilestone(userId, goalName) {
        return this.createNotification(userId, {
            title: '🎉 Goal Achieved!',
            message: `অভিনন্দন! আপনি আপনার "${goalName}" গোলটি পূর্ণ করেছেন।`,
            type: 'GOAL_ACHIEVED'
        });
    }
    /**
     * ৫. ডিলিট অপারেশনস
     */
    static async deleteNotification(id, userId) {
        await this.getVerifiedNotification(id, userId);
        return await prisma.notification.delete({ where: { id } });
    }
    static async deleteAllNotifications(userId) {
        const result = await prisma.notification.deleteMany({
            where: { userId }
        });
        return result.count;
    }
    static async deleteReadNotifications(userId) {
        const result = await prisma.notification.deleteMany({
            where: { userId, isRead: true }
        });
        return result.count;
    }
}
export default NotificationService;
