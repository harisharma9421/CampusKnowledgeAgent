/**
 * JWT token service — sign, verify, and decode access tokens.
 */

import jwt from 'jsonwebtoken';
import env from '../configs/env.js';
import { AppError } from '../middleware/errorHandler.js';
import { AUTH_ERRORS } from '../constants/auth.js';

/**
 * Signs a JWT access token for an authenticated user.
 * @param {{ userId: string, email: string, role: string }} payload
 * @returns {string}
 */
export const signAccessToken = (payload) => {
  return jwt.sign(
    {
      sub: payload.userId,
      email: payload.email,
      role: payload.role,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN,
      issuer: 'campus-knowledge-agent',
      audience: 'campus-api',
    }
  );
};

/**
 * Verifies a JWT and returns the decoded payload.
 * @param {string} token
 * @returns {{ sub: string, email: string, role: string, iat: number, exp: number }}
 */
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET, {
      issuer: 'campus-knowledge-agent',
      audience: 'campus-api',
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Session expired. Please log in again.', 401, AUTH_ERRORS.INVALID_TOKEN);
    }
    throw new AppError('Invalid authentication token.', 401, AUTH_ERRORS.INVALID_TOKEN);
  }
};

/**
 * Decodes a token without verification (for debugging only).
 * @param {string} token
 * @returns {object|null}
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};

export default { signAccessToken, verifyAccessToken, decodeToken };
