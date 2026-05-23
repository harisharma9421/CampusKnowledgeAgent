/**
 * API Router - Version 1
 * Central router that mounts all versioned API route modules.
 * All routes are prefixed with /api/v1 from the Express app.
 */

import { Router } from 'express';

import authRoutes from './auth.routes.js';
import chatRoutes from './chat.routes.js';
import timetableRoutes from './timetable.routes.js';
import noticeRoutes from './notice.routes.js';
import eventRoutes from './event.routes.js';
import facultyRoutes from './faculty.routes.js';
import faqRoutes from './faq.routes.js';
import notificationRoutes from './notification.routes.js';
import aiTestRoutes from './aiTest.routes.js';

const router = Router();

router.get('/', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Campus Knowledge Agent API v1',
    data: {
      version: 'v1',
      availableRoutes: [
        'GET  /api/v1/                  - API info',
        'GET  /health                   - Health check',
        'POST /api/v1/auth/register     - Register account',
        'POST /api/v1/auth/login        - Login',
        'GET  /api/v1/auth/me           - Current user (protected)',
        'GET  /api/v1/auth/verify       - Verify JWT',
        'POST /api/v1/auth/logout       - Logout',
        'POST /api/v1/chat/query        - AI chatbot orchestration',
        'GET  /api/v1/timetable         - Timetable',
        'GET  /api/v1/notices           - Notices',
        'GET  /api/v1/events            - Events',
        'GET  /api/v1/faculty           - Faculty',
        'GET  /api/v1/faq               - FAQ',
        'GET  /api/v1/notifications     - Notifications',
        'POST /api/v1/ai/test/intent    - Intent diagnostics',
        'POST /api/v1/ai/test/embedding - Embedding diagnostics',
        'POST /api/v1/ai/test/semantic-search - Semantic retrieval diagnostics',
        'GET  /api/v1/ai/test/faiss-health - FAISS health',
      ],
      timestamp: new Date().toISOString(),
    },
  });
});

router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/timetable', timetableRoutes);
router.use('/notices', noticeRoutes);
router.use('/events', eventRoutes);
router.use('/faculty', facultyRoutes);
router.use('/faq', faqRoutes);
router.use('/notifications', notificationRoutes);
router.use('/ai', aiTestRoutes);

export default router;
