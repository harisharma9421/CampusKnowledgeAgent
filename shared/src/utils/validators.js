/**
 * Shared Validation Utilities
 * Pure functions reusable across frontend and backend.
 */

/**
 * Validates an email address format.
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).toLowerCase());
};

/**
 * Validates that a string is non-empty after trimming.
 * @param {string} value
 * @returns {boolean}
 */
export const isNonEmpty = (value) => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Validates a string falls within a min/max length range.
 * @param {string} value
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */
export const isWithinLength = (value, min, max) => {
  if (typeof value !== 'string') return false;
  const len = value.trim().length;
  return len >= min && len <= max;
};

/**
 * Validates that a value is a positive integer.
 * @param {*} value
 * @returns {boolean}
 */
export const isPositiveInteger = (value) => {
  return Number.isInteger(value) && value > 0;
};
