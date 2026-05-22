import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateQuery } from '../middleware/validate.middleware.js';
import { timetableQuerySchema } from '../validators/academic.validator.js';
import { getTimetable } from '../controllers/academic.controller.js';

const router = Router();

router.get('/', authenticate, validateQuery(timetableQuerySchema), getTimetable);

export default router;
