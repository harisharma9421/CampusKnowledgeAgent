/**
 * API Router — Version 1
 * Central router that mounts all versioned API route modules.
 * All routes are prefixed with /api/v1 from the Express app.
 */

import { Router } from 'express';

import authRoutes from './auth.routes.js';
// import chatRoutes from './chat.routes.js';
// import timetableRoutes from './timetable.routes.js';
// import noticeRoutes from './notice.routes.js';
// import eventRoutes from './event.routes.js';
// import facultyRoutes from './faculty.routes.js';
// import faqRoutes from './faq.routes.js';

const router = Router();

/**
 * API v1 status endpoint.
 * Returns a summary of all available route namespaces.
 */
router.get('/', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Campus Knowledge Agent API v1',
    data: {
      version: 'v1',
      availableRoutes: [
        'GET  /api/v1/           — API info',
        'GET  /health            — Health check',
        'POST /api/v1/auth/register — Register account',
        'POST /api/v1/auth/login    — Login',
        'GET  /api/v1/auth/me       — Current user (protected)',
        'GET  /api/v1/auth/verify   — Verify JWT',
        'POST /api/v1/auth/logout   — Logout',
        'POST /api/v1/chat       — [Phase 6] AI Chatbot',
        'GET  /api/v1/timetable  — [Phase 5] Timetable',
        'GET  /api/v1/notices    — [Phase 5] Notices',
        'GET  /api/v1/events     — [Phase 5] Events',
        'GET  /api/v1/faculty    — [Phase 5] Faculty',
        'GET  /api/v1/faq        — [Phase 5] FAQ',
      ],
      timestamp: new Date().toISOString(),
    },
  });
});

router.use('/auth', authRoutes);
// router.use('/chat', chatRoutes);
// router.use('/timetable', timetableRoutes);
// router.use('/notices', noticeRoutes);
// router.use('/events', eventRoutes);
// router.use('/faculty', facultyRoutes);
// router.use('/faq', faqRoutes);

export default router;
