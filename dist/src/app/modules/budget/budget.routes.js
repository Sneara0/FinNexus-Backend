import { Router } from 'express';
// ১. মিডলওয়্যার ইম্পোর্ট (validateRequest আপনার utils বা middlewares ফোল্ডারে আছে)
// ২. বাজেট ভ্যালিডেশন এবং কন্ট্রোলার ইম্পোর্ট (একই ফোল্ডারে থাকলে ./ ব্যবহার করুন)
import { BudgetValidation } from './budget.validation.js';
import { validateRequest } from '../../../middlewares/validation.middleware.js';
import { BudgetController } from './budget.controller.js';
const router = Router();
// বাজেট লিস্ট দেখা (ফিল্টারসহ)
router.get('/', validateRequest(BudgetValidation.budgetListSchema), BudgetController.getAllBudgets);
// বর্তমান মাসের বাজেট
router.get('/current-month', BudgetController.getCurrentMonthBudgets);
// বাজেট সামারি
router.get('/summary', BudgetController.getBudgetSummary);
// নির্দিষ্ট বাজেট দেখা
router.get('/:id', validateRequest(BudgetValidation.budgetIdParamSchema), BudgetController.getBudgetById);
// নতুন বাজেট তৈরি
router.post('/create-budget', validateRequest(BudgetValidation.createBudgetSchema), BudgetController.createBudget);
// বাজেট আপডেট
router.patch('/:id', validateRequest(BudgetValidation.updateBudgetSchema), BudgetController.updateBudget);
// বাজেট ডিলিট
router.delete('/:id', validateRequest(BudgetValidation.budgetIdParamSchema), BudgetController.deleteBudget);
export const BudgetRoutes = router;
