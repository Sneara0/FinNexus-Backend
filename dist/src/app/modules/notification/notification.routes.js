import { Router } from 'express';
import { AuthRoutes } from '../auth/auth.routes.js';
import { UserRoutes } from '../user/user.routes.js';
import { BudgetRoutes } from '../budget/budget.routes.js';
import { GoalRoutes } from '../goal/goal.routes.js';
import { CategoryRuleRoutes } from '../categoryRule/categoryRule.routes.js';
import { AIRoutes } from '../ai/ai.routes.js';
const router = Router();
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'FinNexus API v1',
        version: '1.0.0',
        endpoints: {
            auth: '/api/v1/auth',
            users: '/api/v1/users',
            transactions: '/api/v1/transactions',
            budgets: '/api/v1/budgets',
            goals: '/api/v1/goals',
            'category-rules': '/api/v1/category-rules',
            notifications: '/api/v1/notifications',
            ai: '/api/v1/ai'
        },
        timestamp: new Date().toISOString()
    });
});
router.use('/auth', AuthRoutes);
router.use('/users', UserRoutes);
//router.use('/transactions', TransactionRoutes);
router.use('/budgets', BudgetRoutes);
router.use('/goals', GoalRoutes);
router.use('/category-rules', CategoryRuleRoutes);
router.use('/ai', AIRoutes);
export const NotificationRoutes = router;
