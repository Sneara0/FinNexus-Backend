import { Router } from 'express';
import { GoalController } from './goal.controller.js'; // ✅ চেক করুন ফাইল পাথ ঠিক আছে কি না
// ✅ সাধারণত এটি middlewares ফোল্ডারে থাকে
import { createGoalSchema, goalIdParamSchema, goalListSchema, addRemoveAmountSchema, updateGoalSchema } from './goal.validation.js';
import { authenticate } from '../../../middlewares/index.js';
import { validateRequest } from '../../../middlewares/validation.middleware.js';
const router = Router();
// সব রাউটের জন্য অথেন্টিকেশন প্রয়োজন হলে
router.use(authenticate);
router.post('/create', validateRequest(createGoalSchema), GoalController.createGoal);
router.get('/', validateRequest(goalListSchema), GoalController.getAllGoals);
router.get('/dashboard', GoalController.getGoalDashboard);
router.get('/:id', validateRequest(goalIdParamSchema), GoalController.getGoalById);
router.patch('/add-amount/:id', validateRequest(addRemoveAmountSchema), GoalController.addToGoal);
router.patch('/remove-amount/:id', validateRequest(addRemoveAmountSchema), GoalController.removeFromGoal);
router.patch('/complete/:id', validateRequest(goalIdParamSchema), GoalController.completeGoal);
router.patch('/:id', validateRequest(updateGoalSchema), GoalController.updateGoal);
router.delete('/:id', validateRequest(goalIdParamSchema), GoalController.deleteGoal);
export const GoalRoutes = router;
