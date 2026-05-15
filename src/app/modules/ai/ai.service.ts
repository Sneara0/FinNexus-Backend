
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../../lib/prisma.js';
import env from '../../../config/env.js';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export class AIService {
  
  // ========================================
  // 1. AI চ্যাট
  // ========================================
  static async chat(userId: string, message: string, sessionId?: string) {
    const chatSessionId = sessionId || `session_${Date.now()}_${userId}`;
    
    const previousChats = await prisma.aIChat.findMany({
      where: { userId, sessionId: chatSessionId },
      orderBy: { createdAt: 'asc' },
      take: 10
    });
    
    let context = '';
    if (previousChats.length > 0) {
      context = previousChats.map(chat => 
        `User: ${chat.message}\nAI: ${chat.response}`
      ).join('\n');
    }
    
    let response = '';
    
    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY !== 'your_gemini_api_key_here') {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const prompt = `You are FinNexus AI, a helpful financial assistant. Respond in Bengali.
        
Previous conversation:
${context}

User: ${message}
AI:`;
        
        const result = await model.generateContent(prompt);
        response = await result.response.text();
      } catch (error) {
        console.error('Gemini API error:', error);
        response = this.getFallbackResponse(message, previousChats);
      }
    } else {
      response = this.getFallbackResponse(message, previousChats);
    }
    
    const chat = await prisma.aIChat.create({
      data: {
        userId,
        sessionId: chatSessionId,
        message,
        response,
        context: { previousCount: previousChats.length }
      }
    });
    
    return { sessionId: chatSessionId, response, chatId: chat.id };
  }
  
  // ========================================
  // ফলব্যাক রেসপন্স
  // ========================================
  private static getFallbackResponse(message: string, previousChats: any[]): string {
    const lowerMsg = message.toLowerCase();
    
    if (lowerMsg.includes('হ্যালো') || lowerMsg.includes('সালাম') || lowerMsg.includes('hi')) {
      return `আসসালামু আলাইকুম! 👋 আমি FinNexus AI.
      
আমি সাহায্য করতে পারি:
💰 টাকা সাশ্রয়
📊 বাজেট প্ল্যানিং
📈 বিনিয়োগ পরামর্শ
🎯 আর্থিক গোল`;
    }
    
    if (lowerMsg.includes('সেভ') || lowerMsg.includes('সঞ্চয়')) {
      return `💰 টাকা সাশ্রয়ের উপায়:
১. মাসিক বাজেট তৈরি করুন
২. অপ্রয়োজনীয় খরচ বাদ দিন
৩. ৫০-৩০-২০ নিয়ম অনুসরণ করুন
৪. স্বয়ংক্রিয় সঞ্চয় চালু করুন`;
    }
    
    if (lowerMsg.includes('বাজেট')) {
      return `📊 ৫০-৩০-২০ বাজেট নিয়ম:
• ৫০% - প্রয়োজনীয় খরচ
• ৩০% - ব্যক্তিগত খরচ
• ২০% - সঞ্চয় ও বিনিয়োগ`;
    }
    
    if (lowerMsg.includes('বিনিয়োগ')) {
      return `📈 বিনিয়োগ শুরু করার ধাপ:
১. ইমার্জেন্সি ফান্ড তৈরি করুন
২. ছোট পরিমাণে শুরু করুন
৩. ডাইভার্সিফাই করুন
৪. দীর্ঘমেয়াদী চিন্তা করুন`;
    }
    
    return `🤖 FinNexus AI সহায়ক:
    
আমি আপনার আর্থিক প্রশ্নের উত্তর দিতে পারি:
• টাকা সাশ্রয়ের উপায়
• মাসিক বাজেট তৈরি
• বিনিয়োগ শুরু করা
• খরচ নিয়ন্ত্রণ

আপনার প্রশ্ন: "${message}"`;
  }
  
  // ========================================
  // 2. চ্যাট হিস্টোরি
  // ========================================
  static async getChatHistory(userId: string, sessionId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    
    const [chats, total] = await Promise.all([
      prisma.aIChat.findMany({
        where: { userId, sessionId },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit
      }),
      prisma.aIChat.count({ where: { userId, sessionId } })
    ]);
    
    return {
      chats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  
  // ========================================
  // 3. চ্যাট সেশনস
  // ========================================
  static async getChatSessions(userId: string) {
    const sessions = await prisma.aIChat.groupBy({
      by: ['sessionId'],
      where: { userId },
      _count: { sessionId: true },
      _max: { createdAt: true }
    });
    
    return sessions.map(s => ({
      sessionId: s.sessionId,
      messageCount: s._count.sessionId,
      lastMessageAt: s._max.createdAt
    }));
  }
  
  // ========================================
  // 4. চ্যাট ডিলিট
  // ========================================
  static async deleteChat(userId: string, chatId: string) {
    const chat = await prisma.aIChat.findFirst({
      where: { id: chatId, userId }
    });
    if (!chat) throw new Error('Chat not found');
    await prisma.aIChat.delete({ where: { id: chatId } });
    return true;
  }
  
  // ========================================
  // 5. সেশন ডিলিট
  // ========================================
  static async deleteSession(userId: string, sessionId: string) {
    await prisma.aIChat.deleteMany({
      where: { userId, sessionId }
    });
    return true;
  }
  
  // ========================================
  // 6. ফাইন্যান্সিয়াল বিশ্লেষণ
  // ========================================
  static async analyzeFinances(userId: string, period: string = 'month') {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }
    
    const transactions = await prisma.transaction.findMany({
      where: { userId, date: { gte: startDate } }
    });
    
    const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
    
    const categorySpending: Record<string, number> = {};
    transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    });
    
    let insights = '';
    if (totalExpense > totalIncome) {
      insights = `⚠️ আপনার খরচ (${totalExpense} টাকা) আয়ের (${totalIncome} টাকা) চেয়ে বেশি। খরচ কমান।`;
    } else if (totalExpense > totalIncome * 0.8) {
      insights = `আপনার খরচ আয়ের 80% এর বেশি। সঞ্চয় বাড়ান।`;
    } else {
      insights = `👍 চমৎকার! সঞ্চয় ${totalIncome - totalExpense} টাকা।`;
    }
    
    return {
      period,
      startDate,
      endDate: new Date(),
      totalIncome,
      totalExpense,
      savings: totalIncome - totalExpense,
      transactionCount: transactions.length,
      categorySpending,
      aiInsights: insights
    };
  }
  
  // ========================================
  // 7. বাজেট সুপারিশ
  // ========================================
  static async getBudgetRecommendation(userId: string, monthlyIncome: number) {
    return {
      monthlyIncome,
      suggestedSavings: monthlyIncome * 0.2,
      recommendedBudget: {
        FOOD: Math.round(monthlyIncome * 0.30),
        TRANSPORT: Math.round(monthlyIncome * 0.15),
        UTILITIES: Math.round(monthlyIncome * 0.10),
        ENTERTAINMENT: Math.round(monthlyIncome * 0.10),
        SHOPPING: Math.round(monthlyIncome * 0.10),
        SAVINGS: Math.round(monthlyIncome * 0.20),
        OTHER: Math.round(monthlyIncome * 0.05)
      },
      message: "50-30-20 নিয়মের ভিত্তিতে বাজেট তৈরি করা হয়েছে।"
    };
  }
  
  // ========================================
  // 8. কন্টেন্ট জেনারেটর
  // ========================================
  static async generateContent(type: string, topic: string, tone?: string, length?: string) {
    return {
      content: `জেনারেটেড ${type} "${topic}" সম্পর্কে। এটি একটি নমুনা কন্টেন্ট।`,
      type,
      topic,
      tone: tone || 'professional',
      length: length || 'medium'
    };
  }
  
  // ========================================
  // 9. অটো ট্যাগিং
  // ========================================
  static async autoTagTransaction(description: string, amount?: number) {
    let category = 'OTHER';
    const lowerDesc = description.toLowerCase();
    
    const keywords: Record<string, string> = {
      'খাবার': 'FOOD', 'রেস্টুরেন্ট': 'FOOD', 'হোটেল': 'FOOD',
      'উবার': 'TRANSPORT', 'ট্যাক্সি': 'TRANSPORT', 'বাস': 'TRANSPORT',
      'সিনেমা': 'ENTERTAINMENT', 'নেটফ্লিক্স': 'ENTERTAINMENT',
      'শপিং': 'SHOPPING', 'কেনাকাটা': 'SHOPPING',
      'বিদ্যুৎ': 'UTILITIES', 'পানি': 'UTILITIES',
      'ডাক্তার': 'HEALTHCARE', 'হাসপাতাল': 'HEALTHCARE',
      'স্কুল': 'EDUCATION', 'কলেজ': 'EDUCATION',
      'ভাড়া': 'RENT', 'বাসা': 'RENT',
      'বেতন': 'SALARY'
    };
    
    for (const [key, value] of Object.entries(keywords)) {
      if (lowerDesc.includes(key)) {
        category = value;
        break;
      }
    }
    
    return { category, confidence: 85, tags: [category.toLowerCase()] };
  }
  
  // ========================================
  // 10. ভয়েস কমান্ড
  // ========================================
  static async processVoiceCommand(text: string) {
    return { 
      command: text, 
      response: `"${text}" - আপনার কমান্ড প্রসেস করা হয়েছে। আর্থিক বিষয়ে সাহায্য চাইলে জানাবেন।`,
      timestamp: new Date() 
    };
  }
  
  // ========================================
  // 11. স্মার্ট রিকমেন্ডেশন
  // ========================================
  static async getRecommendations(userId: string, limit: number = 4) {
    return [
      { title: "ট্র্যাক আপনার খরচ", description: "দৈনিক খরচ ট্র্যাক করুন", icon: "TrendingUp", action: "/transactions" },
      { title: "সেভিংস গোল সেট করুন", description: "টাকা সাশ্রয়ের লক্ষ্য নির্ধারণ করুন", icon: "Target", action: "/goals" },
      { title: "বাজেট রিভিউ করুন", description: "মাসিক বাজেট পর্যালোচনা করুন", icon: "Wallet", action: "/budgets" },
      { title: "এআই ইনসাইটস", description: "ব্যক্তিগতকৃত আর্থিক পরামর্শ", icon: "Brain", action: "/ai-chat" }
    ];
  }
}

export default AIService;
