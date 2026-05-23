import asyncHandler from '../utils/asyncHandler.js';
import { sendCreated, sendSuccess } from '../utils/response.js';
import * as academicService from '../services/academic.service.js';

export const getTimetable = asyncHandler(async (req, res) => {
  const result = await academicService.getTimetable(req.validatedQuery, req.user);
  return sendSuccess(res, result.data, 'Timetable retrieved successfully', result.meta);
});

export const createTimetable = asyncHandler(async (req, res) => {
  const result = await academicService.createTimetable(req.body, req.user);
  return sendCreated(res, result, 'Timetable created and students notified');
});

export const updateTimetable = asyncHandler(async (req, res) => {
  const result = await academicService.updateTimetable(req.params.id, req.body, req.user);
  return sendSuccess(res, result, 'Timetable updated and students notified');
});

export const getNotices = asyncHandler(async (req, res) => {
  const result = await academicService.getNotices(req.validatedQuery, req.user);
  return sendSuccess(res, result.data, 'Notices retrieved successfully', result.meta);
});

export const createNotice = asyncHandler(async (req, res) => {
  const result = await academicService.createNotice(req.body, req.user);
  return sendCreated(res, result, 'Notice created and students notified');
});

export const updateNotice = asyncHandler(async (req, res) => {
  const result = await academicService.updateNotice(req.params.id, req.body, req.user);
  return sendSuccess(res, result, 'Notice updated and students notified');
});

export const getEvents = asyncHandler(async (req, res) => {
  const result = await academicService.getEvents(req.validatedQuery, req.user);
  return sendSuccess(res, result.data, 'Events retrieved successfully', result.meta);
});

export const createEvent = asyncHandler(async (req, res) => {
  const result = await academicService.createEvent(req.body, req.user);
  return sendCreated(res, result, 'Event created and students notified');
});

export const updateEvent = asyncHandler(async (req, res) => {
  const result = await academicService.updateEvent(req.params.id, req.body, req.user);
  return sendSuccess(res, result, 'Event updated and students notified');
});

export const getFaculty = asyncHandler(async (req, res) => {
  const result = await academicService.getFaculty(req.validatedQuery, req.user);
  return sendSuccess(res, result.data, 'Faculty records retrieved successfully', result.meta);
});

export const getFaq = asyncHandler(async (req, res) => {
  const result = await academicService.getFaq(req.validatedQuery, req.user);
  return sendSuccess(res, result.data, 'FAQ entries retrieved successfully', result.meta);
});

export const createFaq = asyncHandler(async (req, res) => {
  const result = await academicService.createFaq(req.body, req.user);
  return sendCreated(res, result, 'FAQ entry created successfully');
});

export const updateFaq = asyncHandler(async (req, res) => {
  const result = await academicService.updateFaq(req.params.id, req.body, req.user);
  return sendSuccess(res, result, 'FAQ entry updated successfully');
});

export const getNotifications = asyncHandler(async (req, res) => {
  const result = await academicService.getNotifications(req.validatedQuery, req.user);
  return sendSuccess(res, result.data, 'Notifications retrieved successfully', result.meta);
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await academicService.markNotificationRead(req.params.id, req.user);
  return sendSuccess(res, { notification }, 'Notification marked as read');
});

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
