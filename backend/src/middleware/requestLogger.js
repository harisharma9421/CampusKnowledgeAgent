/**
 * HTTP Request Logger Middleware
 * Uses Morgan to log incoming HTTP requests.
 * Integrates with Winston so all logs go through the same transport.
 */

import morgan from 'morgan';
import logger from '../utils/logger.js';
import env from '../configs/env.js';

// Stream that pipes Morgan output into Winston
const stream = {
  write: (message) => logger.http(message.trim()),
};

// Use 'dev' format in development, 'combined' in production
const format = env.isDevelopment() ? 'dev' : 'combined';

const requestLogger = morgan(format, { stream });

export default requestLogger;
