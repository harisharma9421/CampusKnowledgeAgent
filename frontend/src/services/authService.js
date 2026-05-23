/**
 * Authentication API service.
 */

import apiClient from './apiClient.js';

/**
 * @param {{ identifier: string, password: string }} payload
 */
export const login = async (payload) => {
  const response = await apiClient.post('/auth/login', payload);
  return response.data;
};

export const logout = async () => {
  const response = await apiClient.post('/auth/logout');
  return response.data;
};

export const getMe = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

export const verifyToken = async () => {
  const response = await apiClient.get('/auth/verify');
  return response.data;
};

export default { login, logout, getMe, verifyToken };
