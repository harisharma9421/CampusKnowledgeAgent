/**
 * Async Handler Utility
 * Wraps async Express route handlers to automatically catch rejected promises
 * and forward them to the centralized error handling middleware.
 *
 * Usage:
 *   router.get('/route', asyncHandler(async (req, res) => { ... }));
 */

/**
 * @param {Function} fn - Async Express route handler
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
