import { getFirestore, isFirebaseReady } from '../configs/firebase.js';
import { COLLECTIONS } from '../constants/collections.js';
import { AppError } from '../middleware/errorHandler.js';

const ensureFirestore = async () => {
  if (!isFirebaseReady()) {
    throw new AppError(
      'Database is not available. Configure Firebase credentials or enable the emulator.',
      503,
      'FIREBASE_UNAVAILABLE'
    );
  }

  const db = await getFirestore();
  if (!db) {
    throw new AppError('Failed to connect to Firestore.', 503, 'FIREBASE_UNAVAILABLE');
  }

  return db;
};

const toRecord = (doc) => ({ id: doc.id, ...doc.data() });

export const listCollection = async (collectionName) => {
  const db = await ensureFirestore();
  const snapshot = await db.collection(collectionName).get();
  return snapshot.docs.map(toRecord);
};

export const getDocumentById = async (collectionName, id) => {
  const db = await ensureFirestore();
  const doc = await db.collection(collectionName).doc(id).get();
  return doc.exists ? toRecord(doc) : null;
};

export const updateDocument = async (collectionName, id, updates) => {
  const db = await ensureFirestore();
  const docRef = db.collection(collectionName).doc(id);
  await docRef.update({
    ...updates,
    updatedAt: new Date().toISOString(),
  });
  const updated = await docRef.get();
  return toRecord(updated);
};

export const listStudents = () => listCollection(COLLECTIONS.STUDENTS);
export const listFaculty = () => listCollection(COLLECTIONS.FACULTY);
export const listTimetable = () => listCollection(COLLECTIONS.TIMETABLE);
export const listNotices = () => listCollection(COLLECTIONS.NOTICES);
export const listEvents = () => listCollection(COLLECTIONS.EVENTS);
export const listFaq = () => listCollection(COLLECTIONS.FAQ);
export const listNotifications = () => listCollection(COLLECTIONS.NOTIFICATIONS);

export const markNotificationRead = async (notificationId, userId) => {
  const notification = await getDocumentById(COLLECTIONS.NOTIFICATIONS, notificationId);
  if (!notification) {
    throw new AppError('Notification not found.', 404, 'NOTIFICATION_NOT_FOUND');
  }

  const readBy = Array.isArray(notification.readBy) ? notification.readBy : [];
  if (!readBy.includes(userId)) {
    readBy.push(userId);
  }

  return updateDocument(COLLECTIONS.NOTIFICATIONS, notificationId, { readBy });
};

export default {
  listCollection,
  getDocumentById,
  updateDocument,
  listStudents,
  listFaculty,
  listTimetable,
  listNotices,
  listEvents,
  listFaq,
  listNotifications,
  markNotificationRead,
};
