import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../../lib/prisma.js';
// সঠিক API মডেল ব্যবহার করুন
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
export class AIService {
    // ========================================
    // 1. AI চ্যাট
    // ========================================
    static async chat(userId, message, sessionId) {
        const chatSessionId = sessionId || `session_${Date.now()}_${userId}`;
        // Previous chat history
        const previousChats = await prisma.aIChat.findMany({
            where: { userId, sessionId: chatSessionId },
            orderBy: { createdAt: 'asc' },
            take: 10
        });
        // Build context
        let context = '';
        if (previousChats.length > 0) {
            context = previousChats.map(chat => `User: ${chat.message}\nAI: ${chat.response}`).join('\n');
        }
        // সঠিক মডেল নাম ব্যবহার করুন - gemini-2.0-flash-exp
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const prompt = `You are FinNexus AI, a helpful financial assistant.
    
Previous conversation:
${context}

User: ${message}
AI:`;
        const result = await model.generateContent(prompt);
        const response = await result.response.text();
        // Save to database
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
    // 2. চ্যাট হিস্টোরি
    // ========================================
    static async getChatHistory(userId, sessionId, page, limit) {
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
    static async getChatSessions(userId) {
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
    static async deleteChat(userId, chatId) {
        const chat = await prisma.aIChat.findFirst({
            where: { id: chatId, userId }
        });
        if (!chat)
            throw new Error('Chat not found');
        await prisma.aIChat.delete({ where: { id: chatId } });
        return true;
    }
    // ========================================
    // 5. সেশন ডিলিট
    // ========================================
    static async deleteSession(userId, sessionId) {
        await prisma.aIChat.deleteMany({
            where: { userId, sessionId }
        });
        return true;
    }
    // ========================================
    // 6. ফাইন্যান্সিয়াল বিশ্লেষণ
    // ========================================
    static async analyzeFinances(userId, period = 'month') {
        const now = new Date();
        let startDate;
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
            where: {
                userId,
                date: { gte: startDate }
            }
        });
        const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
        const categorySpending = {};
        transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
            categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
        });
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const prompt = `Analyze this financial data:
Total Income: ${totalIncome}
Total Expense: ${totalExpense}
Savings: ${totalIncome - totalExpense}
Category Spending: ${JSON.stringify(categorySpending)}

Provide 3 key insights and 2 actionable recommendations.`;
        const result = await model.generateContent(prompt);
        const insights = await result.response.text();
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
    static async getBudgetRecommendation(userId, monthlyIncome) {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const expenses = await prisma.transaction.groupBy({
            by: ['category'],
            where: {
                userId,
                type: 'EXPENSE',
                date: { gte: threeMonthsAgo }
            },
            _avg: { amount: true }
        });
        const averageExpenses = expenses.map(e => ({
            category: e.category,
            averageAmount: e._avg.amount || 0
        }));
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const prompt = `Based on monthly income: ${monthlyIncome} and average expenses: ${JSON.stringify(averageExpenses)},
    recommend a monthly budget. Return as JSON with categories and amounts.`;
        const result = await model.generateContent(prompt);
        const recommendation = await result.response.text();
        return {
            monthlyIncome,
            averageExpenses,
            recommendedBudget: recommendation,
            suggestedSavings: monthlyIncome * 0.2
        };
    }
    // ========================================
    // 8. কন্টেন্ট জেনারেটর
    // ========================================
    static async generateContent(type, topic, tone = 'professional', length = 'medium') {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const prompt = `Generate a ${type} about "${topic}" with ${tone} tone and ${length} length.`;
        const result = await model.generateContent(prompt);
        const content = await result.response.text();
        return { content, type, topic, tone, length };
    }
    // ========================================
    // 9. অটো ট্যাগিং
    // ========================================
    static async autoTagTransaction(description, amount) {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const prompt = `Categorize this transaction:
Description: "${description}"
Amount: ${amount || 'unknown'} BDT

Choose category from: FOOD, TRANSPORT, ENTERTAINMENT, SHOPPING, UTILITIES, HEALTHCARE, EDUCATION, RENT, SALARY, INVESTMENT, OTHER.
Also suggest 3 tags.
Return as JSON: { "category": string, "confidence": number, "tags": string[] }`;
        const result = await model.generateContent(prompt);
        const response = await result.response.text();
        try {
            return JSON.parse(response);
        }
        catch {
            return {
                category: 'OTHER',
                confidence: 70,
                tags: ['uncategorized']
            };
        }
    }
    // ========================================
    // 10. ভয়েস কমান্ড
    // ========================================
    static async processVoiceCommand(text) {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const prompt = `You are FinNexus AI. Respond to this voice command: "${text}"
    Provide a helpful financial response.`;
        const result = await model.generateContent(prompt);
        const response = await result.response.text();
        return { command: text, response, timestamp: new Date() };
    }
    // ========================================
    // 11. স্মার্ট রিকমেন্ডেশন
    // ========================================
    static async getRecommendations(userId, limit = 4) {
        const recentTransactions = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            take: 20
        });
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const prompt = `Based on user's recent transactions: ${JSON.stringify(recentTransactions.slice(0, 10))},
    provide ${limit} personalized financial recommendations.
    Return as JSON array with fields: title, description, icon, action.`;
        const result = await model.generateContent(prompt);
        const recommendations = await result.response.text();
        try {
            return JSON.parse(recommendations);
        }
        catch {
            return [
                { title: "Track Your Expenses", description: "Start tracking daily expenses to identify spending patterns", icon: "TrendingUp", action: "/transactions" },
                { title: "Set Savings Goal", description: "Create a savings goal to stay motivated", icon: "Target", action: "/goals" },
                { title: "Review Budget", description: "Review and adjust your monthly budget", icon: "Wallet", action: "/budgets" }
            ];
        }
    }
}
export default AIService;
