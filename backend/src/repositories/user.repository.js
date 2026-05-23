/**
 * User repository — Firestore data access for the users collection.
 */

import { getFirestore, isFirebaseReady } from '../configs/firebase.js';
import { COLLECTIONS } from '../constants/collections.js';
import { AppError } from '../middleware/errorHandler.js';
import { AUTH_ERRORS } from '../constants/auth.js';

const collectionName = COLLECTIONS.USERS;

const ensureFirestore = async () => {
  if (!isFirebaseReady()) {
    throw new AppError(
      'Database is not available. Configure Firebase credentials or enable the emulator.',
      503,
      AUTH_ERRORS.FIREBASE_UNAVAILABLE
    );
  }
  const db = await getFirestore();
  if (!db) {
    throw new AppError(
      'Failed to connect to Firestore.',
      503,
      AUTH_ERRORS.FIREBASE_UNAVAILABLE
    );
  }
  return db;
};

/**
 * Removes sensitive fields before returning user data to clients.
 * @param {object} user
 * @returns {object}
 */
export const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
};

/**
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export const findUserById = async (id) => {
  const db = await ensureFirestore();
  const doc = await db.collection(collectionName).doc(id).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() };
};

/**
 * @param {string} email
 * @returns {Promise<object|null>}
 */
export const findUserByEmail = async (email) => {
  const db = await ensureFirestore();
  const normalizedEmail = email.trim().toLowerCase();
  const snapshot = await db
    .collection(collectionName)
    .where('email', '==', normalizedEmail)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};

export const listUsers = async () => {
  const db = await ensureFirestore();
  const snapshot = await db.collection(collectionName).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * @param {object} userData
 * @returns {Promise<object>}
 */
export const createUser = async (userData) => {
  const db = await ensureFirestore();
  const now = new Date().toISOString();
  const docRef = db.collection(collectionName).doc();

  const record = {
    uid: docRef.id,
    email: userData.email.trim().toLowerCase(),
    displayName: userData.displayName.trim(),
    role: userData.role,
    passwordHash: userData.passwordHash,
    branch: userData.branch || null,
    semester: userData.semester ?? null,
    division: userData.division || null,
    batch: userData.batch || null,
    rollNumber: userData.rollNumber || null,
    employeeId: userData.employeeId || null,
    department: userData.department || null,
    isActive: true,
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now,
  };

  await docRef.set(record);
  return { id: docRef.id, ...record };
};

/**
 * @param {string} id
 * @param {object} updates
 * @returns {Promise<object>}
 */
export const updateUser = async (id, updates) => {
  const db = await ensureFirestore();
  const docRef = db.collection(collectionName).doc(id);
  const payload = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await docRef.update(payload);
  return findUserById(id);
};

export default {
  findUserById,
  findUserByEmail,
  listUsers,
  createUser,
  updateUser,
  sanitizeUser,
};
