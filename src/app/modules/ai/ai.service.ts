import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../../../config/prisma.js'; // সেন্ট্রাল প্রিজমা ক্লায়েন্ট
import dotenv from 'dotenv';
import { IAIChatResponse, IFinancialAnalysis, IBudgetRecommendation } from './ai.interface.js';

dotenv.config();

// Gemini API ক্লায়েন্ট
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class AIService {
  
  // ১. চ্যাট রেসপন্স জেনারেট করুন
  static async generateChatResponse(
    userId: string, 
    sessionId: string, 
    message: string
  ): Promise<IAIChatResponse> {
    try {
      // পূর্বের চ্যাট হিস্টোরি পাওয়া
      const previousChats = await prisma.aIChat.findMany({
        where: { userId, sessionId },
        orderBy: { createdAt: 'asc' },
        take: 10
      });
      
      // কনটেক্সট তৈরি (Gemini এর জন্য সহজ ফরম্যাট)
      const chatHistoryString = previousChats
        .map(chat => `User: ${chat.message}\nAI: ${chat.response}`)
        .join('\n');
      
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // দ্রুত রেসপন্সের জন্য ফ্ল্যাশ ব্যবহার করতে পারেন
      
      const prompt = `
        আপনি একজন অভিজ্ঞ আর্থিক উপদেষ্টা (Financial Advisor)। ব্যবহারকারীর প্রশ্নের উত্তর দিন।
        
        পূর্ববর্তী কথোপকথন:
        ${chatHistoryString}
        
        বর্তমান প্রশ্ন: ${message}
        
        দয়া করে সহায়ক, বাস্তবসম্মত এবং সংক্ষেপে উত্তর দিন। উত্তরটি অবশ্যই সুন্দর বাংলা ভাষায় হতে হবে।
      `;
      
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // চ্যাট ডাটাবেসে সংরক্ষণ
      const chat = await prisma.aIChat.create({
        data: {
          userId,
          sessionId,
          message,
          response: responseText,
          // context যদি JSON ফিল্ড হয় তবে এভাবে দিন
          context: { chatCount: previousChats.length } 
        }
      });
      
      return { 
        response: responseText, 
        sessionId,
        chat: {
          id: chat.id,
          role: 'model',
          content: responseText,
          createdAt: chat.createdAt
        }
      };
      
    } catch (error) {
      console.error('AI Chat Error:', error);
      throw new Error('AI রেসপন্স জেনারেট করতে ব্যর্থ হয়েছে');
    }
  }
  
  // ২. চ্যাট হিস্টোরি পাওয়া
  static async getChatHistory(userId: string, sessionId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [chats, total] = await Promise.all([
      prisma.aIChat.findMany({
        where: { userId, sessionId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.aIChat.count({ where: { userId, sessionId } })
    ]);
    
    return {
      chats: chats.reverse(),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
  
  // ৩. চ্যাট সেশনসমূহ পাওয়া
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

  // ৪. আর্থিক বিশ্লেষণ
  static async analyzeFinancialData(userId: string, transactions: any[]): Promise<{ analysis: string }> {
    const prompt = `
      নিচের ট্রানজেকশন ডাটা বিশ্লেষণ করুন:
      ${JSON.stringify(transactions, null, 2)}
      
      দয়া করে নিচের বিষয়গুলো সুন্দরভাবে ব্যাখ্যা করুন:
      ১. মোট আয় এবং খরচ।
      ২. কোন ক্যাটাগরিতে সবচেয়ে বেশি খরচ হচ্ছে।
      ৩. এই ইউজারের জন্য খরচ কমানোর ৩টি গুরুত্বপূর্ণ পরামর্শ।
      ৪. ভবিষ্যৎ সেভিংসের জন্য একটি গাইডলাইন।
    `;
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return { analysis: result.response.text() };
  }

  // ৫. চ্যাট ডিলিট করা
  static async deleteChat(userId: string, chatId: string) {
    return await prisma.aIChat.deleteMany({
      where: { id: chatId, userId }
    });
  }

  // ৬. সেশন ডিলিট করা
  static async deleteSession(userId: string, sessionId: string) {
    return await prisma.aIChat.deleteMany({
      where: { sessionId, userId }
    });
  }

  // ৭. বাজেট সুপারিশ
  static async getBudgetRecommendation(userId: string, income: number, expenses: any[]) {
    const prompt = `
      মাসিক আয়: ${income} টাকা
      বর্তমান ক্যাটাগরি ভিত্তিক খরচ: ${JSON.stringify(expenses)}
      
      এই তথ্যের ভিত্তিতে একটি আদর্শ 50/30/20 বাজেট রুল অনুযায়ী মাসিক প্ল্যান তৈরি করে দিন।
    `;
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return { recommendation: result.response.text() };
  }
}