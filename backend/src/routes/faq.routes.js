import { Router } from 'express';
import { authenticate, authorizeStaff } from '../middleware/auth.middleware.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.middleware.js';
import {
  documentParamsSchema,
  faqCreateSchema,
  faqQuerySchema,
  faqUpdateSchema,
} from '../validators/academic.validator.js';
import { createFaq, getFaq, updateFaq } from '../controllers/academic.controller.js';

const router = Router();

router.get('/', authenticate, validateQuery(faqQuerySchema), getFaq);
router.post('/', authenticate, authorizeStaff, validateBody(faqCreateSchema), createFaq);
router.put(
  '/:id',
  authenticate,
  authorizeStaff,
  validateParams(documentParamsSchema),
  validateBody(faqUpdateSchema),
  updateFaq
);

export default router;
