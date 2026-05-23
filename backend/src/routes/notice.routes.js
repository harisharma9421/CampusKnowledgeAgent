import { Router } from 'express';
import { authenticate, authorizeStaff } from '../middleware/auth.middleware.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.middleware.js';
import {
  documentParamsSchema,
  noticeCreateSchema,
  noticesQuerySchema,
  noticeUpdateSchema,
} from '../validators/academic.validator.js';
import { createNotice, getNotices, updateNotice } from '../controllers/academic.controller.js';

const router = Router();

router.get('/', authenticate, validateQuery(noticesQuerySchema), getNotices);
router.post('/', authenticate, authorizeStaff, validateBody(noticeCreateSchema), createNotice);
router.put(
  '/:id',
  authenticate,
  authorizeStaff,
  validateParams(documentParamsSchema),
  validateBody(noticeUpdateSchema),
  updateNotice
);

export default router;
