import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateQuery } from '../middleware/validate.middleware.js';
import { facultyQuerySchema } from '../validators/academic.validator.js';
import { getFaculty } from '../controllers/academic.controller.js';

const router = Router();

router.get('/', authenticate, validateQuery(facultyQuerySchema), getFaculty);

export default router;
