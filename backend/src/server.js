/**
 * Server Entry Point
 * Initializes the HTTP server, connects to external services,
 * and handles graceful shutdown.
 */

import app from './app.js';
import env from './configs/env.js';
import logger from './utils/logger.js';
import { initializeFirebase } from './configs/firebase.js';

const startServer = async () => {
  // Initialize Firebase Admin SDK (non-blocking — warns if not configured)
  await initializeFirebase();

  const server = app.listen(env.PORT, env.HOST, () => {
    logger.info('═══════════════════════════════════════════════════');
    logger.info('  Campus Knowledge Agent — Backend API');
    logger.info('═══════════════════════════════════════════════════');
    logger.info(`  Environment : ${env.NODE_ENV}`);
    logger.info(`  Server      : http://${env.HOST}:${env.PORT}`);
    logger.info(`  API Base    : http://${env.HOST}:${env.PORT}/api/${env.API_VERSION}`);
    logger.info(`  Health      : http://${env.HOST}:${env.PORT}/health`);
    logger.info('═══════════════════════════════════════════════════');
  });

  // ── Graceful Shutdown ────────────────────────────────────────────────────────
  const shutdown = (signal) => {
    logger.info(`[Server] Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      logger.info('[Server] HTTP server closed.');
      process.exit(0);
    });

    // Force exit after 10 seconds if graceful shutdown hangs
    setTimeout(() => {
      logger.error('[Server] Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // ── Unhandled Rejections & Exceptions ────────────────────────────────────────
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('[Server] Unhandled Promise Rejection:', { reason, promise });
  });

  process.on('uncaughtException', (error) => {
    logger.error('[Server] Uncaught Exception:', error);
    process.exit(1);
  });

  return server;
};

startServer();
