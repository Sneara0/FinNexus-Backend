import { catchAsync } from '../../utils/catchAsync.js';
import { sendError, sendPaginated, sendSuccess } from '../../utils/sendResponse.js';
import TransactionService from './transaction.service.js';
// ========================================
// 1. ট্রানজেকশন তৈরি
// ========================================
export const createTransaction = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const { type, amount, description, date, currency, location, tags, receiptUrl, isRecurring, category } = req.body;
    const transaction = await TransactionService.createTransaction(userId, {
        type,
        amount,
        description,
        date: date ? new Date(date) : undefined,
        currency,
        location,
        tags,
        receiptUrl,
        isRecurring,
        category
    });
    sendSuccess(res, transaction, 'ট্রানজেকশন তৈরি করা হয়েছে', 201);
});
// ========================================
// 2. সব ট্রানজেকশন পাওয়া (Fix: getAllTransactions)
// ========================================
export const getAllTransactions = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const filters = {
        type: req.query.type,
        category: req.query.category,
        startDate: req.query.startDate, // ✅ string হিসেবে রাখা হয়েছে যাতে সার্ভিসে এরর না দেয়
        endDate: req.query.endDate,
        minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
        maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined,
        search: req.query.search,
        isRecurring: req.query.isRecurring === 'true' ? true : req.query.isRecurring === 'false' ? false : undefined
    };
    // ✅ সার্ভিস মেথড নাম ঠিক করা হয়েছে (getAllTransactions)
    const result = await TransactionService.getAllTransactions(userId, { page, limit, ...filters });
    sendPaginated(res, result.data, result.meta, 'ট্রানজেকশন লিস্ট পাওয়া গেছে');
});
// ========================================
// 3. নির্দিষ্ট ট্রানজেকশন পাওয়া
// ========================================
export const getTransactionById = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const { id } = req.params;
    const transaction = await TransactionService.getTransactionById(id, userId);
    sendSuccess(res, transaction, 'ট্রানজেকশন পাওয়া গেছে');
});
// ========================================
// 4. ট্রানজেকশন আপডেট
// ========================================
export const updateTransaction = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const { id } = req.params;
    const updateData = req.body;
    const transaction = await TransactionService.updateTransaction(id, userId, {
        ...updateData,
        date: updateData.date ? new Date(updateData.date) : undefined
    });
    sendSuccess(res, transaction, 'ট্রানজেকশন আপডেট করা হয়েছে');
});
// ========================================
// 5. ট্রানজেকশন ডিলিট
// ========================================
export const deleteTransaction = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const { id } = req.params;
    await TransactionService.deleteTransaction(id, userId);
    sendSuccess(res, null, 'ট্রানজেকশন ডিলিট করা হয়েছে');
});
// ========================================
// 6. ট্রানজেকশন সামারি
// ========================================
export const getTransactionSummary = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const period = req.query.period || 'month';
    const summary = await TransactionService.getTransactionSummary(userId, period);
    sendSuccess(res, summary, 'ট্রানজেকশন সামারি পাওয়া গেছে');
});
// ========================================
// 7. ক্যাটাগরি বিশ্লেষণ
// ========================================
export const getCategoryAnalysis = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    if (!startDate || !endDate) {
        return sendError(res, 'সঠিক তারিখ প্রদান করুন', 400);
    }
    const analysis = await TransactionService.getCategoryAnalysis(userId, startDate, endDate);
    sendSuccess(res, analysis, 'ক্যাটাগরি বিশ্লেষণ পাওয়া গেছে');
});
// ========================================
// 8. বাল্ক ইম্পোর্ট (Fix: result.count)
// ========================================
export const bulkImportTransactions = catchAsync(async (req, res) => {
    const userId = req.user?.id;
    const { transactions } = req.body;
    if (!transactions || !Array.isArray(transactions)) {
        return sendError(res, 'ট্রানজেকশনের তালিকা প্রয়োজন', 400);
    }
    const result = await TransactionService.bulkImportTransactions(userId, transactions);
    // ✅ Prisma BatchPayload এ .success থাকে না, .count থাকে।
    sendSuccess(res, result, `${result.count}টি ট্রানজেকশন ইম্পোর্ট করা হয়েছে`);
});
