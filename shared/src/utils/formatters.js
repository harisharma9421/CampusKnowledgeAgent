/**
 * Shared Formatter Utilities
 * Pure formatting functions reusable across frontend and backend.
 */

/**
 * Formats a Date object or ISO string to a human-readable date string.
 * @param {Date|string} date
 * @returns {string}
 */
export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Formats a Date object or ISO string to a time string.
 * @param {Date|string} date
 * @returns {string}
 */
export const formatTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Capitalizes the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Converts a snake_case string to Title Case.
 * @param {string} str
 * @returns {string}
 */
export const snakeToTitle = (str) => {
  if (!str) return '';
  return str
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
};

/**
 * Truncates a string to a max length and appends ellipsis.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export const truncate = (str, maxLength = 100) => {
  if (!str || str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
};
