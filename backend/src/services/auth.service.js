/**
 * Authentication service — registration, login, session profile.
 */

import bcrypt from 'bcryptjs';
import { AppError } from '../middleware/errorHandler.js';
import { AUTH_ERRORS, BCRYPT_ROUNDS, ROLES } from '../constants/auth.js';
import * as userRepository from '../repositories/user.repository.js';
import { signAccessToken } from './token.service.js';

/**
 * Builds the auth response payload returned after login/register.
 * @param {object} user
 * @param {string} token
 */
const buildAuthResponse = (user, token) => {
  const safeUser = userRepository.sanitizeUser(user);
  return {
    user: {
      id: safeUser.id,
      uid: safeUser.uid,
      email: safeUser.email,
      displayName: safeUser.displayName,
      role: safeUser.role,
      branch: safeUser.branch,
      semester: safeUser.semester,
      division: safeUser.division,
      batch: safeUser.batch,
      rollNumber: safeUser.rollNumber,
      employeeId: safeUser.employeeId,
      department: safeUser.department,
      isActive: safeUser.isActive,
      createdAt: safeUser.createdAt,
    },
    token,
    tokenType: 'Bearer',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  };
};

/**
 * Registers a new user account.
 * @param {object} input
 */
export const registerUser = async (input) => {
  const existing = await userRepository.findUserByEmail(input.email);
  if (existing) {
    throw new AppError('An account with this email already exists.', 409, AUTH_ERRORS.EMAIL_EXISTS);
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const user = await userRepository.createUser({
    email: input.email,
    displayName: input.displayName,
    role: input.role,
    passwordHash,
    branch: input.role === ROLES.STUDENT ? input.branch : input.branch || null,
    semester: input.role === ROLES.STUDENT ? input.semester : null,
    division: input.role === ROLES.STUDENT ? input.division : null,
    batch: input.role === ROLES.STUDENT ? input.batch : null,
    rollNumber: input.role === ROLES.STUDENT ? input.rollNumber : null,
    employeeId: input.role === ROLES.FACULTY ? input.employeeId : null,
    department:
      input.role === ROLES.FACULTY || input.role === ROLES.ADMIN ? input.department : null,
  });

  const token = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return buildAuthResponse(user, token);
};

/**
 * Authenticates a user with email and password.
 * @param {{ email: string, password: string }} input
 */
export const loginUser = async (input) => {
  const user = await userRepository.findUserByEmail(input.email);

  if (!user) {
    throw new AppError('Invalid email or password.', 401, AUTH_ERRORS.INVALID_CREDENTIALS);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated.', 403, AUTH_ERRORS.USER_INACTIVE);
  }

  const passwordMatch = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatch) {
    throw new AppError('Invalid email or password.', 401, AUTH_ERRORS.INVALID_CREDENTIALS);
  }

  const updatedUser = await userRepository.updateUser(user.id, {
    lastLoginAt: new Date().toISOString(),
  });

  const token = signAccessToken({
    userId: updatedUser.id,
    email: updatedUser.email,
    role: updatedUser.role,
  });

  return buildAuthResponse(updatedUser, token);
};

/**
 * Returns the profile for an authenticated user.
 * @param {string} userId
 */
export const getUserProfile = async (userId) => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }
  if (!user.isActive) {
    throw new AppError('Your account has been deactivated.', 403, AUTH_ERRORS.USER_INACTIVE);
  }
  return userRepository.sanitizeUser(user);
};

export default { registerUser, loginUser, getUserProfile };
