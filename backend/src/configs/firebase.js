/**
 * Firebase Admin SDK Configuration
 * Placeholder — actual Firestore logic will be implemented in Phase 2.
 * This module exports the admin app instance once initialized.
 */

import env from './env.js';
import logger from '../utils/logger.js';

let adminApp = null;

/**
 * Initializes Firebase Admin SDK.
 * Called once during server startup.
 * @returns {object|null} Firebase Admin App instance
 */
export const initializeFirebase = async () => {
  if (adminApp) {
    return adminApp;
  }

  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
    logger.warn(
      '[Firebase] Firebase credentials not configured. Firestore will be unavailable. ' +
        'Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env'
    );
    return null;
  }

  try {
    // Dynamic import to avoid crashing when firebase-admin is not yet installed
    const { default: admin } = await import('firebase-admin');

    if (!admin.apps.length) {
      adminApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: env.FIREBASE_PRIVATE_KEY,
        }),
      });
      logger.info('[Firebase] Admin SDK initialized successfully.');
    } else {
      adminApp = admin.apps[0];
    }

    return adminApp;
  } catch (error) {
    logger.error('[Firebase] Failed to initialize Admin SDK:', error.message);
    return null;
  }
};

/**
 * Returns the Firestore database instance.
 * @returns {FirebaseFirestore.Firestore|null}
 */
export const getFirestore = async () => {
  const app = await initializeFirebase();
  if (!app) {
    return null;
  }
  const { default: admin } = await import('firebase-admin');
  return admin.firestore();
};

export default { initializeFirebase, getFirestore };
