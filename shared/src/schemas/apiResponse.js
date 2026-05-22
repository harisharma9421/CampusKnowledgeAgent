/**
 * API Response Schema Contract
 * Defines the standard response shape used across all API endpoints.
 * Both backend (Express) and frontend (Axios interceptors) rely on this contract.
 */

/**
 * Creates a standardized success response object.
 * @param {*} data - The response payload
 * @param {string} message - Human-readable success message
 * @param {object} meta - Optional pagination or extra metadata
 * @returns {object}
 */
export const successResponse = (data = null, message = 'Request successful', meta = null) => {
  const response = {
    status: 'success',
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  if (meta) response.meta = meta;
  return response;
};

/**
 * Creates a standardized error response object.
 * @param {string} message - Human-readable error message
 * @param {string|null} code - Application-level error code
 * @param {*} details - Optional error details (validation errors, etc.)
 * @returns {object}
 */
export const errorResponse = (message = 'An error occurred', code = null, details = null) => {
  const response = {
    status: 'error',
    message,
    timestamp: new Date().toISOString(),
  };
  if (code) response.code = code;
  if (details) response.details = details;
  return response;
};

/**
 * Creates a standardized paginated meta object.
 * @param {number} total - Total number of records
 * @param {number} page - Current page number
 * @param {number} limit - Records per page
 * @returns {object}
 */
export const paginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});
