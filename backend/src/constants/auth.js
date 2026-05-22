/**
 * Authentication constants and error codes.
 */

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_EXISTS: 'EMAIL_EXISTS',
  USER_INACTIVE: 'USER_INACTIVE',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  FIREBASE_UNAVAILABLE: 'FIREBASE_UNAVAILABLE',
  INVALID_TOKEN: 'INVALID_TOKEN',
};

export const ROLES = {
  STUDENT: 'student',
  FACULTY: 'faculty',
  ADMIN: 'admin',
};

export const ROLE_LIST = Object.values(ROLES);

export const DIVISIONS = ['D1', 'D2', 'D3', 'D4'];

export const BATCHES = [
  'A1',
  'A2',
  'A3',
  'A4',
  'B1',
  'B2',
  'B3',
  'B4',
  'C1',
  'C2',
  'C3',
  'C4',
];

export const BCRYPT_ROUNDS = 12;

export default { AUTH_ERRORS, ROLES, ROLE_LIST, DIVISIONS, BATCHES, BCRYPT_ROUNDS };
