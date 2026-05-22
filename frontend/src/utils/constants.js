/**
 * Frontend Constants
 * App-wide constant values used across components.
 */

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Campus Knowledge Agent';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'campus_token',
  USER: 'campus_user',
  THEME: 'campus_theme',
};

export const QUERY_KEYS = {
  HEALTH: 'health',
  TIMETABLE: 'timetable',
  NOTICES: 'notices',
  EVENTS: 'events',
  FACULTY: 'faculty',
  FAQ: 'faq',
  CHAT: 'chat',
};
