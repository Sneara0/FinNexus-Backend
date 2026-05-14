import { startOfMonth, endOfMonth } from 'date-fns';
import { prisma } from '../../lib/prisma.js';
export class BudgetService {
    // ========================================
    // ১. বাজেট তৈরি
    // ========================================
    static async createBudget(userId, data) {
        const existingBudget = await prisma.budget.findFirst({
            where: {
                userId,
                category: data.category,
                period: data.period,
                startDate: data.startDate,
                isActive: true
            }
        });
        if (existingBudget) {
            throw new Error('এই ক্যাটাগরিতে ইতিমধ্যে বাজেট রয়েছে');
        }
        return await prisma.budget.create({
            data: {
                ...data,
                userId,
                alertThreshold: data.alertThreshold || 80,
                isActive: true
            }
        });
    }
    // ========================================
    // ২. সব বাজেট পাওয়া (৬টি আর্গুমেন্ট সাপোর্ট করবে)
    // ========================================
    static async getAllBudgets(userId, page = 1, limit = 10, period, category, isActive) {
        const skip = (page - 1) * limit;
        const where = { userId };
        if (period && period !== 'all')
            where.period = period;
        if (category && category !== 'all')
            where.category = category;
        if (isActive !== undefined)
            where.isActive = isActive;
        const [budgets, total] = await Promise.all([
            prisma.budget.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, name: true, email: true } }
                }
            }),
            prisma.budget.count({ where })
        ]);
        const budgetsWithStats = budgets.map(budget => {
            const spent = Number(budget.spent || 0);
            const amount = Number(budget.amount);
            return {
                ...budget,
                spentPercentage: amount > 0 ? (spent / amount) * 100 : 0,
                remaining: amount - spent,
                isOverBudget: spent > amount,
                isAlert: amount > 0 ? (spent / amount) * 100 >= (budget.alertThreshold || 80) : false
            };
        });
        return {
            budgets: budgetsWithStats,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        };
    }
    // ========================================
    // ৩. নির্দিষ্ট বাজেট পাওয়া
    // ========================================
    static async getBudgetById(budgetId, userId) {
        const budget = await prisma.budget.findFirst({
            where: { id: budgetId, userId }
        });
        if (!budget)
            throw new Error('বাজেট পাওয়া যায়নি');
        const spent = Number(budget.spent || 0);
        const amount = Number(budget.amount);
        return {
            ...budget,
            spentPercentage: amount > 0 ? (spent / amount) * 100 : 0,
            remaining: amount - spent
        };
    }
    // ========================================
    // ৪. বর্তমান মাসের বাজেট প্রগ্রেস
    // ========================================
    static async getCurrentMonthBudgets(userId) {
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);
        const budgets = await prisma.budget.findMany({
            where: {
                userId,
                startDate: { lte: end },
                endDate: { gte: start },
                isActive: true
            }
        });
        return { budgets };
    }
    // ========================================
    // ৫. বাজেট আপডেট
    // ========================================
    static async updateBudget(budgetId, userId, data) {
        const budget = await prisma.budget.findFirst({
            where: { id: budgetId, userId }
        });
        if (!budget)
            throw new Error('বাজেট পাওয়া যায়নি');
        return await prisma.budget.update({
            where: { id: budgetId },
            data
        });
    }
    // ========================================
    // ৬. বাজেট সামারি
    // ========================================
    static async getBudgetSummary(userId) {
        const budgets = await prisma.budget.findMany({
            where: { userId, isActive: true }
        });
        const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
        const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spent || 0), 0);
        return {
            totalBudget,
            totalSpent,
            totalRemaining: totalBudget - totalSpent,
            overallPercentage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
            budgetCount: budgets.length
        };
    }
    // ========================================
    // ৭. বাজেট ডিলিট
    // ========================================
    static async deleteBudget(budgetId, userId) {
        const budget = await prisma.budget.findFirst({
            where: { id: budgetId, userId }
        });
        if (!budget)
            throw new Error('বাজেট পাওয়া যায়নি');
        await prisma.budget.delete({ where: { id: budgetId } });
        return true;
    }
    // ========================================
    // ৮. ট্রানজেকশন অনুযায়ী spent আপডেট করা
    // ========================================
    static async updateBudgetSpent(userId, category, amount) {
        const now = new Date();
        const budget = await prisma.budget.findFirst({
            where: {
                userId,
                category,
                isActive: true,
                startDate: { lte: now },
                endDate: { gte: now },
            },
        });
        if (budget) {
            return await prisma.budget.update({
                where: { id: budget.id },
                data: {
                    spent: {
                        increment: amount,
                    },
                },
            });
        }
    }
} // <--- Class-er shesh bracket ekhane thakte hobe
export default BudgetService;
