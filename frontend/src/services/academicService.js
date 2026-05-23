import apiClient from './apiClient.js';

export const getTimetable = (params = {}) => apiClient.get('/timetable', { params });
export const createTimetable = (payload) => apiClient.post('/timetable', payload);
export const updateTimetable = (id, payload) => apiClient.put(`/timetable/${id}`, payload);

export const getNotices = (params = {}) => apiClient.get('/notices', { params });
export const createNotice = (payload) => apiClient.post('/notices', payload);
export const updateNotice = (id, payload) => apiClient.put(`/notices/${id}`, payload);

export const getEvents = (params = {}) => apiClient.get('/events', { params });
export const createEvent = (payload) => apiClient.post('/events', payload);
export const updateEvent = (id, payload) => apiClient.put(`/events/${id}`, payload);

export const getFaculty = (params = {}) => apiClient.get('/faculty', { params });

export const getFaq = (params = {}) => apiClient.get('/faq', { params });
export const createFaq = (payload) => apiClient.post('/faq', payload);
export const updateFaq = (id, payload) => apiClient.put(`/faq/${id}`, payload);

export const getNotifications = (params = {}) => apiClient.get('/notifications', { params });

export const markNotificationRead = (id) => apiClient.patch(`/notifications/${id}/read`);

export default {
  getTimetable,
  createTimetable,
  updateTimetable,
  getNotices,
  createNotice,
  updateNotice,
  getEvents,
  createEvent,
  updateEvent,
  getFaculty,
  getFaq,
  createFaq,
  updateFaq,
  getNotifications,
  markNotificationRead,
};
