import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth.middleware.js';
import { validateRequest } from '../../../middlewares/validation.middleware.js';
// ✅ ১. কন্ট্রোলার থেকে সব ফাংশন ইম্পোর্ট করা হয়েছে
import { createTransaction, getAllTransactions, getTransactionSummary, getCategoryAnalysis, bulkImportTransactions, getTransactionById, updateTransaction, deleteTransaction } from './transaction.controller.js';
// ✅ ২. সব ভ্যালিডেশন স্কিমা ইম্পোর্ট করা হয়েছে
import { createTransactionSchema, transactionListSchema, bulkImportSchema, transactionIdParamSchema, updateTransactionSchema } from './transaction.validation.js';
const router = Router();
// সব রাউটের জন্য অথেন্টিকেশন প্রয়োজন
router.use(authenticate);
// ========================================
// ========== ট্রানজেকশন রাউট ==========
// ========================================
/**
 * @route   POST /api/v1/transactions
 * @desc    নতুন ট্রানজেকশন তৈরি
 */
router.post('/', validateRequest(createTransactionSchema), createTransaction);
/**
 * @route   GET /api/v1/transactions
 * @desc    সব ট্রানজেকশন পাওয়া (পেজিনেশন + ফিল্টার)
 */
router.get('/', validateRequest(transactionListSchema), getAllTransactions);
/**
 * @route   GET /api/v1/transactions/summary
 * @desc    ট্রানজেকশন সামারি (ড্যাশবোর্ডের জন্য)
 */
router.get('/summary', getTransactionSummary);
/**
 * @route   GET /api/v1/transactions/category-analysis
 * @desc    ক্যাটাগরি ভিত্তিক বিশ্লেষণ
 */
router.get('/category-analysis', getCategoryAnalysis);
/**
 * @route   POST /api/v1/transactions/bulk-import
 * @desc    বাল্ক ট্রানজেকশন ইম্পোর্ট
 */
router.post('/bulk-import', validateRequest(bulkImportSchema), bulkImportTransactions);
/**
 * @route   GET /api/v1/transactions/:id
 * @desc    নির্দিষ্ট ট্রানজেকশন পাওয়া
 */
router.get('/:id', validateRequest(transactionIdParamSchema), getTransactionById);
/**
 * @route   PUT /api/v1/transactions/:id
 * @desc    ট্রানজেকশন আপডেট
 */
router.put('/:id', validateRequest(updateTransactionSchema), updateTransaction);
/**
 * @route   DELETE /api/v1/transactions/:id
 * @desc    ট্রানজেকশন ডিলিট
 */
router.delete('/:id', validateRequest(transactionIdParamSchema), deleteTransaction);
export const TransactionRoutes = router;
