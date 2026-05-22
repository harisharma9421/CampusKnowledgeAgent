import {
  ACADEMIC_YEAR,
  BATCH_PREFIXES,
  BRANCH_DETAILS,
  BRANCH_LIST,
  COLLECTIONS,
  DEFAULT_PASSWORD,
  DIVISIONS,
  EVENT_CATEGORIES,
  FACULTY_DESIGNATIONS,
  NOTICE_CATEGORIES,
  NOTIFICATION_TYPES,
  SEED_SOURCE,
  SEMESTERS,
  SUBJECT_CATALOG,
  TIME_SLOTS,
  WEEK_DAYS,
} from './academicConstants.mjs';

const FIRST_NAMES = [
  'Aarav',
  'Aditi',
  'Akash',
  'Ananya',
  'Arjun',
  'Bhavya',
  'Chirag',
  'Diya',
  'Esha',
  'Farhan',
  'Gauri',
  'Harsh',
  'Isha',
  'Kabir',
  'Kavya',
  'Laksh',
  'Meera',
  'Nikhil',
  'Pranav',
  'Riya',
  'Saanvi',
  'Tanmay',
  'Urvi',
  'Vivaan',
];

const LAST_NAMES = [
  'Sharma',
  'Patel',
  'Iyer',
  'Kulkarni',
  'Mehta',
  'Nair',
  'Rao',
  'Deshmukh',
  'Joshi',
  'Khan',
  'Pillai',
  'Verma',
  'Reddy',
  'Saxena',
  'Bose',
  'Chatterjee',
];

const FACULTY_FIRST_NAMES = [
  'Anil',
  'Neha',
  'Rajesh',
  'Swati',
  'Manish',
  'Priya',
  'Suresh',
  'Kiran',
  'Deepa',
  'Vikram',
  'Leena',
  'Mahesh',
  'Pooja',
  'Sameer',
  'Rachna',
  'Nitin',
];

const HALLS = ['Auditorium', 'Seminar Hall A', 'Innovation Lab', 'Open Air Theater'];
const PRIORITIES = ['low', 'normal', 'high'];

const slug = (value) =>
  String(value)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const branchCode = (branch) => BRANCH_DETAILS[branch].shortCode.toLowerCase();

const addDays = (date, days) => {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
};

const addMinutes = (time, minutes) => {
  const [hours, mins] = time.split(':').map(Number);
  const total = hours * 60 + mins + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

const makeBaseRecord = (now, extra = {}) => ({
  source: SEED_SOURCE,
  isActive: true,
  createdAt: now.toISOString(),
  updatedAt: now.toISOString(),
  ...extra,
});

const getBranchSubjects = (branch) =>
  SEMESTERS.flatMap((semester) =>
    SUBJECT_CATALOG[branch][semester].map((subject) => ({
      ...subject,
      semester,
      branch,
    }))
  );

const makeStudentEmail = (rollNumber) => `${rollNumber.toLowerCase()}@student.nexuscampus.edu`;

const makeFacultyEmail = (employeeId) => `${employeeId.toLowerCase()}@faculty.nexuscampus.edu`;

const createSeedUsers = (now, passwordHash) => [
  {
    id: 'admin_academic_office',
    uid: 'admin_academic_office',
    email: 'academic.office@nexuscampus.edu',
    displayName: 'Academic Office Admin',
    role: 'admin',
    passwordHash,
    branch: null,
    semester: null,
    division: null,
    batch: null,
    rollNumber: null,
    employeeId: 'ADM-001',
    department: 'Academic Administration',
    isActive: true,
    source: SEED_SOURCE,
    lastLoginAt: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: 'admin_erp_coordinator',
    uid: 'admin_erp_coordinator',
    email: 'erp.coordinator@nexuscampus.edu',
    displayName: 'ERP Coordinator',
    role: 'admin',
    passwordHash,
    branch: null,
    semester: null,
    division: null,
    batch: null,
    rollNumber: null,
    employeeId: 'ADM-002',
    department: 'Digital Campus Cell',
    isActive: true,
    source: SEED_SOURCE,
    lastLoginAt: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
];

const generateFaculty = (now, passwordHash) => {
  const users = [];
  const faculty = [];

  BRANCH_LIST.forEach((branch, branchIndex) => {
    const details = BRANCH_DETAILS[branch];
    const subjects = getBranchSubjects(branch);

    for (let index = 0; index < 8; index += 1) {
      const employeeId = `${details.shortCode}-FAC-${String(index + 1).padStart(3, '0')}`;
      const userId = `user_faculty_${branchCode(branch)}_${String(index + 1).padStart(3, '0')}`;
      const facultyId = `faculty_${branchCode(branch)}_${String(index + 1).padStart(3, '0')}`;
      const firstName = FACULTY_FIRST_NAMES[(branchIndex * 4 + index) % FACULTY_FIRST_NAMES.length];
      const lastName = LAST_NAMES[(branchIndex * 5 + index) % LAST_NAMES.length];
      const displayName = `${firstName} ${lastName}`;
      const assignedSubjects = [
        subjects[index % subjects.length],
        subjects[(index + 4) % subjects.length],
        subjects[(index + 9) % subjects.length],
      ];

      users.push({
        id: userId,
        uid: userId,
        email: makeFacultyEmail(employeeId),
        displayName,
        role: 'faculty',
        passwordHash,
        branch,
        semester: null,
        division: null,
        batch: null,
        rollNumber: null,
        employeeId,
        department: details.department,
        isActive: true,
        source: SEED_SOURCE,
        lastLoginAt: null,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });

      faculty.push({
        id: facultyId,
        userId,
        employeeId,
        displayName,
        email: makeFacultyEmail(employeeId),
        phone: `+91-98765${String(branchIndex + 1)}${String(index + 10).padStart(2, '0')}`,
        department: details.department,
        branch,
        designation: FACULTY_DESIGNATIONS[index % FACULTY_DESIGNATIONS.length],
        office: `${details.building}-${200 + index}`,
        officeHours: index % 2 === 0 ? 'Mon/Wed 03:00 PM - 04:00 PM' : 'Tue/Thu 02:00 PM - 03:00 PM',
        subjects: assignedSubjects.map((subject) => subject.name),
        subjectCodes: assignedSubjects.map((subject) => subject.code),
        expertise: assignedSubjects.map((subject) => subject.name),
        joiningYear: 2014 + ((branchIndex + index) % 8),
        source: SEED_SOURCE,
        isActive: true,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });
    }
  });

  return { users, faculty };
};

const generateStudents = (now, passwordHash) => {
  const users = [];
  const students = [];

  BRANCH_LIST.forEach((branch, branchIndex) => {
    const details = BRANCH_DETAILS[branch];
    let branchSerial = 1;

    SEMESTERS.forEach((semester) => {
      DIVISIONS.forEach((division, divisionIndex) => {
        for (let localIndex = 0; localIndex < 5; localIndex += 1) {
          const batchPrefix = BATCH_PREFIXES[localIndex % BATCH_PREFIXES.length];
          const batch = `${batchPrefix}${divisionIndex + 1}`;
          const rollNumber = `${details.shortCode}26${String(semester).padStart(2, '0')}${division}${String(
            localIndex + 1
          ).padStart(2, '0')}`;
          const userId = `user_student_${branchCode(branch)}_${String(branchSerial).padStart(3, '0')}`;
          const studentId = `student_${branchCode(branch)}_${String(branchSerial).padStart(3, '0')}`;
          const firstName = FIRST_NAMES[(branchIndex * 6 + branchSerial + localIndex) % FIRST_NAMES.length];
          const lastName = LAST_NAMES[(branchIndex * 4 + branchSerial + divisionIndex) % LAST_NAMES.length];
          const displayName = `${firstName} ${lastName}`;

          users.push({
            id: userId,
            uid: userId,
            email: makeStudentEmail(rollNumber),
            displayName,
            role: 'student',
            passwordHash,
            branch,
            semester,
            division,
            batch,
            rollNumber,
            employeeId: null,
            department: null,
            isActive: true,
            source: SEED_SOURCE,
            lastLoginAt: null,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
          });

          students.push({
            id: studentId,
            userId,
            rollNumber,
            prn: `PRN2026${details.shortCode}${String(branchSerial).padStart(4, '0')}`,
            displayName,
            email: makeStudentEmail(rollNumber),
            phone: `+91-90000${String(branchIndex + 1)}${String(branchSerial).padStart(3, '0')}`,
            branch,
            branchLabel: details.label,
            semester,
            division,
            batch,
            enrollmentYear: 2023 + Math.floor((8 - semester) / 2),
            currentAcademicYear: ACADEMIC_YEAR,
            mentorFacultyId: `faculty_${branchCode(branch)}_${String((divisionIndex % 8) + 1).padStart(3, '0')}`,
            guardianName: `${FIRST_NAMES[(branchSerial + 8) % FIRST_NAMES.length]} ${lastName}`,
            address: `${12 + branchSerial}, Knowledge Park, Pune`,
            source: SEED_SOURCE,
            isActive: true,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
          });

          branchSerial += 1;
        }
      });
    });
  });

  return { users, students };
};

const findFacultyForSubject = (faculty, branch, subjectCode, fallbackIndex = 0) => {
  const match = faculty.find((member) => member.branch === branch && member.subjectCodes.includes(subjectCode));
  if (match) {
    return match;
  }
  const branchFaculty = faculty.filter((member) => member.branch === branch);
  return branchFaculty[fallbackIndex % branchFaculty.length];
};

const generateTimetable = (now, faculty) => {
  const records = [];

  BRANCH_LIST.forEach((branch) => {
    const details = BRANCH_DETAILS[branch];
    SEMESTERS.forEach((semester) => {
      DIVISIONS.forEach((division, divisionIndex) => {
        const subjects = SUBJECT_CATALOG[branch][semester];
        const schedule = {};

        WEEK_DAYS.forEach((day, dayIndex) => {
          const slotCount = day === 'saturday' ? 3 : 6;
          schedule[day] = TIME_SLOTS.slice(0, slotCount).map((slot, slotIndex) => {
            const subject = subjects[(dayIndex + slotIndex + divisionIndex) % subjects.length];
            const assignedFaculty = findFacultyForSubject(
              faculty,
              branch,
              subject.code,
              dayIndex + slotIndex + divisionIndex
            );
            const isLab = subject.type === 'lab' || subject.type === 'project';
            const batchPrefix = BATCH_PREFIXES[(dayIndex + slotIndex) % BATCH_PREFIXES.length];
            const batch = isLab ? `${batchPrefix}${divisionIndex + 1}` : null;
            const roomPrefix = isLab ? 'LAB' : 'CR';

            return {
              slotId: `${day}_${slotIndex + 1}`,
              startTime: slot.start,
              endTime: isLab ? addMinutes(slot.start, 120) : slot.end,
              label: isLab ? `${slot.label.split(' - ')[0]} - ${addMinutes(slot.start, 120)}` : slot.label,
              subjectCode: subject.code,
              subject: subject.name,
              type: subject.type,
              facultyId: assignedFaculty.id,
              facultyName: assignedFaculty.displayName,
              room: `${details.building}-${roomPrefix}-${semester}${divisionIndex + 1}`,
              batch,
            };
          });
        });

        records.push({
          id: `tt_${branchCode(branch)}_sem${semester}_${division.toLowerCase()}`,
          branch,
          branchLabel: details.label,
          semester,
          division,
          academicYear: ACADEMIC_YEAR,
          effectiveFrom: '2026-06-15',
          effectiveTo: '2026-11-30',
          schedule,
          source: SEED_SOURCE,
          isActive: true,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        });
      });
    });
  });

  return records;
};

const generateNotices = (now, faculty) => {
  const notices = [];
  const globalTemplates = [
    ['Academic calendar released', 'The academic calendar for 2026-2027 has been published on the ERP portal.'],
    ['Library membership renewal', 'Students must renew library cards before the end of the month.'],
    ['Mid-semester exam schedule', 'The mid-semester examination schedule is available for all departments.'],
    ['Scholarship document verification', 'Eligible students should submit scholarship documents to the accounts office.'],
    ['Campus maintenance window', 'ERP services may be unavailable during the scheduled maintenance window.'],
    ['Anti-ragging undertaking', 'All students must submit the online anti-ragging undertaking for the current year.'],
    ['Training and placement registration', 'Final year students should complete placement registration by Friday.'],
    ['Sports trial registration', 'Registrations are open for institute-level sports team trials.'],
  ];

  globalTemplates.forEach(([title, content], index) => {
    const postedBy = faculty[index % faculty.length];
    notices.push({
      id: `notice_global_${String(index + 1).padStart(2, '0')}`,
      title,
      content,
      category: NOTICE_CATEGORIES[index % NOTICE_CATEGORIES.length],
      branch: 'all',
      semester: 0,
      division: 'all',
      postedBy: postedBy.userId,
      postedByName: postedBy.displayName,
      priority: PRIORITIES[index % PRIORITIES.length],
      attachmentUrl: null,
      expiresAt: addDays(now, 45 + index).toISOString(),
      ...makeBaseRecord(now),
    });
  });

  BRANCH_LIST.forEach((branch, branchIndex) => {
    const details = BRANCH_DETAILS[branch];
    const branchFaculty = faculty.filter((member) => member.branch === branch);
    const subjects = SUBJECT_CATALOG[branch][5];

    subjects.slice(0, 4).forEach((subject, index) => {
      notices.push({
        id: `notice_${branchCode(branch)}_${String(index + 1).padStart(2, '0')}`,
        title: `${details.label}: ${subject.name} assessment plan`,
        content: `${subject.name} continuous assessment submissions will be reviewed during the next practical/tutorial session.`,
        category: index % 2 === 0 ? 'academic' : 'exam',
        branch,
        semester: index % 2 === 0 ? 5 : 0,
        division: 'all',
        postedBy: branchFaculty[index % branchFaculty.length].userId,
        postedByName: branchFaculty[index % branchFaculty.length].displayName,
        priority: index === 0 ? 'high' : 'normal',
        attachmentUrl: null,
        expiresAt: addDays(now, 30 + branchIndex * 4 + index).toISOString(),
        ...makeBaseRecord(now),
      });
    });

    SEMESTERS.forEach((semester, semIndex) => {
      notices.push({
        id: `notice_${branchCode(branch)}_sem${semester}_tutorial`,
        title: `${details.shortCode} Semester ${semester} tutorial batch update`,
        content: `Tutorial batches for Semester ${semester} have been aligned with the ERP batch allocation. Students should verify their division and batch before lab sessions.`,
        category: 'academic',
        branch,
        semester,
        division: 'all',
        postedBy: branchFaculty[semIndex % branchFaculty.length].userId,
        postedByName: branchFaculty[semIndex % branchFaculty.length].displayName,
        priority: 'normal',
        attachmentUrl: null,
        expiresAt: addDays(now, 35 + semIndex).toISOString(),
        ...makeBaseRecord(now),
      });
    });
  });

  return notices;
};

const generateEvents = (now, faculty) => {
  const records = [];
  const globalEvents = [
    ['Orientation and ERP walkthrough', 'Hands-on session for using the campus ERP and chatbot assistant.'],
    ['Annual technical symposium', 'Project exhibitions, invited talks, and coding/design competitions.'],
    ['Inter-branch sports meet', 'Athletics, football, chess, table tennis, and volleyball events.'],
    ['Cultural evening', 'Music, drama, dance, and literary performances by student clubs.'],
    ['Alumni interaction day', 'Recent alumni will discuss internships, placements, and higher studies.'],
    ['Innovation challenge', 'Teams will present working prototypes for campus and community problems.'],
    ['Research poster day', 'Faculty and students will present ongoing research and mini projects.'],
    ['Career readiness bootcamp', 'Resume clinics, mock interviews, aptitude practice, and HR sessions.'],
  ];

  globalEvents.forEach(([title, description], index) => {
    const organizer = faculty[(index * 3) % faculty.length];
    records.push({
      id: `event_global_${String(index + 1).padStart(2, '0')}`,
      title,
      description,
      eventDate: addDays(now, 7 + index * 5).toISOString(),
      registrationDeadline: addDays(now, 4 + index * 5).toISOString(),
      venue: HALLS[index % HALLS.length],
      organizer: organizer.displayName,
      organizerId: organizer.userId,
      category: EVENT_CATEGORIES[index % EVENT_CATEGORIES.length],
      branch: 'all',
      semester: 0,
      maxParticipants: 120 + index * 20,
      registrationUrl: `/events/event_global_${String(index + 1).padStart(2, '0')}`,
      ...makeBaseRecord(now),
    });
  });

  BRANCH_LIST.forEach((branch, branchIndex) => {
    const details = BRANCH_DETAILS[branch];
    const branchFaculty = faculty.filter((member) => member.branch === branch);
    SEMESTERS.forEach((semester, semIndex) => {
      const subject = SUBJECT_CATALOG[branch][semester][semIndex];
      records.push({
        id: `event_${branchCode(branch)}_sem${semester}_workshop`,
        title: `${details.shortCode} Semester ${semester} ${subject.name} workshop`,
        description: `A focused workshop for ${details.label} Semester ${semester} students covering applied ${subject.name} problems.`,
        eventDate: addDays(now, 15 + branchIndex * 6 + semIndex * 3).toISOString(),
        registrationDeadline: addDays(now, 12 + branchIndex * 6 + semIndex * 3).toISOString(),
        venue: `${details.building} Seminar Room`,
        organizer: branchFaculty[semIndex % branchFaculty.length].displayName,
        organizerId: branchFaculty[semIndex % branchFaculty.length].userId,
        category: semIndex === 0 ? 'academic' : 'technical',
        branch,
        semester,
        maxParticipants: 80,
        registrationUrl: `/events/event_${branchCode(branch)}_sem${semester}_workshop`,
        ...makeBaseRecord(now),
      });
    });

    records.push({
      id: `event_${branchCode(branch)}_parents_meet`,
      title: `${details.label} parents meet`,
      description: `Department review meeting for academic progress, attendance, mentoring, and project readiness.`,
      eventDate: addDays(now, 50 + branchIndex * 4).toISOString(),
      registrationDeadline: addDays(now, 45 + branchIndex * 4).toISOString(),
      venue: `${details.building} Conference Room`,
      organizer: branchFaculty[0].displayName,
      organizerId: branchFaculty[0].userId,
      category: 'academic',
      branch,
      semester: 0,
      maxParticipants: 160,
      registrationUrl: `/events/event_${branchCode(branch)}_parents_meet`,
      ...makeBaseRecord(now),
    });
  });

  return records;
};

const generateFaq = (now) => {
  const globalFaqs = [
    ['How do I reset my ERP password?', 'Use the forgot password option on the login page or contact the Digital Campus Cell.'],
    ['Where can I see my timetable?', 'Open the timetable section after logging in. It is filtered by your branch, semester, and division.'],
    ['How are lab batches assigned?', 'Lab batches are assigned by division using A, B, and C batch groups in the ERP profile.'],
    ['Where are notices published?', 'Official academic notices are published in the notices section and mirrored as notifications.'],
    ['How do I contact my mentor?', 'Your mentor faculty is shown in your student profile and can also be found in faculty search.'],
    ['When are internal marks updated?', 'Internal assessment marks are usually updated after faculty verification and department moderation.'],
    ['How can I register for events?', 'Open the events section, select an active event, and use the registration link if available.'],
    ['Who updates timetable changes?', 'Department timetable coordinators publish timetable changes through the academic office.'],
    ['Can I see notices for other branches?', 'Students primarily see global notices and notices for their own branch and semester.'],
    ['How do I report incorrect profile data?', 'Raise a request with the academic office with your roll number and correction details.'],
    ['Where can I find exam schedules?', 'Exam schedules are published as high-priority notices and may also appear as notifications.'],
    ['Does the chatbot create official data?', 'No. The chatbot answers using backend-approved ERP data and does not create official records.'],
  ];

  const records = globalFaqs.map(([question, answer], index) => ({
    id: `faq_global_${String(index + 1).padStart(2, '0')}`,
    question,
    answer,
    category: ['erp', 'timetable', 'notices', 'events'][index % 4],
    tags: [slug(question).split('_')[0], 'student_help', 'erp'],
    branch: 'all',
    semester: 0,
    embedding: [],
    ...makeBaseRecord(now),
  }));

  BRANCH_LIST.forEach((branch) => {
    const details = BRANCH_DETAILS[branch];
    SEMESTERS.forEach((semester) => {
      const primarySubject = SUBJECT_CATALOG[branch][semester][0];
      const labSubject = SUBJECT_CATALOG[branch][semester].find((subject) => subject.type === 'lab');

      records.push({
        id: `faq_${branchCode(branch)}_sem${semester}_mentor`,
        question: `Who coordinates mentoring for ${details.label} Semester ${semester}?`,
        answer: `The department mentor faculty mapped in each student profile coordinates mentoring for ${details.label} Semester ${semester}.`,
        category: 'faculty',
        tags: ['mentor', branchCode(branch), `semester_${semester}`],
        branch,
        semester,
        embedding: [],
        ...makeBaseRecord(now),
      });

      records.push({
        id: `faq_${branchCode(branch)}_sem${semester}_lab`,
        question: `Which lab batch should I attend for ${labSubject.name}?`,
        answer: `Attend ${labSubject.name} according to the batch shown in your ERP profile and the timetable slot for your division.`,
        category: 'timetable',
        tags: ['lab', branchCode(branch), slug(labSubject.name)],
        branch,
        semester,
        embedding: [],
        ...makeBaseRecord(now),
      });

      records.push({
        id: `faq_${branchCode(branch)}_sem${semester}_subject`,
        question: `What is covered in ${primarySubject.name}?`,
        answer: `${primarySubject.name} is a core Semester ${semester} subject for ${details.label}. Follow faculty notices for assessment and practical requirements.`,
        category: 'academic',
        tags: ['subject', branchCode(branch), slug(primarySubject.name)],
        branch,
        semester,
        embedding: [],
        ...makeBaseRecord(now),
      });
    });
  });

  return records;
};

const generateNotifications = (now, notices, events) => {
  const records = [];

  notices.slice(0, 28).forEach((notice, index) => {
    records.push({
      id: `notification_notice_${String(index + 1).padStart(2, '0')}`,
      type: 'notice',
      title: notice.title,
      message: notice.content,
      priority: notice.priority,
      audience: {
        role: 'student',
        branch: notice.branch,
        semester: notice.semester,
        division: notice.division,
        batch: 'all',
      },
      relatedCollection: COLLECTIONS.NOTICES,
      relatedId: notice.id,
      readBy: [],
      deliveryChannels: ['in_app'],
      scheduledAt: notice.createdAt,
      expiresAt: notice.expiresAt,
      ...makeBaseRecord(now),
    });
  });

  events.slice(0, 24).forEach((event, index) => {
    records.push({
      id: `notification_event_${String(index + 1).padStart(2, '0')}`,
      type: 'event',
      title: event.title,
      message: `${event.title} is scheduled at ${event.venue}. Registration closes before the event date.`,
      priority: 'normal',
      audience: {
        role: 'student',
        branch: event.branch,
        semester: event.semester,
        division: 'all',
        batch: 'all',
      },
      relatedCollection: COLLECTIONS.EVENTS,
      relatedId: event.id,
      readBy: [],
      deliveryChannels: ['in_app'],
      scheduledAt: now.toISOString(),
      expiresAt: addDays(now, 60 + index).toISOString(),
      ...makeBaseRecord(now),
    });
  });

  BRANCH_LIST.forEach((branch) => {
    SEMESTERS.forEach((semester) => {
      DIVISIONS.forEach((division) => {
        const id = `notification_schedule_${branchCode(branch)}_sem${semester}_${division.toLowerCase()}`;
        records.push({
          id,
          type: NOTIFICATION_TYPES[2],
          title: `Timetable updated for Semester ${semester} ${division}`,
          message: `The ${BRANCH_DETAILS[branch].label} Semester ${semester} ${division} timetable has been updated in the ERP.`,
          priority: 'high',
          audience: {
            role: 'student',
            branch,
            semester,
            division,
            batch: 'all',
          },
          relatedCollection: COLLECTIONS.TIMETABLE,
          relatedId: `tt_${branchCode(branch)}_sem${semester}_${division.toLowerCase()}`,
          readBy: [],
          deliveryChannels: ['in_app', 'email'],
          scheduledAt: now.toISOString(),
          expiresAt: addDays(now, 14).toISOString(),
          ...makeBaseRecord(now),
        });
      });
    });
  });

  return records;
};

export const buildGeneratedErpDataset = ({
  now = new Date('2026-06-01T09:00:00.000Z'),
  passwordHash = `plain:${DEFAULT_PASSWORD}`,
} = {}) => {
  const seedUsers = createSeedUsers(now, passwordHash);
  const facultyResult = generateFaculty(now, passwordHash);
  const studentResult = generateStudents(now, passwordHash);
  const users = [...seedUsers, ...facultyResult.users, ...studentResult.users];
  const faculty = facultyResult.faculty;
  const students = studentResult.students;
  const timetable = generateTimetable(now, faculty);
  const notices = generateNotices(now, faculty);
  const events = generateEvents(now, faculty);
  const faq = generateFaq(now);
  const notifications = generateNotifications(now, notices, events);

  return {
    users,
    students,
    faculty,
    timetable,
    notices,
    events,
    faq,
    notifications,
  };
};

export const getCollectionPlan = () => [
  { key: 'users', collection: COLLECTIONS.USERS },
  { key: 'students', collection: COLLECTIONS.STUDENTS },
  { key: 'faculty', collection: COLLECTIONS.FACULTY },
  { key: 'timetable', collection: COLLECTIONS.TIMETABLE },
  { key: 'notices', collection: COLLECTIONS.NOTICES },
  { key: 'events', collection: COLLECTIONS.EVENTS },
  { key: 'faq', collection: COLLECTIONS.FAQ },
  { key: 'notifications', collection: COLLECTIONS.NOTIFICATIONS },
];
