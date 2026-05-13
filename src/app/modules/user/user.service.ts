 // ✅ সঠিক ইম্পোর্ট
import { UserRole } from "../../../generated/prisma/index.js";
import { prisma } from "../../lib/prisma.js"; // ✅ আপনার প্রজেক্টের সেন্ট্রাল প্রিজমা ক্লায়েন্ট

export class UserService {
  
  // ১. সব ইউজার পাওয়া (অ্যাডমিনের জন্য)
  static async getAllUsers(page: number = 1, limit: number = 10, search?: string, role?: string, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (role && role !== 'all') {
      where.role = role as UserRole;
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
          id: true,
          email: true,
          name: true,
          role: true,
          avatar: true,
          phone: true,
          address: true,
          isActive: true,
          isVerified: true,
          lastLogin: true,
          createdAt: true,
          _count: {
            select: {
              transactions: true,
              budgets: true,
              goals: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);
    
    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  
  // ২. নির্দিষ্ট ইউজার পাওয়া
  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        address: true,
        isActive: true,
        isVerified: true,
        lastLogin: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        userSettings: true,
        _count: {
          select: {
            transactions: true,
            budgets: true,
            goals: true,
            subscriptions: true,
            aiChats: true
          }
        }
      }
    });
    
    if (!user) throw new Error('ইউজার পাওয়া যায়নি');
    return user;
  }
  
  // ৩. নিজের প্রোফাইল পাওয়া
  static async getMyProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, name: true, role: true,
        avatar: true, phone: true, address: true,
        isActive: true, isVerified: true, lastLogin: true,
        emailVerified: true, createdAt: true, updatedAt: true,
        userSettings: true
      }
    });
    
    if (!user) throw new Error('ইউজার পাওয়া যায়নি');
    return user;
  }
  
  // ৪. প্রোফাইল আপডেট (নিজের)
  static async updateMyProfile(userId: string, data: {
    name?: string; phone?: string; address?: string; avatar?: string;
  }) {
    return await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true, email: true, name: true, role: true,
        phone: true, address: true, avatar: true, updatedAt: true
      }
    });
  }
  
  // ৫. ইউজার আপডেট (অ্যাডমিনের জন্য)
  static async updateUser(userId: string, data: {
    name?: string; phone?: string; address?: string; avatar?: string; role?: UserRole;
  }) {
    // লক্ষ্য করুন: UserService.getUserById ব্যবহার করা হয়েছে কারণ এটি একটি স্ট্যাটিক মেথড
    await UserService.getUserById(userId); 
    
    return await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true, email: true, name: true, role: true,
        phone: true, address: true, avatar: true,
        isActive: true, updatedAt: true
      }
    });
  }
  
  // ৬. ইউজার নিষ্ক্রিয় করা
  static async deactivateUser(userId: string) {
    await UserService.getUserById(userId);
    return await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
      select: { id: true, email: true, name: true, isActive: true }
    });
  }
  
  // ৭. ইউজার সক্রিয় করা
  static async activateUser(userId: string) {
    await UserService.getUserById(userId);
    return await prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
      select: { id: true, email: true, name: true, isActive: true }
    });
  }
  
  // ৮. ইউজার রোল পরিবর্তন
  static async changeUserRole(userId: string, role: UserRole) {
    await UserService.getUserById(userId);
    return await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, name: true, role: true }
    });
  }
  
  // ৯. ইউজার ডিলিট (পূর্ণ ডিলিট)
  static async deleteUser(userId: string) {
    await UserService.getUserById(userId);
    await prisma.user.delete({ where: { id: userId } });
    return true;
  }
  
  // ১০. ইউজার স্ট্যাটিস্টিক্স
  static async getUserStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    
    const [
      totalUsers, activeUsers, adminCount, managerCount, userCount,
      newThisMonth, newThisWeek, verifiedUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'MANAGER' } }),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfWeek } } }),
      prisma.user.count({ where: { isVerified: true } })
    ]);
    
    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      verifiedUsers,
      unverifiedUsers: totalUsers - verifiedUsers,
      adminCount,
      managerCount,
      userCount,
      newThisMonth,
      newThisWeek,
      growthRate: totalUsers > 0 ? ((newThisMonth / totalUsers) * 100).toFixed(2) : 0
    };
  }
  
  // ১১. ইউজার সার্চ (দ্রুত)
  static async searchUsers(query: string, limit: number = 10) {
    return await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: limit,
      select: { id: true, email: true, name: true, role: true, avatar: true, isActive: true }
    });
  }
}

export default UserService;