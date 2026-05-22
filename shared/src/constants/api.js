/**
 * API Constants — Shared across frontend and backend
 * Defines all API route prefixes, versions, and endpoint keys.
 */

export const API_VERSION = 'v1';
export const API_BASE_PATH = `/api/${API_VERSION}`;

/**
 * Route namespaces used by both frontend (axios) and backend (express router).
 */
export const API_ROUTES = {
  HEALTH: '/health',
  AUTH: `${API_BASE_PATH}/auth`,
  CHAT: `${API_BASE_PATH}/chat`,
  TIMETABLE: `${API_BASE_PATH}/timetable`,
  NOTICES: `${API_BASE_PATH}/notices`,
  EVENTS: `${API_BASE_PATH}/events`,
  FACULTY: `${API_BASE_PATH}/faculty`,
  FAQ: `${API_BASE_PATH}/faq`,
  STUDENTS: `${API_BASE_PATH}/students`,
  ADMIN: `${API_BASE_PATH}/admin`,
};

/**
 * AI Engine internal route prefixes (used by backend to call ai-engine).
 */
export const AI_ENGINE_ROUTES = {
  HEALTH: '/health',
  INFER: '/infer',
  CLASSIFY: '/classify',
  EMBED: '/embed',
  SEARCH: '/search',
};
