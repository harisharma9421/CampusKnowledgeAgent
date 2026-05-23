import { AppError } from '../middleware/errorHandler.js';
import { COLLECTIONS } from '../constants/collections.js';
import paginate from '../utils/pagination.js';
import * as academicRepository from '../repositories/academic.repository.js';
import * as notificationService from './notification.service.js';

const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const isActiveRecord = (record, active) => {
  if (active === undefined) {
    return record.isActive !== false;
  }
  return Boolean(record.isActive) === active;
};

const includesText = (record, fields, search) => {
  if (!search) {
    return true;
  }
  const needle = search.toLowerCase();
  return fields.some((field) => String(record[field] || '').toLowerCase().includes(needle));
};

const matchesBranch = (recordBranch, branch) => {
  if (!branch || branch === 'all') {
    return true;
  }
  return recordBranch === 'all' || recordBranch === branch;
};

const matchesExactBranch = (recordBranch, branch) => {
  if (!branch || branch === 'all') {
    return true;
  }
  return recordBranch === branch;
};

const matchesSemester = (recordSemester, semester) => {
  if (semester === undefined || semester === null || semester === 0) {
    return true;
  }
  return recordSemester === 0 || Number(recordSemester) === Number(semester);
};

const matchesExactSemester = (recordSemester, semester) => {
  if (semester === undefined || semester === null || semester === 0) {
    return true;
  }
  return Number(recordSemester) === Number(semester);
};

const matchesDivision = (recordDivision, division) => {
  if (!division || division === 'all') {
    return true;
  }
  return !recordDivision || recordDivision === 'all' || recordDivision === division;
};

const matchesAudience = (audience, user) => {
  if (!audience || audience.role !== user.role) {
    return false;
  }

  if (user.role !== 'student') {
    return true;
  }

  return (
    matchesBranch(audience.branch, user.branch) &&
    matchesSemester(audience.semester, user.semester) &&
    matchesDivision(audience.division, user.division) &&
    (!audience.batch || audience.batch === 'all' || audience.batch === user.batch)
  );
};

const applyStudentVisibility = (records, user) => {
  if (user.role !== 'student') {
    return records;
  }

  return records.filter(
    (record) =>
      matchesBranch(record.branch, user.branch) &&
      matchesSemester(record.semester, user.semester) &&
      matchesDivision(record.division, user.division)
  );
};

const withPagination = (records, query) => paginate(records, query.page, query.limit);

const sortByIsoDate = (records, field, direction = 'desc') =>
  [...records].sort((a, b) => {
    const left = new Date(a[field] || 0).getTime();
    const right = new Date(b[field] || 0).getTime();
    return direction === 'asc' ? left - right : right - left;
  });

const scopeTimetableQuery = (query, user) => {
  if (user.role !== 'student') {
    return query;
  }

  return {
    ...query,
    branch: user.branch,
    semester: user.semester,
    division: user.division,
  };
};

const reduceTimetableDay = (record, day) => {
  if (!day) {
    return record;
  }

  return {
    ...record,
    schedule: {
      [day]: record.schedule?.[day] || [],
    },
  };
};

const normalizeSchedule = (schedule = {}) =>
  dayOrder.reduce((result, day) => {
    result[day] = Array.isArray(schedule[day]) ? schedule[day] : [];
    return result;
  }, {});

const getExistingDocument = async (collection, id) => {
  const record = await academicRepository.getDocumentById(collection, id);
  if (!record) {
    throw new AppError('Academic record not found.', 404, 'ACADEMIC_RECORD_NOT_FOUND');
  }
  return record;
};

const buildAudience = ({ branch = 'all', semester = 0, division = 'all', batch = 'all' } = {}) => ({
  role: 'student',
  branch,
  semester,
  division,
  batch,
});

const actorFields = (actor, action) => ({
  [`${action}By`]: actor?.id || actor?.uid || null,
  [`${action}ByName`]: actor?.displayName || actor?.email || null,
});

const triggerTimetableNotification = (timetable, actor, action = 'updated') =>
  notificationService.triggerScheduleUpdateAlert(
    {
      title: `Timetable ${action} for Semester ${timetable.semester} ${timetable.division}`,
      message: `The timetable for ${timetable.branch} Semester ${timetable.semester} Division ${timetable.division} was ${action}.`,
      audience: buildAudience(timetable),
      channel: 'in_app',
      priority: 'high',
      relatedCollection: COLLECTIONS.TIMETABLE,
      relatedId: timetable.id,
    },
    actor
  );

const triggerNoticeNotification = (notice, actor, action = 'created') =>
  notificationService.triggerNoticeAlert(
    {
      title: action === 'created' ? `New notice: ${notice.title}` : `Notice updated: ${notice.title}`,
      message: notice.content,
      audience: buildAudience(notice),
      channel: 'in_app',
      priority: notice.priority || 'normal',
      relatedCollection: COLLECTIONS.NOTICES,
      relatedId: notice.id,
    },
    actor
  );

const triggerEventNotification = (event, actor, action = 'created') =>
  notificationService.triggerEventNotification(
    {
      title: action === 'created' ? `New event: ${event.title}` : `Event updated: ${event.title}`,
      message: `${event.title} is scheduled at ${event.venue}.`,
      audience: buildAudience({ ...event, division: 'all' }),
      channel: 'in_app',
      priority: 'normal',
      relatedCollection: COLLECTIONS.EVENTS,
      relatedId: event.id,
    },
    actor
  );

export const getTimetable = async (query, user) => {
  const scopedQuery = scopeTimetableQuery(query, user);
  const records = await academicRepository.listTimetable();

  const filtered = records
    .filter((record) => isActiveRecord(record, scopedQuery.active))
    .filter((record) => matchesExactBranch(record.branch, scopedQuery.branch))
    .filter((record) => matchesExactSemester(record.semester, scopedQuery.semester))
    .filter((record) => matchesDivision(record.division, scopedQuery.division))
    .sort(
      (a, b) =>
        a.branch.localeCompare(b.branch) ||
        Number(a.semester) - Number(b.semester) ||
        a.division.localeCompare(b.division)
    )
    .map((record) => reduceTimetableDay(record, scopedQuery.day));

  return withPagination(filtered, scopedQuery);
};

export const createTimetable = async (payload, actor) => {
  const timetable = await academicRepository.createDocument(COLLECTIONS.TIMETABLE, {
    ...payload,
    schedule: normalizeSchedule(payload.schedule),
    isActive: payload.isActive ?? true,
    source: 'manual_entry',
    ...actorFields(actor, 'created'),
  });
  const notification = await triggerTimetableNotification(timetable, actor, 'created');

  return {
    timetable,
    notification: notification.notification,
  };
};

export const updateTimetable = async (id, updates, actor) => {
  const existing = await getExistingDocument(COLLECTIONS.TIMETABLE, id);
  const payload = {
    ...updates,
    ...(updates.schedule ? { schedule: normalizeSchedule(updates.schedule) } : {}),
    ...actorFields(actor, 'updated'),
  };
  const timetable = await academicRepository.updateDocument(COLLECTIONS.TIMETABLE, id, payload);
  const notification = await triggerTimetableNotification(
    { ...existing, ...timetable },
    actor,
    'updated'
  );

  return {
    timetable,
    notification: notification.notification,
  };
};

export const getNotices = async (query, user) => {
  const records = applyStudentVisibility(await academicRepository.listNotices(), user);

  const filtered = records
    .filter((record) => isActiveRecord(record, query.active))
    .filter((record) => matchesBranch(record.branch, query.branch))
    .filter((record) => matchesSemester(record.semester, query.semester))
    .filter((record) => matchesDivision(record.division, query.division))
    .filter((record) => !query.category || record.category === query.category)
    .filter((record) => includesText(record, ['title', 'content', 'category'], query.search));

  return withPagination(sortByIsoDate(filtered, 'createdAt', query.sort || 'desc'), query);
};

export const createNotice = async (payload, actor) => {
  const notice = await academicRepository.createDocument(COLLECTIONS.NOTICES, {
    ...payload,
    isActive: payload.isActive ?? true,
    source: 'manual_entry',
    postedBy: actor?.id || actor?.uid || null,
    postedByName: actor?.displayName || actor?.email || null,
    ...actorFields(actor, 'created'),
  });
  const notification = await triggerNoticeNotification(notice, actor, 'created');

  return {
    notice,
    notification: notification.notification,
  };
};

export const updateNotice = async (id, updates, actor) => {
  await getExistingDocument(COLLECTIONS.NOTICES, id);
  const notice = await academicRepository.updateDocument(COLLECTIONS.NOTICES, id, {
    ...updates,
    ...actorFields(actor, 'updated'),
  });
  const notification = await triggerNoticeNotification(notice, actor, 'updated');

  return {
    notice,
    notification: notification.notification,
  };
};

export const getEvents = async (query, user) => {
  const now = Date.now();
  const records = applyStudentVisibility(await academicRepository.listEvents(), user);

  const filtered = records
    .filter((record) => isActiveRecord(record, query.active))
    .filter((record) => matchesBranch(record.branch, query.branch))
    .filter((record) => matchesSemester(record.semester, query.semester))
    .filter((record) => !query.category || record.category === query.category)
    .filter((record) => !query.upcoming || new Date(record.eventDate).getTime() >= now)
    .filter((record) => includesText(record, ['title', 'description', 'venue', 'organizer'], query.search));

  return withPagination(sortByIsoDate(filtered, 'eventDate', 'asc'), query);
};

export const createEvent = async (payload, actor) => {
  const event = await academicRepository.createDocument(COLLECTIONS.EVENTS, {
    ...payload,
    isActive: payload.isActive ?? true,
    source: 'manual_entry',
    organizer: payload.organizer || actor?.displayName || actor?.email || 'Campus team',
    organizerId: actor?.id || actor?.uid || null,
    ...actorFields(actor, 'created'),
  });
  const notification = await triggerEventNotification(event, actor, 'created');

  return {
    event,
    notification: notification.notification,
  };
};

export const updateEvent = async (id, updates, actor) => {
  await getExistingDocument(COLLECTIONS.EVENTS, id);
  const event = await academicRepository.updateDocument(COLLECTIONS.EVENTS, id, {
    ...updates,
    ...actorFields(actor, 'updated'),
  });
  const notification = await triggerEventNotification(event, actor, 'updated');

  return {
    event,
    notification: notification.notification,
  };
};

export const getFaculty = async (query, user) => {
  const records = await academicRepository.listFaculty();
  const branch = query.branch || (user.role === 'student' ? user.branch : undefined);

  const filtered = records
    .filter((record) => isActiveRecord(record, query.active))
    .filter((record) => matchesExactBranch(record.branch, branch))
    .filter((record) => !query.department || record.department === query.department)
    .filter((record) =>
      includesText(record, ['displayName', 'department', 'designation', 'email'], query.search)
    )
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  return withPagination(filtered, query);
};

export const getFaq = async (query, user) => {
  const records = applyStudentVisibility(await academicRepository.listFaq(), user);

  const filtered = records
    .filter((record) => isActiveRecord(record, query.active))
    .filter((record) => matchesBranch(record.branch, query.branch))
    .filter((record) => matchesSemester(record.semester, query.semester))
    .filter((record) => !query.category || record.category === query.category)
    .filter((record) => includesText(record, ['question', 'answer', 'category'], query.search))
    .sort((a, b) => a.category.localeCompare(b.category) || a.question.localeCompare(b.question));

  return withPagination(filtered, query);
};

export const createFaq = async (payload, actor) => {
  const faq = await academicRepository.createDocument(COLLECTIONS.FAQ, {
    ...payload,
    embedding: [],
    isActive: payload.isActive ?? true,
    source: 'manual_entry',
    ...actorFields(actor, 'created'),
  });

  return { faq };
};

export const updateFaq = async (id, updates, actor) => {
  await getExistingDocument(COLLECTIONS.FAQ, id);
  const faq = await academicRepository.updateDocument(COLLECTIONS.FAQ, id, {
    ...updates,
    ...actorFields(actor, 'updated'),
  });

  return { faq };
};

export const getNotifications = async (query, user) => {
  const records = await academicRepository.listNotifications();

  const filtered = records
    .filter((record) => isActiveRecord(record, query.active))
    .filter((record) => matchesAudience(record.audience, user))
    .filter((record) => !query.type || record.type === query.type)
    .filter((record) => !query.unreadOnly || !(record.readBy || []).includes(user.id));

  return withPagination(sortByIsoDate(filtered, 'scheduledAt', 'desc'), query);
};

export const markNotificationRead = async (notificationId, user) => {
  const notification = await academicRepository.getDocumentById('notifications', notificationId);
  if (!notification) {
    throw new AppError('Notification not found.', 404, 'NOTIFICATION_NOT_FOUND');
  }
  if (!matchesAudience(notification.audience, user)) {
    throw new AppError('You do not have access to this notification.', 403, 'FORBIDDEN');
  }
  return academicRepository.markNotificationRead(notificationId, user.id);
};

export const getAcademicContextForUser = async (user) => {
  const [timetable, notices, events, faculty, faq, notifications] = await Promise.all([
    getTimetable({ page: 1, limit: 10 }, user),
    getNotices({ page: 1, limit: 10 }, user),
    getEvents({ page: 1, limit: 10, upcoming: true }, user),
    getFaculty({ page: 1, limit: 10 }, user),
    getFaq({ page: 1, limit: 10 }, user),
    getNotifications({ page: 1, limit: 10, unreadOnly: false }, user),
  ]);

  return {
    timetable: timetable.data,
    notices: notices.data,
    events: events.data,
    faculty: faculty.data,
    faq: faq.data,
    notifications: notifications.data,
  };
};

export const getDayNameFromDate = (date = new Date()) => {
  const day = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  return dayOrder.includes(day) ? day : 'monday';
};

export default {
  getTimetable,
  createTimetable,
  updateTimetable,
  getNotices,
  createNotice,
  updateNotice,
  getEvents,
  createEvent,
  updateEvent,
  getFaculty,
  getFaq,
  createFaq,
  updateFaq,
  getNotifications,
  markNotificationRead,
  getAcademicContextForUser,
  getDayNameFromDate,
};
