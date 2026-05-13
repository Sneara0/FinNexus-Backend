import { startOfMonth, endOfMonth } from 'date-fns';
// ✅ সরাসরি লাইব্রেরি থেকে ইম্পোর্ট
import { prisma } from '../../lib/prisma.js'; // ✅ আপনার প্রজেক্টের সেন্ট্রাল প্রিজমা ইন্সট্যান্স
import { BudgetPeriod, TransactionCategory } from '../../../generated/prisma/index.js';

export class BudgetService {
  
  // ========================================
  // 1. বাজেট তৈরি
  // ========================================
  static async createBudget(userId: string, data: {
    category: TransactionCategory;
    amount: number;
    period: BudgetPeriod;
    startDate: Date;
    endDate: Date;
    alertThreshold?: number;
    note?: string;
  }) {
    // একই ক্যাটাগরিতে বাজেট আছে কিনা চেক
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
    
    const budget = await prisma.budget.create({
      data: {
        userId,
        category: data.category,
        amount: data.amount,
        period: data.period,
        startDate: data.startDate,
        endDate: data.endDate,
        alertThreshold: data.alertThreshold || 80,
        note: data.note,
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
    
    return budget;
  }
  
  // ========================================
  // 2. সব বাজেট পাওয়া
  // ========================================
  static async getAllBudgets(
    userId: string,
    page: number = 1,
    limit: number = 10,
    period?: string,
    category?: string,
    isActive?: boolean
  ) {
    const skip = (page - 1) * limit;
    
    const where: any = { userId };
    
    if (period && period !== 'all') {
      where.period = period as BudgetPeriod;
    }
    
    if (category && category !== 'all') {
      where.category = category as TransactionCategory;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    
    const [budgets, total] = await Promise.all([
      prisma.budget.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      prisma.budget.count({ where })
    ]);
    
    // প্রতিটি বাজেটের জন্য ক্যালকুলেশন
    const budgetsWithPercentage = budgets.map(budget => {
      const spent = Number(budget.spent || 0);
      const amount = Number(budget.amount);
      return {
        ...budget,
        spentPercentage: (spent / amount) * 100,
        remaining: amount - spent,
        isOverBudget: spent > amount,
        isAlert: (spent / amount) * 100 >= (budget.alertThreshold || 80)
      };
    });
    
    return {
      budgets: budgetsWithPercentage,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  
  // ========================================
  // 3. নির্দিষ্ট বাজেট পাওয়া
  // ========================================
  static async getBudgetById(budgetId: string, userId: string) {
    const budget = await prisma.budget.findFirst({
      where: { id: budgetId, userId },
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
    
    if (!budget) {
      throw new Error('বাজেট পাওয়া যায়নি');
    }
    
    const spent = Number(budget.spent || 0);
    const amount = Number(budget.amount);
    
    return {
      ...budget,
      spentPercentage: (spent / amount) * 100,
      remaining: amount - spent,
      isOverBudget: spent > amount,
      isAlert: (spent / amount) * 100 >= (budget.alertThreshold || 80)
    };
  }
  
  // ========================================
  // 4. বর্তমান মাসের বাজেট প্রগ্রেস দেখা
  // ========================================
  static async getCurrentMonthBudgets(userId: string) {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        startDate: { lte: end },
        endDate: { gte: start },
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // ট্রানজেকশন থেকে রিয়েল-টাইম খরচ ক্যালকুলেট
    const transactions = await prisma.transaction.groupBy({
      by: ['category'],
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: start, lte: end }
      },
      _sum: { amount: true }
    });
    
    const expenseMap = new Map();
    transactions.forEach(t => {
      expenseMap.set(t.category, Number(t._sum.amount || 0));
    });
    
    const budgetsWithActual = budgets.map(budget => {
      const actualSpent = expenseMap.get(budget.category) || 0;
      const amount = Number(budget.amount);
      return {
        ...budget,
        actualSpent,
        spentPercentage: (actualSpent / amount) * 100,
        remaining: amount - actualSpent,
        isOverBudget: actualSpent > amount,
        isAlert: (actualSpent / amount) * 100 >= (budget.alertThreshold || 80)
      };
    });
    
    const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalSpent = budgetsWithActual.reduce((sum, b) => sum + b.actualSpent, 0);
    
    return {
      budgets: budgetsWithActual,
      summary: {
        totalBudget,
        totalSpent,
        totalRemaining: totalBudget - totalSpent,
        overallPercentage: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
        budgetCount: budgets.length
      }
    };
  }

  // ========================================
  // 5. বাজেট আপডেট
  // ========================================
  static async updateBudgetSpent(userId: string, category: TransactionCategory, amount: number) {
    const now = new Date();
    
    // বর্তমান সময়ের জন্য একটিভ বাজেটটি খুঁজুন
    const budget = await prisma.budget.findFirst({
      where: {
        userId,
        category,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    // যদি বাজেট পাওয়া যায়, তবে সেটির spent/spentAmount আপডেট করুন
    if (budget) {
      return await prisma.budget.update({
        where: { id: budget.id },
        data: {
          // খরচ বাড়লে পজিটিভ (increment), ডিলিট হলে নেগেটিভ এমাউন্ট পাস হবে
          spent: {
            increment: amount,
          },
        },
      });
    }
  }

  // ========================================
  // 6. বাজেট ডিলিট
  // ========================================
  static async deleteBudget(budgetId: string, userId: string) {
    const existingBudget = await prisma.budget.findFirst({
      where: { id: budgetId, userId }
    });
    
    if (!existingBudget) {
      throw new Error('বাজেট পাওয়া যায়নি');
    }
    
    await prisma.budget.delete({ where: { id: budgetId } });
    return true;
  }
}

export default BudgetService;