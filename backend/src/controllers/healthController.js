/**
 * Health Check Controller
 * Provides system health status for monitoring and readiness checks.
 */

import asyncHandler from '../utils/asyncHandler.js';
import env from '../configs/env.js';
import { isFirebaseReady } from '../configs/firebase.js';

/**
 * GET /health
 * Returns the health status of the backend service.
 */
export const getHealth = asyncHandler(async (_req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  res.status(200).json({
    status: 'success',
    message: 'Campus Knowledge Agent API is running',
    data: {
      service: 'backend',
      version: env.API_VERSION,
      environment: env.NODE_ENV,
      uptime: `${Math.floor(uptime)}s`,
      memory: {
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      },
      firebase: {
        connected: isFirebaseReady(),
        emulator: env.FIREBASE_USE_EMULATOR,
      },
      auth: {
        enabled: true,
        strategy: 'jwt',
      },
      timestamp: new Date().toISOString(),
    },
  });
});
