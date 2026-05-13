// নিশ্চিত করুন পাথ সঠিক আছে। Singleton pattern অনুযায়ী lib/prisma থেকে ইমপোর্ট করুন।
import { prisma } from '../../lib/prisma.js';

export class AdminService {
  
  // ========================================
  // ১. ড্যাশবোর্ড স্ট্যাটিস্টিক্স
  // ========================================
  static async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    
    const [
      totalUsers,
      activeUsers,
      totalTransactions,
      totalIncome,
      totalExpense,
      totalBudgets,
      totalGoals,
      completedGoals,
      newUsersThisMonth,
      newUsersThisWeek,
      recentTransactions
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.transaction.count(),
      prisma.transaction.aggregate({
        where: { type: 'INCOME' },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { type: 'EXPENSE' },
        _sum: { amount: true }
      }),
      prisma.budget.count(),
      prisma.goal.count(),
      prisma.goal.count({ where: { isCompleted: true } }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfWeek } } }),
      prisma.transaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      })
    ]);
    
    const categoryAnalysis = await prisma.transaction.groupBy({
      by: ['category'],
      where: { type: 'EXPENSE' },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } }
    });
    
    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        newThisMonth: newUsersThisMonth,
        newThisWeek: newUsersThisWeek,
        growthRate: totalUsers > 0 ? ((newUsersThisMonth / totalUsers) * 100).toFixed(2) : "0"
      },
      transactions: {
        total: totalTransactions,
        totalIncome: totalIncome._sum.amount || 0,
        totalExpense: totalExpense._sum.amount || 0,
        profit: (totalIncome._sum.amount || 0) - (totalExpense._sum.amount || 0),
        recent: recentTransactions
      },
      budgets: { total: totalBudgets },
      goals: {
        total: totalGoals,
        completed: completedGoals,
        pending: totalGoals - completedGoals,
        completionRate: totalGoals > 0 ? ((completedGoals / totalGoals) * 100).toFixed(2) : "0"
      },
      categoryAnalysis: categoryAnalysis.map(c => ({
        category: c.category,
        amount: c._sum.amount || 0
      }))
    };
  }
  
  // ========================================
  // ২. সব ইউজার পাওয়া (Pagination & Search)
  // ========================================
  static async getAllUsers(page: number = 1, limit: number = 10, search: string = "", role: string = "all", status: string = "all") {
    const skip = (page - 1) * limit;
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (role && role !== 'all') {
      where.role = role;
    }
    
    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true, email: true, name: true, role: true, avatar: true,
          isActive: true, isVerified: true, lastLogin: true, createdAt: true,
          _count: { select: { transactions: true, budgets: true, goals: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);
    
    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
  
  // ========================================
  // ৩. নির্দিষ্ট ইউজার পাওয়া
  // ========================================
  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, name: true, role: true, avatar: true,
        phone: true, address: true, isActive: true, isVerified: true,
        lastLogin: true, createdAt: true,
        _count: { select: { transactions: true, budgets: true, goals: true, subscriptions: true } }
      }
    });
    
    if (!user) throw new Error('ইউজার পাওয়া যায়নি');
    return user;
  }
  
  // ========================================
  // ৪. ইউজার আপডেট
  // ========================================
  static async updateUser(userId: string, data: any) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address,
        role: data.role,
        isActive: data.isActive
      },
      select: { id: true, email: true, name: true, role: true, isActive: true }
    });
  }

  // ========================================
  // ৫. ইউজার রোল পরিবর্তন (এই মেথডটি মিসিং ছিল)
  // ========================================
  static async changeUserRole(userId: string, role: 'USER' | 'MANAGER' | 'ADMIN') {
    return await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, name: true, role: true }
    });
  }
  
  // ========================================
  // ৬. ইউজার ডিলিট
  // ========================================
  static async deleteUser(userId: string) {
    await prisma.user.delete({ where: { id: userId } });
    return { success: true, message: 'User deleted successfully' };
  }
  
  // ========================================
  // ৭. ইউজার স্ট্যাটাস টগল
  // ========================================
  static async toggleUserStatus(userId: string) {
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true }
    });
    
    if (!currentUser) throw new Error('ইউজার পাওয়া যায়নি');
    
    return await prisma.user.update({
      where: { id: userId },
      data: { isActive: !currentUser.isActive },
      select: { id: true, name: true, isActive: true }
    });
  }
  
  // ========================================
  // ৮. সিস্টেম হেলথ চেক
  // ========================================
  static async getSystemHealth() {
    let dbStatus = 'connected';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'disconnected';
    }
    
    const memoryUsage = process.memoryUsage();
    
    return {
      status: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: { status: dbStatus, connected: dbStatus === 'connected' },
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
      }
    };
  }
}

export default AdminService;