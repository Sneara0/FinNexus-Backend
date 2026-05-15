import { Router } from "express";
import { AuthRoutes } from "../app/modules/auth/auth.routes.js";
import { AIRoutes } from "../app/modules/ai/ai.routes.js";
import { UserRoutes } from "../app/modules/user/user.routes.js";
import { BudgetRoutes } from "../app/modules/budget/budget.routes.js";
import { GoalRoutes } from "../app/modules/goal/goal.routes.js";
import { CategoryRuleRoutes } from "../app/modules/categoryRule/categoryRule.routes.js";
import { NotificationRoutes } from "../app/modules/notification/notification.routes.js";
import { TransactionRoutes } from "../app/modules/transaction/transaction.routes.js";
import { AdminRoutes } from "../app/modules/admin/admin.routes.js";
import { SubscriptionRoutes } from "../app/modules/subscription/subscription.routes.js";


 // ✅ ইমপোর্ট করুন

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/ai",AIRoutes)
router.use("/users", UserRoutes);
router.use("/admins", AdminRoutes);
router.use("/budgets", BudgetRoutes);
router.use("/goals", GoalRoutes);
router.use("/category-rules", CategoryRuleRoutes); 
router.use("/notifications", NotificationRoutes);
router.use("/transactions", TransactionRoutes); 
router.use("/subscriptions", SubscriptionRoutes); // ✅ সাবস্ক্রিপশন রাউট যোগ করা হয়েছে
export const IndexRoutes = router;