import { Router } from 'express';
import { authenticate, authorize } from '../../../middlewares/auth.middleware.js';
import { validateRequest } from '../../../middlewares/validation.middleware.js';
import {
  cancelSubscription,
  createSubscription,
  deleteSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  getSubscriptionSummary,
  processRenewals,
  reactivateSubscription,
  sendReminders,
  updateSubscription,
} from './subscription.controller.js';
import {
  createSubscriptionSchema,
  subscriptionIdParamSchema,
  subscriptionListSchema,
  updateSubscriptionSchema,
} from './subscription.validation.js';

const router = Router();

router.use(authenticate);

// ========================================
// 🟢 ইউজার সাবস্ক্রিপশন রাউটস
// ========================================


router.get('/summary', getSubscriptionSummary);

router.post(
  '/',
  validateRequest(createSubscriptionSchema),
  createSubscription
);


router.get(
  '/',
  validateRequest(subscriptionListSchema),
  getAllSubscriptions
);


router.get(
  '/:id',
  validateRequest(subscriptionIdParamSchema),
  getSubscriptionById
);


router.put(
  '/:id',
  validateRequest(updateSubscriptionSchema),
  updateSubscription
);

router.post(
  '/:id/cancel',
  validateRequest(subscriptionIdParamSchema),
  cancelSubscription
);

router.post(
  '/:id/reactivate',
  validateRequest(subscriptionIdParamSchema),
  reactivateSubscription
);


router.delete(
  '/:id',
  validateRequest(subscriptionIdParamSchema),
  deleteSubscription
);


router.use(authorize('ADMIN'));

router.post('/admin/process-renewals', processRenewals);


 
router.post('/admin/send-reminders', sendReminders);



export const  SubscriptionRoutes = router;