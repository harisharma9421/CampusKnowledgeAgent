/**
 * Firebase Admin SDK Configuration
 * Initializes Firestore and supports the Firebase Emulator for local development.
 */

import env from './env.js';
import logger from '../utils/logger.js';

let adminApp = null;
let firestoreInstance = null;
let firebaseReady = false;

/**
 * Returns whether Firebase Admin SDK is initialized and ready.
 * @returns {boolean}
 */
export const isFirebaseReady = () => firebaseReady;

/**
 * Configures Firestore emulator host when enabled.
 */
const configureEmulator = () => {
  if (!env.FIREBASE_USE_EMULATOR) {
    return;
  }

  const host = env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
  process.env.FIRESTORE_EMULATOR_HOST = host;
  logger.info(`[Firebase] Using Firestore emulator at ${host}`);
};

/**
 * Initializes Firebase Admin SDK.
 * @returns {object|null} Firebase Admin App instance
 */
export const initializeFirebase = async () => {
  if (adminApp) {
    return adminApp;
  }

  configureEmulator();

  const hasCredentials =
    env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY;

  if (!hasCredentials && !env.FIREBASE_USE_EMULATOR) {
    logger.warn(
      '[Firebase] Credentials not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, ' +
        'and FIREBASE_PRIVATE_KEY in .env — or set FIREBASE_USE_EMULATOR=true for local development.'
    );
    firebaseReady = false;
    return null;
  }

  try {
    const { default: admin } = await import('firebase-admin');

    if (!admin.apps.length) {
      const initConfig = {
        projectId: env.FIREBASE_PROJECT_ID || 'campus-knowledge-agent-dev',
      };

      if (hasCredentials) {
        initConfig.credential = admin.credential.cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey: env.FIREBASE_PRIVATE_KEY,
        });
      }

      adminApp = admin.initializeApp(initConfig);
      firestoreInstance = admin.firestore();
      firebaseReady = true;
      logger.info('[Firebase] Admin SDK initialized successfully.');
    } else {
      adminApp = admin.apps[0];
      const { default: admin } = await import('firebase-admin');
      firestoreInstance = admin.firestore();
      firebaseReady = true;
    }

    return adminApp;
  } catch (error) {
    logger.error('[Firebase] Failed to initialize Admin SDK:', error.message);
    firebaseReady = false;
    return null;
  }
};

/**
 * Returns the Firestore database instance.
 * @returns {FirebaseFirestore.Firestore|null}
 */
export const getFirestore = async () => {
  if (firestoreInstance) {
    return firestoreInstance;
  }

  const app = await initializeFirebase();
  if (!app) {
    return null;
  }

  const { default: admin } = await import('firebase-admin');
  firestoreInstance = admin.firestore();
  return firestoreInstance;
};

export default { initializeFirebase, getFirestore, isFirebaseReady };
