/**
 * Winston Logger Utility
 * Centralized structured logging for the backend service.
 * Outputs to console in development and to log files in production.
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';
import env from '../configs/env.js';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Ensure log directory exists
const logDir = path.resolve(process.cwd(), env.LOG_DIR);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Custom console format for development
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${ts}] ${level}: ${stack || message}${metaStr}`;
  })
);

// JSON format for production log files
const prodFormat = combine(timestamp(), errors({ stack: true }), json());

const transports = [];

// Always log to console
transports.push(
  new winston.transports.Console({
    format: env.isDevelopment() ? devFormat : prodFormat,
  })
);

// In production, also write to files
if (env.isProduction()) {
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: prodFormat,
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: prodFormat,
    })
  );
}

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  transports,
  exitOnError: false,
});

export default logger;
