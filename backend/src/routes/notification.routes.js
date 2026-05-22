import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateParams, validateQuery } from '../middleware/validate.middleware.js';
import {
  notificationParamsSchema,
  notificationsQuerySchema,
} from '../validators/academic.validator.js';
import {
  getNotifications,
  markNotificationRead,
} from '../controllers/academic.controller.js';

const router = Router();

router.get('/', authenticate, validateQuery(notificationsQuerySchema), getNotifications);
router.patch('/:id/read', authenticate, validateParams(notificationParamsSchema), markNotificationRead);

export default router;
