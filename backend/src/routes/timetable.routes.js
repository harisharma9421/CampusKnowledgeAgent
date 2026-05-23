import { Router } from 'express';
import { authenticate, authorizeStaff } from '../middleware/auth.middleware.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.middleware.js';
import {
  documentParamsSchema,
  timetableCreateSchema,
  timetableQuerySchema,
  timetableUpdateSchema,
} from '../validators/academic.validator.js';
import {
  createTimetable,
  getTimetable,
  updateTimetable,
} from '../controllers/academic.controller.js';

const router = Router();

router.get('/', authenticate, validateQuery(timetableQuerySchema), getTimetable);
router.post('/', authenticate, authorizeStaff, validateBody(timetableCreateSchema), createTimetable);
router.put(
  '/:id',
  authenticate,
  authorizeStaff,
  validateParams(documentParamsSchema),
  validateBody(timetableUpdateSchema),
  updateTimetable
);

export default router;
