import {
  BRANCH_LIST,
  BATCHES,
  DIVISIONS,
  SEED_SOURCE,
  SEMESTERS,
  WEEK_DAYS,
} from './academicConstants.mjs';

const collectionCounts = {
  users: 274,
  students: 240,
  faculty: 32,
  timetable: 48,
  notices: 36,
  events: 24,
  faq: 48,
  notifications: 100,
};

const requiredFields = {
  users: ['id', 'uid', 'email', 'displayName', 'role', 'isActive', 'source'],
  students: ['id', 'userId', 'rollNumber', 'branch', 'semester', 'division', 'batch', 'mentorFacultyId'],
  faculty: ['id', 'userId', 'employeeId', 'displayName', 'branch', 'department', 'subjectCodes'],
  timetable: ['id', 'branch', 'semester', 'division', 'academicYear', 'schedule'],
  notices: ['id', 'title', 'content', 'category', 'branch', 'semester', 'postedBy'],
  events: ['id', 'title', 'description', 'eventDate', 'venue', 'organizerId', 'category'],
  faq: ['id', 'question', 'answer', 'category', 'tags'],
  notifications: ['id', 'type', 'title', 'message', 'audience', 'relatedCollection', 'relatedId'],
};

const isValidBranch = (branch) => branch === 'all' || BRANCH_LIST.includes(branch);
const isValidSemester = (semester) => semester === 0 || SEMESTERS.includes(semester);
const isValidDivision = (division) => division === 'all' || DIVISIONS.includes(division);
const isValidBatch = (batch) => batch === 'all' || BATCHES.includes(batch);

const addError = (errors, collection, id, message) => {
  errors.push(`${collection}/${id || 'unknown'}: ${message}`);
};

const ensureUniqueIds = (records, collection, errors) => {
  const seen = new Set();
  records.forEach((record) => {
    if (!record?.id) {
      addError(errors, collection, record?.id, 'missing id');
      return;
    }
    if (seen.has(record.id)) {
      addError(errors, collection, record.id, 'duplicate id');
    }
    seen.add(record.id);
  });
};

const ensureRequiredFields = (records, collection, errors) => {
  records.forEach((record) => {
    requiredFields[collection].forEach((field) => {
      if (record[field] === undefined || record[field] === null || record[field] === '') {
        addError(errors, collection, record.id, `missing required field ${field}`);
      }
    });
  });
};

const buildSummary = (dataset) =>
  Object.fromEntries(Object.entries(dataset).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0]));

export const runFilterSmokeTests = (dataset) => {
  const sampleStudent = dataset.students.find(
    (student) =>
      student.branch === 'computer_engineering' &&
      student.semester === 5 &&
      student.division === 'D2' &&
      student.batch === 'A2'
  );

  const visibleTimetable = dataset.timetable.find(
    (record) =>
      record.branch === sampleStudent?.branch &&
      record.semester === sampleStudent?.semester &&
      record.division === sampleStudent?.division
  );

  const visibleNotices = dataset.notices.filter(
    (notice) =>
      notice.isActive &&
      (notice.branch === 'all' || notice.branch === sampleStudent?.branch) &&
      (notice.semester === 0 || notice.semester === sampleStudent?.semester) &&
      (notice.division === 'all' || notice.division === sampleStudent?.division)
  );

  const visibleNotifications = dataset.notifications.filter((notification) => {
    const audience = notification.audience;
    return (
      audience.role === 'student' &&
      (audience.branch === 'all' || audience.branch === sampleStudent?.branch) &&
      (audience.semester === 0 || audience.semester === sampleStudent?.semester) &&
      (audience.division === 'all' || audience.division === sampleStudent?.division) &&
      (audience.batch === 'all' || audience.batch === sampleStudent?.batch)
    );
  });

  return {
    sampleStudentId: sampleStudent?.id || null,
    timetableFound: Boolean(visibleTimetable),
    visibleNoticeCount: visibleNotices.length,
    visibleNotificationCount: visibleNotifications.length,
    passed:
      Boolean(sampleStudent) &&
      Boolean(visibleTimetable) &&
      visibleNotices.length > 0 &&
      visibleNotifications.length > 0,
  };
};

export const validateGeneratedErpDataset = (dataset) => {
  const errors = [];
  const warnings = [];
  const summary = buildSummary(dataset);

  Object.entries(collectionCounts).forEach(([collection, expectedCount]) => {
    const records = dataset[collection];
    if (!Array.isArray(records)) {
      errors.push(`${collection}: collection is missing or is not an array`);
      return;
    }
    if (records.length !== expectedCount) {
      errors.push(`${collection}: expected ${expectedCount} records, found ${records.length}`);
    }
    ensureUniqueIds(records, collection, errors);
    ensureRequiredFields(records, collection, errors);
  });

  const userById = new Map(dataset.users.map((user) => [user.id, user]));
  const facultyById = new Map(dataset.faculty.map((faculty) => [faculty.id, faculty]));
  const facultyUserIds = new Set(dataset.faculty.map((faculty) => faculty.userId));
  const noticeIds = new Set(dataset.notices.map((notice) => notice.id));
  const eventIds = new Set(dataset.events.map((event) => event.id));
  const timetableIds = new Set(dataset.timetable.map((record) => record.id));

  dataset.users.forEach((user) => {
    if (user.source !== SEED_SOURCE) {
      addError(errors, 'users', user.id, `invalid source ${user.source}`);
    }
    if (!['student', 'faculty', 'admin'].includes(user.role)) {
      addError(errors, 'users', user.id, `invalid role ${user.role}`);
    }
    if (user.role === 'student') {
      if (!BRANCH_LIST.includes(user.branch)) addError(errors, 'users', user.id, 'student has invalid branch');
      if (!SEMESTERS.includes(user.semester)) addError(errors, 'users', user.id, 'student has invalid semester');
      if (!DIVISIONS.includes(user.division)) addError(errors, 'users', user.id, 'student has invalid division');
      if (!BATCHES.includes(user.batch)) addError(errors, 'users', user.id, 'student has invalid batch');
    }
  });

  dataset.students.forEach((student) => {
    const user = userById.get(student.userId);
    if (!user) addError(errors, 'students', student.id, `userId ${student.userId} does not exist`);
    if (user && user.role !== 'student') addError(errors, 'students', student.id, 'linked user is not a student');
    if (!BRANCH_LIST.includes(student.branch)) addError(errors, 'students', student.id, 'invalid branch');
    if (!SEMESTERS.includes(student.semester)) addError(errors, 'students', student.id, 'invalid semester');
    if (!DIVISIONS.includes(student.division)) addError(errors, 'students', student.id, 'invalid division');
    if (!BATCHES.includes(student.batch)) addError(errors, 'students', student.id, 'invalid batch');
    if (!facultyById.has(student.mentorFacultyId)) {
      addError(errors, 'students', student.id, `mentorFacultyId ${student.mentorFacultyId} does not exist`);
    }
  });

  dataset.faculty.forEach((faculty) => {
    const user = userById.get(faculty.userId);
    if (!user) addError(errors, 'faculty', faculty.id, `userId ${faculty.userId} does not exist`);
    if (user && user.role !== 'faculty') addError(errors, 'faculty', faculty.id, 'linked user is not faculty');
    if (!BRANCH_LIST.includes(faculty.branch)) addError(errors, 'faculty', faculty.id, 'invalid branch');
    if (!Array.isArray(faculty.subjectCodes) || faculty.subjectCodes.length === 0) {
      addError(errors, 'faculty', faculty.id, 'subjectCodes must be a non-empty array');
    }
  });

  dataset.timetable.forEach((record) => {
    if (!BRANCH_LIST.includes(record.branch)) addError(errors, 'timetable', record.id, 'invalid branch');
    if (!SEMESTERS.includes(record.semester)) addError(errors, 'timetable', record.id, 'invalid semester');
    if (!DIVISIONS.includes(record.division)) addError(errors, 'timetable', record.id, 'invalid division');
    WEEK_DAYS.forEach((day) => {
      if (!Array.isArray(record.schedule?.[day])) {
        addError(errors, 'timetable', record.id, `missing schedule for ${day}`);
      }
      record.schedule?.[day]?.forEach((slot) => {
        if (!facultyById.has(slot.facultyId)) {
          addError(errors, 'timetable', record.id, `slot ${slot.slotId} uses unknown faculty ${slot.facultyId}`);
        }
        if (slot.batch && !BATCHES.includes(slot.batch)) {
          addError(errors, 'timetable', record.id, `slot ${slot.slotId} uses invalid batch ${slot.batch}`);
        }
      });
    });
  });

  dataset.notices.forEach((notice) => {
    if (!isValidBranch(notice.branch)) addError(errors, 'notices', notice.id, 'invalid branch');
    if (!isValidSemester(notice.semester)) addError(errors, 'notices', notice.id, 'invalid semester');
    if (!isValidDivision(notice.division)) addError(errors, 'notices', notice.id, 'invalid division');
    if (!facultyUserIds.has(notice.postedBy) && !userById.has(notice.postedBy)) {
      addError(errors, 'notices', notice.id, `postedBy ${notice.postedBy} does not exist`);
    }
  });

  dataset.events.forEach((event) => {
    if (!isValidBranch(event.branch)) addError(errors, 'events', event.id, 'invalid branch');
    if (!isValidSemester(event.semester)) addError(errors, 'events', event.id, 'invalid semester');
    if (!userById.has(event.organizerId)) {
      addError(errors, 'events', event.id, `organizerId ${event.organizerId} does not exist`);
    }
  });

  dataset.faq.forEach((faq) => {
    if (!isValidBranch(faq.branch)) addError(errors, 'faq', faq.id, 'invalid branch');
    if (!isValidSemester(faq.semester)) addError(errors, 'faq', faq.id, 'invalid semester');
    if (!Array.isArray(faq.tags) || faq.tags.length === 0) {
      addError(errors, 'faq', faq.id, 'tags must be a non-empty array');
    }
  });

  dataset.notifications.forEach((notification) => {
    const audience = notification.audience || {};
    if (!isValidBranch(audience.branch)) addError(errors, 'notifications', notification.id, 'invalid audience branch');
    if (!isValidSemester(audience.semester)) {
      addError(errors, 'notifications', notification.id, 'invalid audience semester');
    }
    if (!isValidDivision(audience.division)) {
      addError(errors, 'notifications', notification.id, 'invalid audience division');
    }
    if (!isValidBatch(audience.batch)) addError(errors, 'notifications', notification.id, 'invalid audience batch');

    const relatedIdExists =
      (notification.relatedCollection === 'notices' && noticeIds.has(notification.relatedId)) ||
      (notification.relatedCollection === 'events' && eventIds.has(notification.relatedId)) ||
      (notification.relatedCollection === 'timetable' && timetableIds.has(notification.relatedId));

    if (!relatedIdExists) {
      addError(
        errors,
        'notifications',
        notification.id,
        `relatedId ${notification.relatedId} not found in ${notification.relatedCollection}`
      );
    }
  });

  const filterSmokeTests = runFilterSmokeTests(dataset);
  if (!filterSmokeTests.passed) {
    errors.push(`filter smoke tests failed: ${JSON.stringify(filterSmokeTests)}`);
  }

  if (summary.students < 200 || summary.students > 300) {
    warnings.push(`student count ${summary.students} is outside the requested 200-300 range`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary,
    filterSmokeTests,
  };
};
