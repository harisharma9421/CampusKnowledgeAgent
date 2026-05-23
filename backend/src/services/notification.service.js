import { COLLECTIONS } from '../constants/collections.js';
import * as academicRepository from '../repositories/academic.repository.js';
import * as userRepository from '../repositories/user.repository.js';
import * as emailService from './email.service.js';

const matchesBranch = (expected, actual) => !expected || expected === 'all' || expected === actual;
const matchesSemester = (expected, actual) =>
  expected === undefined || expected === null || Number(expected) === 0 || Number(expected) === Number(actual);
const matchesDivision = (expected, actual) => !expected || expected === 'all' || expected === actual;
const matchesBatch = (expected, actual) => !expected || expected === 'all' || expected === actual;

const notificationTemplates = {
  notice: {
    subjectPrefix: 'Notice',
    relatedCollection: COLLECTIONS.NOTICES,
  },
  event: {
    subjectPrefix: 'Event',
    relatedCollection: COLLECTIONS.EVENTS,
  },
  schedule_update: {
    subjectPrefix: 'Schedule update',
    relatedCollection: COLLECTIONS.TIMETABLE,
  },
  reminder: {
    subjectPrefix: 'Reminder',
    relatedCollection: COLLECTIONS.NOTIFICATIONS,
  },
};

const matchesAudience = (user, audience) => {
  if (!user?.isActive) {
    return false;
  }
  if (audience.role && audience.role !== 'all' && user.role !== audience.role) {
    return false;
  }
  if (user.role !== 'student') {
    return true;
  }
  return (
    matchesBranch(audience.branch, user.branch) &&
    matchesSemester(audience.semester, user.semester) &&
    matchesDivision(audience.division, user.division) &&
    matchesBatch(audience.batch, user.batch)
  );
};

const normalizeAudience = (audience = {}) => ({
  role: audience.role || 'student',
  branch: audience.branch || 'all',
  semester: audience.semester ?? 0,
  division: audience.division || 'all',
  batch: audience.batch || 'all',
});

const buildEmailHtml = (notification) => `
  <div style="font-family:Arial,sans-serif;line-height:1.5;color:#1f2937">
    <h2 style="margin:0 0 12px">${notification.title}</h2>
    <p style="margin:0 0 16px">${notification.message}</p>
    <p style="margin:0;color:#64748b;font-size:12px">Campus Knowledge Agent</p>
  </div>
`;

export const resolveAudienceRecipients = async (audience) => {
  const users = await userRepository.listUsers();
  return users
    .filter((user) => matchesAudience(user, audience))
    .map(userRepository.sanitizeUser);
};

export const createNotification = async (payload, actor) => {
  const audience = normalizeAudience(payload.audience);
  const template = notificationTemplates[payload.type] || notificationTemplates.notice;
  const now = new Date().toISOString();

  const record = {
    type: payload.type,
    title: payload.title,
    message: payload.message,
    audience,
    relatedCollection: payload.relatedCollection || template.relatedCollection,
    relatedId: payload.relatedId || null,
    priority: payload.priority || 'normal',
    deliveryChannels: payload.deliveryChannels || ['in_app'],
    deliveryStatus: {
      email: 'pending',
      in_app: 'created',
    },
    readBy: [],
    scheduledAt: payload.scheduledAt || now,
    sentAt: null,
    isActive: true,
    createdBy: actor?.id || actor?.uid || null,
  };

  return academicRepository.createDocument(COLLECTIONS.NOTIFICATIONS, record);
};

export const sendNotificationEmail = async (notification) => {
  const recipients = await resolveAudienceRecipients(notification.audience);
  const emails = recipients.map((recipient) => recipient.email).filter(Boolean);
  const template = notificationTemplates[notification.type] || notificationTemplates.notice;
  const result = await emailService.sendEmail({
    to: emails,
    subject: `[${template.subjectPrefix}] ${notification.title}`,
    text: notification.message,
    html: buildEmailHtml(notification),
  });

  const updated = await academicRepository.updateDocument(
    COLLECTIONS.NOTIFICATIONS,
    notification.id,
    {
      deliveryStatus: {
        ...(notification.deliveryStatus || {}),
        email: result.status,
        emailReason: result.reason || null,
        accepted: result.accepted || [],
        rejected: result.rejected || [],
      },
      sentAt: result.status === 'sent' ? new Date().toISOString() : notification.sentAt || null,
    }
  );

  return {
    notification: updated,
    email: result,
    recipients: recipients.length,
  };
};

export const triggerNotification = async (payload, actor) => {
  const notification = await createNotification(payload, actor);
  const shouldEmail = ['email', 'both'].includes(payload.channel);

  if (!shouldEmail) {
    return {
      notification,
      email: {
        status: 'skipped',
        reason: 'Email channel was not requested.',
      },
      recipients: null,
    };
  }

  return sendNotificationEmail(notification);
};

export const triggerScheduleUpdateAlert = (payload, actor) =>
  triggerNotification({ ...payload, type: 'schedule_update' }, actor);

export const triggerNoticeAlert = (payload, actor) =>
  triggerNotification({ ...payload, type: 'notice' }, actor);

export const triggerEventNotification = (payload, actor) =>
  triggerNotification({ ...payload, type: 'event' }, actor);

export const getNotificationHealth = () => ({
  email: emailService.getEmailHealth(),
  channels: ['in_app', 'email', 'both'],
  types: Object.keys(notificationTemplates),
});

export default {
  createNotification,
  resolveAudienceRecipients,
  sendNotificationEmail,
  triggerNotification,
  triggerScheduleUpdateAlert,
  triggerNoticeAlert,
  triggerEventNotification,
  getNotificationHealth,
};

