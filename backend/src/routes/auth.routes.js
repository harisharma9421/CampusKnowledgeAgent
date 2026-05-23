/**
 * Authentication routes — /api/v1/auth
 */

import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { loginSchema } from '../validators/auth.validator.js';
import { authenticate, authenticateTokenOnly } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/login', validateBody(loginSchema), authController.login);
router.post('/logout', authController.logout);

router.get('/me', authenticate, authController.getMe);
router.get('/verify', authenticateTokenOnly, authController.verifyToken);

export default router;
