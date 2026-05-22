import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateQuery } from '../middleware/validate.middleware.js';
import { eventsQuerySchema } from '../validators/academic.validator.js';
import { getEvents } from '../controllers/academic.controller.js';

const router = Router();

router.get('/', authenticate, validateQuery(eventsQuerySchema), getEvents);

export default router;
