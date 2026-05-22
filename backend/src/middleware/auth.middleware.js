/**
 * Authentication and authorization middleware.
 */

import { AppError } from './errorHandler.js';
import { AUTH_ERRORS } from '../constants/auth.js';
import { verifyAccessToken } from '../services/token.service.js';
import * as userRepository from '../repositories/user.repository.js';

/**
 * Extracts Bearer token from Authorization header.
 * @param {import('express').Request} req
 * @returns {string|null}
 */
const extractBearerToken = (req) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }
  return header.slice(7).trim();
};

/**
 * Requires a valid JWT. Attaches req.auth and req.user (profile).
 */
export const authenticate = async (req, _res, next) => {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      throw new AppError('Authentication required.', 401, AUTH_ERRORS.UNAUTHORIZED);
    }

    const decoded = verifyAccessToken(token);
    const userId = decoded.sub;

    const user = await userRepository.findUserById(userId);
    if (!user || !user.isActive) {
      throw new AppError('Authentication failed.', 401, AUTH_ERRORS.UNAUTHORIZED);
    }

    req.auth = {
      userId: user.id,
      email: user.email,
      role: user.role,
      token,
    };
    req.user = userRepository.sanitizeUser(user);

    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Lightweight JWT check without database lookup (for verify endpoint).
 */
export const authenticateTokenOnly = (req, _res, next) => {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      throw new AppError('Authentication required.', 401, AUTH_ERRORS.UNAUTHORIZED);
    }

    const decoded = verifyAccessToken(token);
    req.auth = {
      userId: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      token,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Restricts access to one or more roles.
 * @param  {...string} allowedRoles
 */
export const authorize =
  (...allowedRoles) =>
  (req, _res, next) => {
    if (!req.auth) {
      return next(new AppError('Authentication required.', 401, AUTH_ERRORS.UNAUTHORIZED));
    }

    if (!allowedRoles.includes(req.auth.role)) {
      return next(
        new AppError('You do not have permission to access this resource.', 403, AUTH_ERRORS.FORBIDDEN)
      );
    }

    return next();
  };

export const authorizeStudent = authorize('student');
export const authorizeFaculty = authorize('faculty');
export const authorizeAdmin = authorize('admin');
export const authorizeStaff = authorize('faculty', 'admin');

export default {
  authenticate,
  authenticateTokenOnly,
  authorize,
  authorizeStudent,
  authorizeFaculty,
  authorizeAdmin,
  authorizeStaff,
};
