/**
 * Rate Limiter Middleware
 * Protects the API from abuse using express-rate-limit.
 * Configurable via environment variables.
 */

import rateLimit from 'express-rate-limit';
import env from '../configs/env.js';

/**
 * General API rate limiter.
 * Applied to all /api/* routes.
 */
export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString(),
  },
  skip: () => env.isTest(),
});

/**
 * Stricter limiter for sensitive endpoints (auth, chat).
 */
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests on this endpoint. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString(),
  },
  skip: () => env.isTest(),
});
