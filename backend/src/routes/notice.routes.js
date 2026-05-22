import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateQuery } from '../middleware/validate.middleware.js';
import { noticesQuerySchema } from '../validators/academic.validator.js';
import { getNotices } from '../controllers/academic.controller.js';

const router = Router();

router.get('/', authenticate, validateQuery(noticesQuerySchema), getNotices);

export default router;
