/**
 * Centralized Error Handling Middleware
 * Catches all errors forwarded via next(error) and returns a consistent
 * JSON error response. Must be registered LAST in the Express middleware chain.
 */

import logger from '../utils/logger.js';
import env from '../configs/env.js';

/**
 * Application-level custom error class.
 * Allows controllers and services to throw structured errors.
 */
export class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {number} statusCode - HTTP status code
   * @param {string|null} code - Application error code (e.g. 'VALIDATION_ERROR')
   * @param {*} details - Optional extra details (validation errors, etc.)
   */
  constructor(message, statusCode = 500, code = null, details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Express error handling middleware.
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational === true;

  // Log all errors; use error level for 5xx, warn for 4xx
  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} — ${err.message}`, {
      statusCode,
      stack: err.stack,
    });
  } else {
    logger.warn(`[${req.method}] ${req.originalUrl} — ${err.message}`, { statusCode });
  }

  const payload = {
    status: 'error',
    message: isOperational ? err.message : 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
  };

  if (err.code) {
    payload.code = err.code;
  }

  if (err.details) {
    payload.details = err.details;
  }

  // Include stack trace only in development
  if (env.isDevelopment() && !isOperational) {
    payload.stack = err.stack;
  }

  return res.status(statusCode).json(payload);
};

export default errorHandler;
