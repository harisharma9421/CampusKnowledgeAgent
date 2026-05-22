import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { chatQuerySchema } from '../validators/academic.validator.js';
import { testIntent } from '../controllers/aiTest.controller.js';

const router = Router();

router.post('/test/intent', authenticate, validateBody(chatQuerySchema), testIntent);

export default router;
