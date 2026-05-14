import { Router } from 'express';
import * as CategoryRuleController from './categoryRule.controller.js';
import { bulkDeleteSchema } from './categoryRule.validation.js';
import { validateRequest } from '../../../middlewares/validation.middleware.js';
const router = Router();
// উদাহরণ: ইম্পোর্ট করার পর এভাবে ব্যবহার করুন
router.get('/suggestions', CategoryRuleController.getSuggestedRules);
router.delete('/bulk-delete', validateRequest(bulkDeleteSchema), CategoryRuleController.bulkDeleteRules);
export const CategoryRuleRoutes = router;
