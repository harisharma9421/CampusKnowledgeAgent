import { Router } from 'express';
import { authenticate, authorizeStaff } from '../middleware/auth.middleware.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.middleware.js';
import {
  documentParamsSchema,
  eventCreateSchema,
  eventsQuerySchema,
  eventUpdateSchema,
} from '../validators/academic.validator.js';
import { createEvent, getEvents, updateEvent } from '../controllers/academic.controller.js';

const router = Router();

router.get('/', authenticate, validateQuery(eventsQuerySchema), getEvents);
router.post('/', authenticate, authorizeStaff, validateBody(eventCreateSchema), createEvent);
router.put(
  '/:id',
  authenticate,
  authorizeStaff,
  validateParams(documentParamsSchema),
  validateBody(eventUpdateSchema),
  updateEvent
);

export default router;
