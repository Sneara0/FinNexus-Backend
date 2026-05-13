 // ✅ সরাসরি লাইব্রেরি থেকে ইম্পোর্ট
import { Goal } from '../../../generated/prisma/index.js';
import { prisma } from '../../lib/prisma.js'; // ✅ আপনার সেন্ট্রাল প্রিজমা ক্লায়েন্ট

// ইন্টারফেস ডিফাইন করা হয়েছে টাইপ সেফটির জন্য
interface IGoalData {
  name: string;
  targetAmount: number;
  deadline: Date;
  note?: string;
}

export class GoalService {
  
  // ১. গোল তৈরি
  static async createGoal(userId: string, data: IGoalData) {
    const existingGoal = await prisma.goal.findFirst({
      where: {
        userId,
        name: data.name,
        isCompleted: false
      }
    });
    
    if (existingGoal) {
      throw new Error('এই নামে একটি গোল ইতিমধ্যে রয়েছে');
    }
    
    return await prisma.goal.create({
      data: {
        userId,
        ...data,
        currentAmount: 0,
        isCompleted: false
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
  }

  // ২. সব গোল পাওয়া
  static async getAllGoals(
    userId: string,
    page: number = 1,
    limit: number = 10,
    status?: string,
    sortBy?: string
  ) {
    const skip = (page - 1) * limit;
    const where: Record<string, any> = { userId };
    
    if (status === 'completed') where.isCompleted = true;
    else if (status === 'active') where.isCompleted = false;
    
    let orderBy: Record<string, string> = { createdAt: 'desc' };
    if (sortBy === 'deadline') orderBy = { deadline: 'asc' };
    else if (sortBy === 'progress') orderBy = { currentAmount: 'desc' };
    
    const [goals, total] = await Promise.all([
      prisma.goal.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: { select: { id: true, name: true, email: true } }
        }
      }),
      prisma.goal.count({ where })
    ]);
    
    // প্রগ্রেস ক্যালকুলেশন
    const goalsWithProgress = goals.map((goal: Goal) => {
      const target = Number(goal.targetAmount);
      const current = Number(goal.currentAmount);
      const progress = target > 0 ? (current / target) * 100 : 0;
      
      return {
        ...goal,
        progress: Number(progress.toFixed(2)),
        remaining: target - current,
        daysRemaining: Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)),
        isOverdue: new Date(goal.deadline) < new Date() && !goal.isCompleted
      };
    });

    return {
      goals: goalsWithProgress,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // ৩. নির্দিষ্ট গোল পাওয়া
  static async getGoalById(goalId: string, userId: string) {
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId },
      include: {
        user: { select: { id: true, name: true, email: true } }
      }
    });
    
    if (!goal) throw new Error('গোল পাওয়া যায়নি');
    
    const target = Number(goal.targetAmount);
    const current = Number(goal.currentAmount);
    const progress = target > 0 ? (current / target) * 100 : 0;

    return {
      ...goal,
      progress: Number(progress.toFixed(2)),
      remaining: target - current,
      daysRemaining: Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24)),
      isOverdue: new Date(goal.deadline) < new Date() && !goal.isCompleted
    };
  }

  // ৪. গোলে টাকা যোগ করা
  static async addToGoal(goalId: string, userId: string, amount: number) {
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId }
    });
    
    if (!goal) throw new Error('গোল পাওয়া যায়নি');
    if (goal.isCompleted) throw new Error('এই গোল ইতিমধ্যে সম্পন্ন হয়েছে');
    
    const newAmount = Number(goal.currentAmount) + Number(amount);
    const isCompleted = newAmount >= Number(goal.targetAmount);
    
    return await prisma.goal.update({
      where: { id: goalId },
      data: {
        currentAmount: newAmount,
        isCompleted: isCompleted,
        completedAt: isCompleted ? new Date() : null
      }
    });
  }

  // ৫. গোল থেকে টাকা কমানো
  static async removeFromGoal(goalId: string, userId: string, amount: number) {
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId }
    });
    
    if (!goal) throw new Error('গোল পাওয়া যায়নি');
    const newAmount = Math.max(0, Number(goal.currentAmount) - Number(amount));
    
    return await prisma.goal.update({
      where: { id: goalId },
      data: { currentAmount: newAmount }
    });
  }

  // ৬. গোল সম্পন্ন মার্ক করা
  static async completeGoal(goalId: string, userId: string) {
    const goal = await prisma.goal.findFirst({ where: { id: goalId, userId } });
    if (!goal) throw new Error('গোল পাওয়া যায়নি');

    return await prisma.goal.update({
      where: { id: goalId },
      data: { isCompleted: true, completedAt: new Date() }
    });
  }

  // ৭. গোল আপডেট
  static async updateGoal(goalId: string, userId: string, data: Partial<IGoalData>) {
    const existingGoal = await prisma.goal.findFirst({ where: { id: goalId, userId } });
    if (!existingGoal) throw new Error('গোল পাওয়া যায়নি');

    return await prisma.goal.update({
      where: { id: goalId },
      data
    });
  }

  // ৮. গোল ডিলিট
  static async deleteGoal(goalId: string, userId: string) {
    const existingGoal = await prisma.goal.findFirst({ where: { id: goalId, userId } });
    if (!existingGoal) throw new Error('গোল পাওয়া যায়নি');
    
    await prisma.goal.delete({ where: { id: goalId } });
    return true;
  }

  // ৯. গোল ড্যাশবোর্ড
  static async getGoalDashboard(userId: string) {
    const goals = await prisma.goal.findMany({ where: { userId } });

    const totalSaved = goals.reduce((sum: number, g: Goal) => sum + Number(g.currentAmount), 0);
    const totalTarget = goals.reduce((sum: number, g: Goal) => sum + Number(g.targetAmount), 0);

    return {
      stats: {
        totalGoals: goals.length,
        totalSaved,
        totalTarget,
        overallProgress: totalTarget > 0 ? Number(((totalSaved / totalTarget) * 100).toFixed(2)) : 0
      }
    };
  }
}

export default GoalService;