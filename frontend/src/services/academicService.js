import apiClient from './apiClient.js';

export const getTimetable = (params = {}) => apiClient.get('/timetable', { params });

export const getNotices = (params = {}) => apiClient.get('/notices', { params });

export const getEvents = (params = {}) => apiClient.get('/events', { params });

export const getFaculty = (params = {}) => apiClient.get('/faculty', { params });

export const getFaq = (params = {}) => apiClient.get('/faq', { params });

export const getNotifications = (params = {}) => apiClient.get('/notifications', { params });

export const markNotificationRead = (id) => apiClient.patch(`/notifications/${id}/read`);

export default {
  getTimetable,
  getNotices,
  getEvents,
  getFaculty,
  getFaq,
  getNotifications,
  markNotificationRead,
};
