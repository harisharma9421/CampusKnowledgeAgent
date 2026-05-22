import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { chatQuerySchema } from '../validators/academic.validator.js';
import { queryChat } from '../controllers/chat.controller.js';

const router = Router();

router.post('/query', authenticate, validateBody(chatQuerySchema), queryChat);

export default router;
