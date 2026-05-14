import { TransactionCategory } from '../../../generated/prisma/edge.js';
import { prisma } from '../../lib/prisma.js';
import { BudgetService } from '../budget/budget.service.js';
import { CategoryRuleService } from '../categoryRule/categoryRule.service.js';
import { NotificationService } from '../notification/notification.service.js';
export class TransactionService {
    // ========================================
    // 1. ট্রানজেকশন তৈরি (অটো ক্যাটাগরি সহ)
    // ========================================
    static async createTransaction(userId, data) {
        let category = data.category;
        let detectedRuleId = null;
        if (!category && data.description) {
            const detected = await CategoryRuleService.autoDetectCategory(data.description, userId);
            if (detected) {
                category = detected.category;
                detectedRuleId = detected.ruleId;
            }
        }
        if (!category)
            category = TransactionCategory.OTHER;
        const transaction = await prisma.transaction.create({
            data: {
                userId,
                type: data.type,
                category: category,
                amount: data.amount,
                description: data.description,
                date: data.date || new Date(),
                currency: data.currency || 'BDT',
                location: data.location,
                tags: data.tags || [],
                receiptUrl: data.receiptUrl,
                isRecurring: data.isRecurring || false,
            }
        });
        if (transaction.type === 'EXPENSE') {
            await BudgetService.updateBudgetSpent(userId, transaction.category, transaction.amount);
            await this.checkBudgetAlert(userId, transaction.category);
        }
        return { ...transaction, autoDetected: !!detectedRuleId };
    }
    // ========================================
    // 2. সব ট্রানজেকশন পাওয়া (Pagination & Filter)
    // ========================================
    static async getAllTransactions(userId, filters) {
        const { page = 1, limit = 10, type, category, startDate, endDate, minAmount, maxAmount, search } = filters;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {
            userId,
            ...(type && type !== 'all' && { type: type }),
            ...(category && category !== 'all' && { category: category }),
            ...(startDate && endDate && { date: { gte: new Date(startDate), lte: new Date(endDate) } }),
            ...(minAmount && { amount: { gte: Number(minAmount) } }),
            ...(maxAmount && { amount: { lte: Number(maxAmount) } }),
            ...(search && { description: { contains: search, mode: 'insensitive' } }),
        };
        const [data, total] = await Promise.all([
            prisma.transaction.findMany({ where, skip, take: Number(limit), orderBy: { date: 'desc' } }),
            prisma.transaction.count({ where })
        ]);
        return { meta: { page: Number(page), limit: Number(limit), total }, data };
    }
    // ========================================
    // 3. নির্দিষ্ট ট্রানজেকশন আইডি দিয়ে পাওয়া
    // ========================================
    static async getTransactionById(id, userId) {
        const transaction = await prisma.transaction.findFirst({ where: { id, userId } });
        if (!transaction)
            throw new Error('ট্রানজেকশন পাওয়া যায়নি');
        return transaction;
    }
    // ========================================
    // 4. ট্রানজেকশন আপডেট
    // ========================================
    static async updateTransaction(transactionId, userId, data) {
        const existing = await prisma.transaction.findFirst({ where: { id: transactionId, userId } });
        if (!existing)
            throw new Error('ট্রানজেকশন পাওয়া যায়নি');
        if (existing.type === 'EXPENSE' && data.amount !== undefined) {
            const amountDiff = Number(data.amount) - existing.amount;
            await BudgetService.updateBudgetSpent(userId, existing.category, amountDiff);
        }
        return await prisma.transaction.update({
            where: { id: transactionId },
            data
        });
    }
    // ========================================
    // 5. ট্রানজেকশন ডিলিট
    // ========================================
    static async deleteTransaction(id, userId) {
        const existing = await prisma.transaction.findFirst({ where: { id, userId } });
        if (!existing)
            throw new Error('ট্রানজেকশন পাওয়া যায়নি');
        if (existing.type === 'EXPENSE') {
            await BudgetService.updateBudgetSpent(userId, existing.category, -existing.amount);
        }
        return await prisma.transaction.delete({ where: { id } });
    }
    // ========================================
    // 6. ট্রানজেকশন সামারি (Dashboard)
    // ========================================
    static async getTransactionSummary(userId, period) {
        // এখানে আপনার পিরিয়ড অনুযায়ী ফিল্টার লজিক বসবে
        const summary = await prisma.transaction.groupBy({
            by: ['type'],
            where: { userId },
            _sum: { amount: true }
        });
        return summary;
    }
    // ========================================
    // 7. ক্যাটাগরি বিশ্লেষণ
    // ========================================
    static async getCategoryAnalysis(userId, startDate, endDate) {
        return await prisma.transaction.groupBy({
            by: ['category'],
            where: {
                userId,
                date: { gte: new Date(startDate), lte: new Date(endDate) }
            },
            _sum: { amount: true },
            _count: true
        });
    }
    // ========================================
    // 8. বাল্ক ইম্পোর্ট
    // ========================================
    static async bulkImportTransactions(userId, transactions) {
        const formattedData = transactions.map(t => ({
            ...t,
            userId,
            date: t.date ? new Date(t.date) : new Date()
        }));
        return await prisma.transaction.createMany({ data: formattedData });
    }
    // ========================================
    // 9. বাজেট এলার্ট চেক
    // ========================================
    static async checkBudgetAlert(userId, category) {
        const now = new Date();
        const currentBudget = await prisma.budget.findFirst({
            where: { userId, category, startDate: { lte: now }, endDate: { gte: now }, isActive: true }
        });
        if (currentBudget) {
            const spent = await prisma.transaction.aggregate({
                where: { userId, category, type: 'EXPENSE', date: { gte: currentBudget.startDate, lte: currentBudget.endDate } },
                _sum: { amount: true }
            });
            const totalSpent = spent._sum.amount || 0;
            const percentage = (totalSpent / currentBudget.amount) * 100;
            if (percentage >= currentBudget.alertThreshold) {
                await NotificationService.createBudgetAlert(userId, category, totalSpent, currentBudget.amount);
            }
        }
    }
}
export default TransactionService;
