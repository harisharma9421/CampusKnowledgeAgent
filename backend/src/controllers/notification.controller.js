import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as notificationService from '../services/notification.service.js';

export const triggerNotification = asyncHandler(async (req, res) => {
  const result = await notificationService.triggerNotification(req.body, req.user);
  return sendSuccess(res, result, 'Notification triggered successfully');
});

export const getNotificationHealth = asyncHandler(async (_req, res) => {
  return sendSuccess(
    res,
    notificationService.getNotificationHealth(),
    'Notification service health retrieved successfully'
  );
});

export default { triggerNotification, getNotificationHealth };

