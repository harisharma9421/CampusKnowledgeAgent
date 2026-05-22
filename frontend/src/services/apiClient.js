/**
 * Axios API Client
 * Centralized HTTP client with request/response interceptors.
 * All API calls in the app must go through this instance.
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_VERSION = 'v1';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

// ── Request Interceptor ───────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    // Attach JWT token when available (Phase 3)
    const token = localStorage.getItem('campus_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => {
    // Unwrap the standard API envelope — return the inner `data` field
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 — clear token and redirect to login (Phase 3)
      if (status === 401) {
        localStorage.removeItem('campus_token');
        // window.location.href = '/login'; // Uncomment in Phase 3
      }

      // Normalize error shape
      const normalizedError = new Error(data?.message || 'An error occurred');
      normalizedError.status = status;
      normalizedError.code = data?.code || null;
      normalizedError.details = data?.details || null;
      return Promise.reject(normalizedError);
    }

    if (error.request) {
      // Network error — no response received
      const networkError = new Error('Network error. Please check your connection.');
      networkError.status = 0;
      return Promise.reject(networkError);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
