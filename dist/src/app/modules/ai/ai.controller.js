import { catchAsync } from '../../utils/catchAsync.js';
import { sendError, sendSuccess } from '../../utils/sendResponse.js';
import AIService from './ai.service.js';
// ========================================
// 1. AI চ্যাট
// ========================================
export const chat = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const { message, sessionId } = req.body;
    if (!message) {
        return sendError(res, 'Message is required', 400);
    }
    const result = await AIService.chat(userId, message, sessionId);
    sendSuccess(res, result, 'AI response generated');
});
// ========================================
// 2. চ্যাট হিস্টোরি
// ========================================
export const getChatHistory = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const { sessionId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await AIService.getChatHistory(userId, sessionId, page, limit);
    sendSuccess(res, result, 'Chat history retrieved');
});
// ========================================
// 3. চ্যাট সেশনস
// ========================================
export const getChatSessions = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const sessions = await AIService.getChatSessions(userId);
    sendSuccess(res, { sessions }, 'Chat sessions retrieved');
});
// ========================================
// 4. চ্যাট ডিলিট
// ========================================
export const deleteChat = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const { chatId } = req.params;
    await AIService.deleteChat(userId, chatId);
    sendSuccess(res, null, 'Chat deleted successfully');
});
// ========================================
// 5. সেশন ডিলিট
// ========================================
export const deleteSession = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const { sessionId } = req.params;
    await AIService.deleteSession(userId, sessionId);
    sendSuccess(res, null, 'Session deleted successfully');
});
// ========================================
// 6. ফাইন্যান্সিয়াল বিশ্লেষণ
// ========================================
export const analyzeFinances = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const period = req.query.period || 'month';
    const analysis = await AIService.analyzeFinances(userId, period);
    sendSuccess(res, analysis, 'Financial analysis completed');
});
// ========================================
// 7. বাজেট সুপারিশ
// ========================================
export const getBudgetRecommendation = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const { monthlyIncome } = req.body;
    if (!monthlyIncome) {
        return sendError(res, 'Monthly income is required', 400);
    }
    const recommendation = await AIService.getBudgetRecommendation(userId, monthlyIncome);
    sendSuccess(res, recommendation, 'Budget recommendation generated');
});
// ========================================
// 8. কন্টেন্ট জেনারেটর
// ========================================
export const generateContent = catchAsync(async (req, res) => {
    const { type, topic, tone, length } = req.body;
    if (!type || !topic) {
        return sendError(res, 'Type and topic are required', 400);
    }
    const content = await AIService.generateContent(type, topic, tone, length);
    sendSuccess(res, content, 'Content generated successfully');
});
// ========================================
// 9. অটো ট্যাগিং
// ========================================
export const autoTagTransaction = catchAsync(async (req, res) => {
    const { description, amount } = req.body;
    if (!description) {
        return sendError(res, 'Description is required', 400);
    }
    const result = await AIService.autoTagTransaction(description, amount);
    sendSuccess(res, result, 'Transaction categorized');
});
// ========================================
// 10. ভয়েস কমান্ড
// ========================================
export const processVoiceCommand = catchAsync(async (req, res) => {
    const { text } = req.body;
    if (!text) {
        return sendError(res, 'Voice text is required', 400);
    }
    const result = await AIService.processVoiceCommand(text);
    sendSuccess(res, result, 'Voice command processed');
});
// ========================================
// 11. স্মার্ট রিকমেন্ডেশন
// ========================================
export const getRecommendations = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const limit = Number(req.body.limit) || 4;
    const recommendations = await AIService.getRecommendations(userId, limit);
    sendSuccess(res, { recommendations }, 'Recommendations generated');
});
export const AIController = {
    chat,
    getChatHistory,
    getChatSessions,
    deleteChat,
    deleteSession,
    analyzeFinances,
    getBudgetRecommendation,
    generateContent,
    autoTagTransaction,
    processVoiceCommand,
    getRecommendations
};
