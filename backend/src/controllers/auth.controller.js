/**
 * Authentication controller — register, login, profile, verify.
 */

import asyncHandler from '../utils/asyncHandler.js';
import { sendCreated, sendSuccess } from '../utils/response.js';
import * as authService from '../services/auth.service.js';

/**
 * POST /api/v1/auth/register
 */
export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  return sendCreated(res, result, 'Account created successfully');
});

/**
 * POST /api/v1/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  return sendSuccess(res, result, 'Login successful');
});

/**
 * GET /api/v1/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
  const profile = await authService.getUserProfile(req.auth.userId);
  return sendSuccess(res, { user: profile }, 'Profile retrieved successfully');
});

/**
 * GET /api/v1/auth/verify
 */
export const verifyToken = asyncHandler(async (req, res) => {
  return sendSuccess(
    res,
    {
      valid: true,
      userId: req.auth.userId,
      email: req.auth.email,
      role: req.auth.role,
    },
    'Token is valid'
  );
});

/**
 * POST /api/v1/auth/logout
 * Stateless JWT — client clears token; endpoint acknowledges logout.
 */
export const logout = asyncHandler(async (_req, res) => {
  return sendSuccess(res, null, 'Logged out successfully');
});

export default { register, login, getMe, verifyToken, logout };
