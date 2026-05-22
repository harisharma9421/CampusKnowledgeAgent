/**
 * Auth token and user persistence in localStorage.
 */

import { STORAGE_KEYS } from './constants.js';

export const getStoredToken = () => localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

export const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } else {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }
};

export const getStoredUser = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.USER);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(STORAGE_KEYS.USER);
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
};

export const clearAuthStorage = () => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};
