/**
 * Express Application Factory
 * Configures and returns the Express app instance.
 * Separated from server.js to allow clean testing without starting the HTTP server.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import env from './configs/env.js';
import logger from './utils/logger.js';
import requestLogger from './middleware/requestLogger.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import errorHandler from './middleware/errorHandler.js';
import notFound from './middleware/notFound.js';
import healthRoutes from './routes/health.routes.js';
import apiV1Router from './routes/index.js';
import chatRoutes from './routes/chat.routes.js';

const app = express();

// ── Security Headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) {
        return callback(null, true);
      }
      if (env.CORS_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      logger.warn(`[CORS] Blocked request from origin: ${origin}`);
      return callback(new Error(`CORS policy: origin ${origin} is not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// ── Body Parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── HTTP Request Logging ──────────────────────────────────────────────────────
app.use(requestLogger);

// ── Rate Limiting ─────────────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/health', healthRoutes);
app.use(`/api/${env.API_VERSION}`, apiV1Router);
app.use('/api/chat', chatRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use(notFound);

// ── Centralized Error Handler (must be last) ──────────────────────────────────
app.use(errorHandler);

export default app;
