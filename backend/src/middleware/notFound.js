/**
 * 404 Not Found Middleware
 * Catches all requests that don't match any registered route
 * and forwards a structured 404 error to the error handler.
 */

import { AppError } from './errorHandler.js';

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} _res
 * @param {import('express').NextFunction} next
 */
const notFound = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'ROUTE_NOT_FOUND'));
};

export default notFound;
