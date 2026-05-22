/**
 * Response Utility
 * Provides standardized HTTP response helpers for Express controllers.
 * Enforces a consistent API response envelope across all endpoints.
 */

// HTTP status codes (inlined to avoid cross-package import complexity)
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

/**
 * Sends a 200 OK success response.
 * @param {import('express').Response} res
 * @param {*} data
 * @param {string} message
 * @param {object|null} meta
 */
export const sendSuccess = (res, data = null, message = 'Request successful', meta = null) => {
  const payload = {
    status: 'success',
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  if (meta) {
    payload.meta = meta;
  }
  return res.status(HTTP_STATUS.OK).json(payload);
};

/**
 * Sends a 201 Created response.
 * @param {import('express').Response} res
 * @param {*} data
 * @param {string} message
 */
export const sendCreated = (res, data = null, message = 'Resource created successfully') => {
  return res.status(HTTP_STATUS.CREATED).json({
    status: 'success',
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Sends a 400 Bad Request error response.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {*} details
 */
export const sendBadRequest = (res, message = 'Bad request', details = null) => {
  const payload = {
    status: 'error',
    message,
    timestamp: new Date().toISOString(),
  };
  if (details) {
    payload.details = details;
  }
  return res.status(HTTP_STATUS.BAD_REQUEST).json(payload);
};

/**
 * Sends a 401 Unauthorized response.
 * @param {import('express').Response} res
 * @param {string} message
 */
export const sendUnauthorized = (res, message = 'Unauthorized') => {
  return res.status(HTTP_STATUS.UNAUTHORIZED).json({
    status: 'error',
    message,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Sends a 403 Forbidden response.
 * @param {import('express').Response} res
 * @param {string} message
 */
export const sendForbidden = (res, message = 'Forbidden') => {
  return res.status(HTTP_STATUS.FORBIDDEN).json({
    status: 'error',
    message,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Sends a 404 Not Found response.
 * @param {import('express').Response} res
 * @param {string} message
 */
export const sendNotFound = (res, message = 'Resource not found') => {
  return res.status(HTTP_STATUS.NOT_FOUND).json({
    status: 'error',
    message,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Sends a 500 Internal Server Error response.
 * @param {import('express').Response} res
 * @param {string} message
 */
export const sendServerError = (res, message = 'Internal server error') => {
  return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    message,
    timestamp: new Date().toISOString(),
  });
};
