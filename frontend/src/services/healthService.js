/**
 * Health Service
 * Checks backend API availability.
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Pings the backend health endpoint.
 * Uses a direct axios call (not apiClient) to avoid auth interceptors.
 * @returns {Promise<object>} Health data
 */
export const checkBackendHealth = async () => {
  const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
  return response.data;
};
