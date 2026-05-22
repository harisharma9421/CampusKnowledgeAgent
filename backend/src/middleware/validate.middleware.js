/**
 * Request validation middleware using Zod schemas.
 */

import { AppError } from './errorHandler.js';

/**
 * Validates req.body against a Zod schema.
 * @param {import('zod').ZodType} schema
 */
export const validateBody = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || 'body',
      message: issue.message,
    }));

    return next(
      new AppError('Validation failed.', 400, 'VALIDATION_ERROR', details)
    );
  }

  req.body = result.data;
  return next();
};

/**
 * Validates req.query against a Zod schema.
 * @param {import('zod').ZodType} schema
 */
export const validateQuery = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.query);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || 'query',
      message: issue.message,
    }));

    return next(new AppError('Query validation failed.', 400, 'VALIDATION_ERROR', details));
  }

  req.validatedQuery = result.data;
  return next();
};

/**
 * Validates req.params against a Zod schema.
 * @param {import('zod').ZodType} schema
 */
export const validateParams = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.params);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || 'params',
      message: issue.message,
    }));

    return next(new AppError('Route parameter validation failed.', 400, 'VALIDATION_ERROR', details));
  }

  req.params = result.data;
  return next();
};

export default validateBody;
