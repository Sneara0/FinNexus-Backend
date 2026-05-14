import { prisma } from '../../lib/prisma.js'; // ✅ এটি আপনার গ্লোবাল ইনস্ট্যান্স
import NotificationService from '../notification/notification.service.js';
// ❌ const prisma = new prisma(); <-- এই লাইনটি ভুল ছিল এবং এর প্রয়োজন নেই।
export class SubscriptionService {
    // ========================================
    // 1. সাবস্ক্রিপশন তৈরি
    // ========================================
    static async createSubscription(userId, data) {
        // নেক্সট বিলিং তারিখ ক্যালকুলেট করুন
        const nextBilling = this.calculateNextBilling(data.startDate, data.billingCycle);
        const subscription = await prisma.subscription.create({
            data: {
                userId,
                name: data.name,
                amount: data.amount,
                currency: data.currency || 'BDT',
                billingCycle: data.billingCycle,
                startDate: data.startDate,
                nextBilling,
                category: data.category || 'ENTERTAINMENT',
                isActive: true
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        return subscription;
    }
    // ========================================
    // 2. সব সাবস্ক্রিপশন পাওয়া
    // ========================================
    static async getAllSubscriptions(userId, page = 1, limit = 10, isActive, category) {
        const skip = (page - 1) * limit;
        const where = { userId };
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        if (category && category !== 'all') {
            where.category = category;
        }
        const [subscriptions, total] = await Promise.all([
            prisma.subscription.findMany({
                where,
                skip,
                take: limit,
                orderBy: { nextBilling: 'asc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            }),
            prisma.subscription.count({ where })
        ]);
        // মোট মাসিক খরচ ক্যালকুলেট
        const monthlyTotal = subscriptions.reduce((sum, sub) => {
            let monthlyAmount = sub.amount;
            if (sub.billingCycle === 'yearly') {
                monthlyAmount = sub.amount / 12;
            }
            else if (sub.billingCycle === 'weekly') {
                monthlyAmount = sub.amount * 4;
            }
            return sum + monthlyAmount;
        }, 0);
        return {
            subscriptions,
            monthlyTotal,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    // ========================================
    // 3. নির্দিষ্ট সাবস্ক্রিপশন পাওয়া
    // ========================================
    static async getSubscriptionById(subscriptionId, userId) {
        const subscription = await prisma.subscription.findFirst({
            where: { id: subscriptionId, userId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        if (!subscription) {
            throw new Error('সাবস্ক্রিপশন পাওয়া যায়নি');
        }
        return subscription;
    }
    // ========================================
    // 4. সাবস্ক্রিপশন আপডেট
    // ========================================
    static async updateSubscription(subscriptionId, userId, data) {
        const existingSubscription = await prisma.subscription.findFirst({
            where: { id: subscriptionId, userId }
        });
        if (!existingSubscription) {
            throw new Error('সাবস্ক্রিপশন পাওয়া যায়নি');
        }
        let nextBilling = existingSubscription.nextBilling;
        if (data.billingCycle && data.billingCycle !== existingSubscription.billingCycle) {
            nextBilling = this.calculateNextBilling(new Date(), data.billingCycle);
        }
        const subscription = await prisma.subscription.update({
            where: { id: subscriptionId },
            data: {
                ...data,
                nextBilling
            }
        });
        return subscription;
    }
    // ========================================
    // 5. সাবস্ক্রিপশন বাতিল করা (সফট ডিলিট)
    // ========================================
    static async cancelSubscription(subscriptionId, userId) {
        const existingSubscription = await prisma.subscription.findFirst({
            where: { id: subscriptionId, userId }
        });
        if (!existingSubscription) {
            throw new Error('সাবস্ক্রিপশন পাওয়া যায়নি');
        }
        return await prisma.subscription.update({
            where: { id: subscriptionId },
            data: {
                isActive: false,
                cancelAt: new Date()
            }
        });
    }
    // ========================================
    // 6. পুনরায় সক্রিয় করা
    // ========================================
    static async reactivateSubscription(subscriptionId, userId) {
        const existingSubscription = await prisma.subscription.findFirst({
            where: { id: subscriptionId, userId }
        });
        if (!existingSubscription) {
            throw new Error('সাবস্ক্রিপশন পাওয়া যায়নি');
        }
        return await prisma.subscription.update({
            where: { id: subscriptionId },
            data: {
                isActive: true,
                cancelAt: null
            }
        });
    }
    // ========================================
    // 7. হার্ড ডিলিট
    // ========================================
    static async deleteSubscription(subscriptionId, userId) {
        const existingSubscription = await prisma.subscription.findFirst({
            where: { id: subscriptionId, userId }
        });
        if (!existingSubscription) {
            throw new Error('সাবস্ক্রিপশন পাওয়া যায়নি');
        }
        await prisma.subscription.delete({ where: { id: subscriptionId } });
        return true;
    }
    // ========================================
    // 8. নেক্সট বিলিং তারিখ ক্যালকুলেট
    // ========================================
    static calculateNextBilling(startDate, billingCycle) {
        const nextDate = new Date(startDate);
        switch (billingCycle.toLowerCase()) {
            case 'daily':
                nextDate.setDate(nextDate.getDate() + 1);
                break;
            case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
            case 'yearly':
                nextDate.setFullYear(nextDate.getFullYear() + 1);
                break;
            default:
                nextDate.setMonth(nextDate.getMonth() + 1);
        }
        return nextDate;
    }
    static async sendReminders() {
        const now = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(now.getDate() + 3);
        // আগামী ৩ দিনের মধ্যে রিনিউ হবে এমন সাবস্ক্রিপশনগুলো খুঁজুন
        const upcomingSubscriptions = await prisma.subscription.findMany({
            where: {
                isActive: true,
                nextBilling: {
                    gte: now,
                    lte: threeDaysFromNow,
                },
            },
        });
        for (const subscription of upcomingSubscriptions) {
            await NotificationService.createNotification(subscription.userId, {
                title: 'সাবস্ক্রিপশন রিমাইন্ডার 🔔',
                message: `${subscription.name} এর বিল ${subscription.nextBilling.toLocaleDateString()} তারিখে দিতে হবে। পরিমাণ: ${subscription.amount} ${subscription.currency}`,
                type: 'PAYMENT_REMINDER',
                metadata: {
                    subscriptionId: subscription.id,
                    name: subscription.name,
                    amount: subscription.amount,
                    dueDate: subscription.nextBilling,
                },
            });
        }
        return upcomingSubscriptions.length;
    }
    // ========================================
    // 9. সাবস্ক্রিপশন রিনিউয়াল প্রসেস (Cron Job এর জন্য)
    // ========================================
    static async processRenewals() {
        const now = new Date();
        const dueSubscriptions = await prisma.subscription.findMany({
            where: {
                isActive: true,
                nextBilling: { lte: now }
            }
        });
        const results = { processed: 0, failed: 0 };
        for (const subscription of dueSubscriptions) {
            try {
                const nextBilling = this.calculateNextBilling(subscription.nextBilling, subscription.billingCycle);
                await prisma.subscription.update({
                    where: { id: subscription.id },
                    data: { nextBilling }
                });
                await NotificationService.createNotification(subscription.userId, {
                    title: 'সাবস্ক্রিপশন রিনিউয়াল',
                    message: `${subscription.name} এর জন্য ${subscription.amount} ${subscription.currency} বিল করা হয়েছে।`,
                    type: 'SUBSCRIPTION_RENEWAL',
                    metadata: {
                        subscriptionId: subscription.id,
                        name: subscription.name,
                        amount: subscription.amount
                    }
                });
                results.processed++;
            }
            catch (error) {
                results.failed++;
                console.error(`Failed to process subscription ${subscription.id}:`, error);
            }
        }
        return results;
    }
    // ========================================
    // 10. ড্যাশবোর্ড সামারি
    // ========================================
    static async getSubscriptionSummary(userId) {
        const subscriptions = await prisma.subscription.findMany({
            where: { userId, isActive: true }
        });
        const now = new Date();
        const monthlyTotal = subscriptions.reduce((sum, sub) => {
            let amount = sub.amount;
            if (sub.billingCycle === 'yearly')
                amount = sub.amount / 12;
            else if (sub.billingCycle === 'weekly')
                amount = sub.amount * 4.34; // Average weeks in month
            return sum + amount;
        }, 0);
        return {
            totalActive: subscriptions.length,
            monthlyTotal,
            yearlyTotal: monthlyTotal * 12,
            upcomingRenewals: subscriptions
                .filter(s => s.nextBilling > now)
                .sort((a, b) => a.nextBilling.getTime() - b.nextBilling.getTime())
                .slice(0, 5)
        };
    }
}
export default SubscriptionService;
