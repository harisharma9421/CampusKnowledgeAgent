import asyncHandler from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as academicService from '../services/academic.service.js';

export const getTimetable = asyncHandler(async (req, res) => {
  const result = await academicService.getTimetable(req.validatedQuery, req.user);
  return sendSuccess(res, result.data, 'Timetable retrieved successfully', result.meta);
});

export const getNotices = asyncHandler(async (req, res) => {
  const result = await academicService.getNotices(req.validatedQuery, req.user);
  return sendSuccess(res, result.data, 'Notices retrieved successfully', result.meta);
});

export const getEvents = asyncHandler(async (req, res) => {
  const result = await academicService.getEvents(req.validatedQuery, req.user);
  return sendSuccess(res, result.data, 'Events retrieved successfully', result.meta);
});

export const getFaculty = asyncHandler(async (req, res) => {
  const result = await academicService.getFaculty(req.validatedQuery, req.user);
  return sendSuccess(res, result.data, 'Faculty records retrieved successfully', result.meta);
});

export const getFaq = asyncHandler(async (req, res) => {
  const result = await academicService.getFaq(req.validatedQuery, req.user);
  return sendSuccess(res, result.data, 'FAQ entries retrieved successfully', result.meta);
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
  getNotices,
  getEvents,
  getFaculty,
  getFaq,
  getNotifications,
  markNotificationRead,
};
