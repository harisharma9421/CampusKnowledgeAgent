import { Router } from 'express';
import { authenticate, authorizeStaff } from '../middleware/auth.middleware.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.middleware.js';
import {
  notificationParamsSchema,
  notificationTriggerSchema,
  notificationsQuerySchema,
} from '../validators/academic.validator.js';
import {
  getNotifications,
  markNotificationRead,
} from '../controllers/academic.controller.js';
import {
  getNotificationHealth,
  triggerNotification,
} from '../controllers/notification.controller.js';

const router = Router();

router.get('/', authenticate, validateQuery(notificationsQuerySchema), getNotifications);
router.get('/health', authenticate, getNotificationHealth);
router.post('/trigger', authenticate, authorizeStaff, validateBody(notificationTriggerSchema), triggerNotification);
router.patch('/:id/read', authenticate, validateParams(notificationParamsSchema), markNotificationRead);

export default router;
