/**
 * ============================================================
 * CAMPUS ERP — Seed Script v2 (Lite)
 * ============================================================
 * How to run:    cd scripts && npm install && npm run seed
 * Prerequisites: serviceAccountKey.json (or *firebase-adminsdk*.json)
 *                one level above this folder (../)
 * Expected:      ~160 users  +  ~37 faculty  +  ~96 timetable  +  6 notices
 *                8 events    +    3 fee-structure docs  +  10 FAQs
 *                (~320 documents total)
 * WARNING:       Re-running OVERWRITES existing documents with the
 *                same IDs — all data will be replaced.
 * ============================================================
 */

'use strict';

const admin = require('firebase-admin');
const path  = require('path');
const fs    = require('fs');

// ─── Lite scope (~300–400 docs) ───────────────────────────────────────────────
const SEED_YEARS             = ['FY', 'SY'];
const SEED_BRANCHES          = ['CS', 'CIVIL', 'EXTC', 'MECH'];
const SEED_DIVISIONS         = ['A', 'B'];
const SEED_SECTIONS          = [1, 2];
const STUDENTS_PER_SECTION   = 5;
const SEED_NOTICE_COUNT      = 6;
const SEED_EVENT_COUNT       = 8;
const SEED_FAQ_COUNT         = 10;

const root = path.join(__dirname, '..');

function findServiceAccountPath() {
  const dirs = [root, path.join(root, 'backend')];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    const match = fs.readdirSync(dir).find(
      (f) => f.endsWith('.json') && f.includes('firebase-adminsdk')
    );
    if (match) return { dir, file: match };
  }
  return { dir: root, file: 'serviceAccountKey.json' };
}

const { dir: keyDir, file: keyFile } = findServiceAccountPath();
const serviceAccount = require(path.join(keyDir, keyFile));
console.log(`🔑 Using service account key: ${path.relative(root, path.join(keyDir, keyFile))}`);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const db         = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

// ─── Academic structure ───────────────────────────────────────────────────────
const YEAR_PREFIXES = { FY: '2025', SY: '2024', TY: '2023', LY: '2022' };
const YEAR_NUMBERS  = { FY: 1, SY: 2, TY: 3, LY: 4 };
const BRANCH_CODES  = { CS: '01', CIVIL: '02', EXTC: '03', MECH: '04' };
const DIV_CODES     = { A: '01', B: '02', C: '03', D: '04' };

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ─── Name pools ───────────────────────────────────────────────────────────────
const FIRST_NAMES = [
  'Aarav','Arjun','Rohan','Vikram','Karan','Rahul','Siddharth','Amit',
  'Nikhil','Pranav','Yash','Harsh','Dhruv','Aditya','Kunal','Ravi','Suresh','Mahesh',
  'Deepak','Varun','Tejas','Omkar','Gaurav','Akash','Vishal','Sachin','Ajay','Vijay',
  'Priya','Sneha','Anjali','Pooja','Neha','Riya','Kavya','Divya',
  'Shreya','Tanvi','Sakshi','Nisha','Swati','Meera','Aishwarya','Rutuja','Pallavi',
  'Bhavna','Sonali','Madhuri','Shruti','Gauri','Manasi','Reshma',
];
const LAST_NAMES = [
  'Sharma','Patil','Deshmukh','Kulkarni','Joshi','Shinde','More','Kale',
  'Jadhav','Gaikwad','Bhosale','Deshpande','Wagh','Pawar','Chavan',
];

let nameIdx = 0;

function nextName() {
  const first = FIRST_NAMES[nameIdx % FIRST_NAMES.length];
  const last  = LAST_NAMES[Math.floor(nameIdx / FIRST_NAMES.length) % LAST_NAMES.length];
  nameIdx++;
  return { first, last };
}

function parseFacultyEmail(nameStr) {
  const parts    = nameStr.trim().split(/\s+/);
  const initial  = parts[1].replace('.', '').toLowerCase();
  const lastName = parts[2].toLowerCase();
  return `${initial}.${lastName}@mitaoe.ac.in`;
}

// ─── Subject / faculty data ───────────────────────────────────────────────────
const SUBJECT_DATA = {
  FY: {
    subjects: [
      'Engineering Mathematics-I','Engineering Physics','Engineering Chemistry',
      'Basic Electrical Engineering','Programming & Problem Solving',
      'Engineering Graphics','Communication Skills','Environmental Studies','Workshop Practice',
    ],
    codes:   ['FY101','FY102','FY103','FY104','FY105','FY106','FY107','FY108','FY109'],
    faculty: ['Prof. R. Kulkarni','Prof. S. Joshi','Prof. M. Patil',
              'Prof. A. Shinde','Prof. P. More','Prof. V. Deshmukh'],
  },
  SY_CS: {
    subjects: [
      'Data Structures & Algorithms','Digital Logic Design','Discrete Mathematics',
      'Object Oriented Programming','Computer Organization & Architecture',
      'Database Management Systems','Probability & Statistics','Engineering Mathematics-III',
    ],
    codes:   ['CS201','CS202','CS203','CS204','CS205','CS206','CS207','CS208'],
    faculty: ['Prof. N. Wagh','Prof. K. Chavan','Prof. D. Bhosale',
              'Prof. R. Gaikwad','Prof. S. Pawar','Prof. A. Deshpande'],
  },
  SY_CIVIL: {
    subjects: [
      'Strength of Materials','Fluid Mechanics','Surveying',
      'Building Materials & Construction','Engineering Geology',
      'Applied Mathematics-III','Environmental Science','AutoCAD',
    ],
    codes:   ['CV201','CV202','CV203','CV204','CV205','CV206','CV207','CV208'],
    faculty: ['Prof. B. Chavan','Prof. D. More','Prof. H. Pawar',
              'Prof. L. Bhosale','Prof. T. Kale','Prof. Y. Jadhav'],
  },
  SY_EXTC: {
    subjects: [
      'Analog Electronics','Digital Electronics','Signals & Systems',
      'Electromagnetic Theory','Electronic Devices','Network Analysis',
      'Applied Mathematics-III','Communication Fundamentals',
    ],
    codes:   ['EC201','EC202','EC203','EC204','EC205','EC206','EC207','EC208'],
    faculty: ['Prof. C. Sharma','Prof. F. Kumar','Prof. I. Singh',
              'Prof. O. Verma','Prof. Q. Mehta','Prof. U. Nair'],
  },
  SY_MECH: {
    subjects: [
      'Thermodynamics','Mechanics of Materials','Manufacturing Processes',
      'Fluid Mechanics','Applied Mathematics-III','Machine Drawing',
      'Material Science','Industrial Engineering',
    ],
    codes:   ['ME201','ME202','ME203','ME204','ME205','ME206','ME207','ME208'],
    faculty: ['Prof. E. Rao','Prof. G. Iyer','Prof. J. Pillai',
              'Prof. N. Reddy','Prof. S. Menon','Prof. W. Krishnan'],
  },
  TY_CS: {
    subjects: [
      'Operating Systems','Computer Networks','Software Engineering','Theory of Computation',
      'Artificial Intelligence','Web Technologies','Machine Learning Fundamentals','Cloud Computing Basics',
    ],
    codes:   ['CS301','CS302','CS303','CS304','CS305','CS306','CS307','CS308'],
    faculty: ['Prof. A. Deshmukh','Prof. N. Wagh','Prof. S. Kulkarni','Prof. R. Deshpande',
              'Prof. K. Patil','Prof. M. Shinde','Prof. P. Joshi','Prof. V. Gaikwad'],
  },
  TY_CIVIL: {
    subjects: [
      'Structural Analysis','Geotechnical Engineering','Hydrology & Water Resources',
      'Transportation Engineering','Environmental Engineering','Quantity Surveying',
      'Concrete Technology','Project Planning',
    ],
    codes:   ['CV301','CV302','CV303','CV304','CV305','CV306','CV307','CV308'],
    faculty: ['Prof. B. Chavan','Prof. D. More','Prof. H. Pawar',
              'Prof. L. Bhosale','Prof. T. Kale','Prof. Y. Jadhav'],
  },
  TY_EXTC: {
    subjects: [
      'Microprocessors & Microcontrollers','Communication Engineering','Control Systems','VLSI Design',
      'Digital Signal Processing','Embedded Systems','Antenna Theory','Wireless Networks',
    ],
    codes:   ['EC301','EC302','EC303','EC304','EC305','EC306','EC307','EC308'],
    faculty: ['Prof. C. Sharma','Prof. F. Kumar','Prof. I. Singh',
              'Prof. O. Verma','Prof. Q. Mehta','Prof. U. Nair'],
  },
  TY_MECH: {
    subjects: [
      'Machine Design','Heat Transfer','Industrial Engineering','Dynamics of Machinery',
      'CAD/CAM','Metrology & Quality Control','Refrigeration & AC','Robotics Introduction',
    ],
    codes:   ['ME301','ME302','ME303','ME304','ME305','ME306','ME307','ME308'],
    faculty: ['Prof. E. Rao','Prof. G. Iyer','Prof. J. Pillai',
              'Prof. N. Reddy','Prof. S. Menon','Prof. W. Krishnan'],
  },
  LY_CS: {
    subjects: [
      'Machine Learning','Deep Learning','Cloud Computing','Information Security & Cryptography',
      'Distributed Systems','Big Data Analytics','DevOps Practices','Major Project',
    ],
    codes:   ['CS401','CS402','CS403','CS404','CS405','CS406','CS407','CS408'],
    faculty: ['Prof. A. Deshmukh','Prof. N. Wagh','Prof. S. Kulkarni','Prof. R. Deshpande',
              'Prof. K. Patil','Prof. M. Shinde','Prof. P. Joshi','Prof. V. Gaikwad'],
  },
  LY_CIVIL: {
    subjects: [
      'Design of Structures','Foundation Engineering','Project Management','GIS & Remote Sensing',
      'Advanced Concrete Design','Urban Planning','Major Project',
    ],
    codes:   ['CV401','CV402','CV403','CV404','CV405','CV406','CV407'],
    faculty: ['Prof. B. Chavan','Prof. D. More','Prof. H. Pawar',
              'Prof. L. Bhosale','Prof. T. Kale','Prof. Y. Jadhav'],
  },
  LY_EXTC: {
    subjects: [
      'Wireless Communication','IoT Systems','Robotics & Automation','Optical Communication',
      'Advanced VLSI','Signal Processing Applications','Major Project',
    ],
    codes:   ['EC401','EC402','EC403','EC404','EC405','EC406','EC407'],
    faculty: ['Prof. C. Sharma','Prof. F. Kumar','Prof. I. Singh',
              'Prof. O. Verma','Prof. Q. Mehta','Prof. U. Nair'],
  },
  LY_MECH: {
    subjects: [
      'Design of Machine Elements','Advanced Manufacturing','Finite Element Analysis','Automobile Engineering',
      'Power Plant Engineering','Operations Research','Major Project',
    ],
    codes:   ['ME401','ME402','ME403','ME404','ME405','ME406','ME407'],
    faculty: ['Prof. E. Rao','Prof. G. Iyer','Prof. J. Pillai',
              'Prof. N. Reddy','Prof. S. Menon','Prof. W. Krishnan'],
  },
};

function getSD(year, branch) {
  return year === 'FY' ? SUBJECT_DATA.FY : SUBJECT_DATA[`${year}_${branch}`];
}

const LECTURE_ROOMS = ['CR-101','CR-102','CR-103','CR-201','CR-202','CR-203','CR-301','CR-302'];
const LAB_ROOMS = {
  CS:    ['CS-Lab-1','CS-Lab-2','CS-Lab-3'],
  CIVIL: ['CV-Lab-1','CV-Lab-2','Survey-Lab'],
  EXTC:  ['EC-Lab-1','EC-Lab-2','Electronics-Lab'],
  MECH:  ['ME-Lab-1','Workshop','CAD-Lab'],
};

function buildSlots(year, branch, div, day) {
  const sd       = getSD(year, branch);
  const subs     = sd.subjects;
  const codes    = sd.codes;
  const fac      = sd.faculty;
  const labs     = LAB_ROOMS[branch];
  const di       = DAYS.indexOf(day);
  const dv       = SEED_DIVISIONS.indexOf(div);
  const isSat    = day === 'Saturday';
  const isLabDay = day === 'Tuesday' || day === 'Thursday';

  const sub  = (n) => subs[ (di * 5 + dv + n) % subs.length ];
  const code = (n) => codes[(di * 5 + dv + n) % codes.length];
  const prof = (n) => fac[  (di * 3 + dv + n) % fac.length ];
  const room = (n) => LECTURE_ROOMS[(di * 3 + dv + n) % LECTURE_ROOMS.length];
  const lab  = ()  => labs[(di + dv) % labs.length];

  const slots = [];

  if (isSat) {
    for (let i = 0; i < 4; i++) {
      slots.push({
        slotId: String(i + 1),
        startTime: `${String(8 + i).padStart(2,'0')}:00`,
        endTime:   `${String(9 + i).padStart(2,'0')}:00`,
        subject: sub(i), subjectCode: code(i),
        faculty: prof(i), room: room(i), type: 'lecture',
      });
    }
    return slots;
  }

  for (let i = 0; i < 4; i++) {
    slots.push({
      slotId: String(i + 1),
      startTime: `${String(8 + i).padStart(2,'0')}:00`,
      endTime:   `${String(9 + i).padStart(2,'0')}:00`,
      subject: sub(i), subjectCode: code(i),
      faculty: prof(i), room: room(i), type: 'lecture',
    });
  }

  slots.push({
    slotId: 'L', startTime: '12:00', endTime: '13:00',
    subject: 'Lunch Break', subjectCode: '', faculty: '', room: '', type: 'break',
  });

  slots.push({
    slotId: '5', startTime: '13:00', endTime: '14:00',
    subject: sub(4), subjectCode: code(4),
    faculty: prof(4), room: room(4), type: 'lecture',
  });

  if (isLabDay) {
    slots.push({
      slotId: '6', startTime: '14:00', endTime: '16:00',
      subject: `${sub(5)} Lab`, subjectCode: code(5),
      faculty: prof(5), room: lab(), type: 'lab',
    });
  } else {
    slots.push({
      slotId: '6', startTime: '14:00', endTime: '15:00',
      subject: sub(5), subjectCode: code(5),
      faculty: prof(5), room: room(5), type: 'lecture',
    });
  }

  return slots;
}

class BatchWriter {
  constructor(maxOps = 499) {
    this.maxOps = maxOps;
    this.current = db.batch();
    this.count   = 0;
    this.batches = [];
    this.total   = 0;
  }
  set(ref, data) {
    if (this.count >= this.maxOps) {
      this.batches.push(this.current);
      this.current = db.batch();
      this.count   = 0;
    }
    this.current.set(ref, data);
    this.count++;
    this.total++;
  }
  async commit(label) {
    if (this.count > 0) this.batches.push(this.current);
    const n = this.batches.length;
    for (let i = 0; i < n; i++) {
      console.log(`  📦 Committing batch ${i + 1} of ${n} (${label})…`);
      await this.batches[i].commit();
    }
    return this.total;
  }
}

async function seedUsers() {
  console.log('\n🎓 Starting seed script (lite scope)…');
  console.log('📚 Seeding users…');
  const w = new BatchWriter(499);

  for (const year of SEED_YEARS) {
    for (const branch of SEED_BRANCHES) {
      for (const div of SEED_DIVISIONS) {
        let seq = 1;
        for (const sec of SEED_SECTIONS) {
          for (let s = 0; s < STUDENTS_PER_SECTION; s++) {
            const prn   = `${YEAR_PREFIXES[year]}${BRANCH_CODES[branch]}${DIV_CODES[div]}${String(seq).padStart(4,'0')}`;
            const { first, last } = nextName();
            const email = `${prn}@mitaoe.ac.in`;
            w.set(db.collection('users').doc(prn), {
              uid: prn, prn,
              name: `${first} ${last}`,
              email, branch,
              division: div,
              section: `${div}-${sec}`,
              year,
              yearNumber: YEAR_NUMBERS[year],
              role: 'student',
              isActive: true,
              createdAt: FieldValue.serverTimestamp(),
            });
            seq++;
          }
        }
      }
    }
  }

  const n = await w.commit('users');
  console.log(`✅ Users seeded: ${n} documents`);
}

function buildFacultyList() {
  const DEPT_MAP = {
    FY:       'First Year / General Engineering',
    SY_CS:    'Computer Engineering',    TY_CS:    'Computer Engineering',    LY_CS:    'Computer Engineering',
    SY_CIVIL: 'Civil Engineering',       TY_CIVIL: 'Civil Engineering',       LY_CIVIL: 'Civil Engineering',
    SY_EXTC:  'Electronics & Telecommunication Engineering',
    TY_EXTC:  'Electronics & Telecommunication Engineering',
    LY_EXTC:  'Electronics & Telecommunication Engineering',
    SY_MECH:  'Mechanical Engineering',  TY_MECH:  'Mechanical Engineering',  LY_MECH:  'Mechanical Engineering',
  };

  const facultyMap = {};

  for (const [sdKey, sd] of Object.entries(SUBJECT_DATA)) {
    const dept = DEPT_MAP[sdKey] || 'General';
    const { subjects, codes, faculty } = sd;
    for (let i = 0; i < subjects.length; i++) {
      const facName = faculty[i % faculty.length];
      if (!facultyMap[facName]) {
        facultyMap[facName] = {
          name:          facName,
          email:         parseFacultyEmail(facName),
          department:    dept,
          subjectsTaught: [],
          _seen:         new Set(),
        };
      }
      const subKey = `${subjects[i]}||${codes[i]}`;
      if (!facultyMap[facName]._seen.has(subKey)) {
        facultyMap[facName]._seen.add(subKey);
        facultyMap[facName].subjectsTaught.push({ name: subjects[i], code: codes[i] });
      }
    }
  }

  return Object.values(facultyMap).map(({ _seen, ...rest }) => rest);
}

async function seedFaculty() {
  const list = buildFacultyList();
  console.log(`👨‍🏫 Seeding faculty — ${list.length} documents…`);
  const w = new BatchWriter(499);

  for (const f of list) {
    const docId = f.email.split('@')[0].replace(/\./g, '_');
    w.set(db.collection('faculty').doc(docId), {
      ...f,
      role:      'faculty',
      isActive:  true,
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  const n = await w.commit('faculty');
  console.log(`✅ Faculty seeded: ${n} documents`);
}

async function seedTimetable() {
  const expected = SEED_YEARS.length * SEED_BRANCHES.length * SEED_DIVISIONS.length * DAYS.length;
  console.log(`📅 Seeding timetable — ${expected} documents…`);
  const w = new BatchWriter(499);

  for (const year of SEED_YEARS) {
    for (const branch of SEED_BRANCHES) {
      for (const div of SEED_DIVISIONS) {
        for (const day of DAYS) {
          const docId = `${year}_${branch}_${div}_${day}`;
          w.set(db.collection('timetable').doc(docId), {
            year, branch, division: div, day,
            slots: buildSlots(year, branch, div, day),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      }
    }
  }

  const n = await w.commit('timetable');
  console.log(`✅ Timetable seeded: ${n} documents`);
}

const ALL_NOTICES = [
  {
    title: 'Fee Payment Deadline — AY 2026-27',
    body: 'All students are informed that the last date for payment of tuition and development fees for Academic Year 2026-27 is July 31, 2026. Students with outstanding dues will not be permitted to appear in the mid-semester examination. Payment can be made online through the college ERP portal or via demand draft at the accounts office. For any queries contact the Accounts Department.',
    targetBranch: null, targetDivision: null, targetYear: null, category: 'fees',
  },
  {
    title: 'Mid-Semester Examination Timetable Released',
    body: 'The mid-semester examination timetable for all branches and all years has been released. Students can view their respective examination schedules through the chatbot or notice board. All examinations will be held from September 14 to September 19, 2026. Carry your college ID card for entry to the examination hall. No electronic devices are permitted.',
    targetBranch: null, targetDivision: null, targetYear: null, category: 'examination',
  },
  {
    title: 'GATE 2027 Application Window Open',
    body: 'Applications for GATE 2027 are now open on the official GATE website. Final year students interested in M.Tech admissions or PSU recruitment are encouraged to register before the deadline. The college training and placement cell will conduct GATE orientation sessions. Contact TPO for details.',
    targetBranch: null, targetDivision: null, targetYear: 4, category: 'academic',
  },
  {
    title: 'Library Membership Renewal — All Students',
    body: 'All students are required to renew their library membership for the academic year 2026-27 before July 15, 2026. Bring your college ID card and previous library card to the library counter. New students must obtain library membership within 15 days of admission. Library timings: Monday to Saturday, 8:00 AM to 8:00 PM.',
    targetBranch: null, targetDivision: null, targetYear: null, category: 'general',
  },
  {
    title: 'Hackathon Team Registration — SIH Internal Round',
    body: 'Students interested in participating in the Smart India Hackathon 2026 internal selection round must register their teams by July 20, 2026. Teams must consist of exactly 6 members from any branch or year. Register through the college ERP portal. Problem statements will be shared after team registration. Contact the Innovation Cell for more information.',
    targetBranch: null, targetDivision: null, targetYear: null, category: 'event',
  },
  {
    title: 'Attendance Shortage Warning — TY CS Division B',
    body: 'Students of TY Computer Engineering Division B are informed that attendance records as of June 30, 2026 show a significant number of students below the 75% attendance threshold. Students with attendance below 75% must submit a leave application with valid reasons to the Head of Department within 7 days. Students who fail to maintain required attendance will be detained from appearing in the end-semester examination.',
    targetBranch: 'CS', targetDivision: 'B', targetYear: null, category: 'attendance',
  },
  {
    title: 'Scholarship Application — EBC & OBC Category',
    body: 'Students belonging to EBC (Economically Backward Class) and OBC categories are informed that the scholarship application portal is now open for AY 2026-27. Required documents: income certificate, caste certificate, previous year marksheets, Aadhaar card, bank passbook. Submit applications at the scholarship office by August 31, 2026. Incomplete applications will be rejected.',
    targetBranch: null, targetDivision: null, targetYear: null, category: 'scholarship',
  },
  {
    title: 'National Holiday — Independence Day',
    body: 'The college will remain closed on August 15, 2026 on account of Independence Day. The Flag Hoisting ceremony will be held at 8:00 AM in the college premises. All students and staff are encouraged to attend. Extra lectures lost due to the holiday will be compensated in subsequent weeks.',
    targetBranch: null, targetDivision: null, targetYear: null, category: 'holiday',
  },
  {
    title: 'Lab Manual Submission Deadline — SY EXTC',
    body: 'All students of Second Year Electronics Engineering are reminded that lab manuals for Analog Electronics and Digital Electronics labs must be submitted by July 25, 2026. Incomplete or missing lab journals will result in deduction of marks from the term work component. Contact your respective lab in-charge for submission procedure.',
    targetBranch: 'EXTC', targetDivision: null, targetYear: 2, category: 'academic',
  },
  {
    title: 'Industrial Visit Consent Form — TY MECH',
    body: 'Students of Third Year Mechanical Engineering who have registered for the Tata Motors industrial visit on August 2, 2026 must submit the signed parental consent form and Rs. 500 transport contribution at the department office by July 28, 2026. Students who do not submit the form will not be permitted to attend. Bus departure time is 7:30 AM sharp.',
    targetBranch: 'MECH', targetDivision: null, targetYear: 3, category: 'event',
  },
  {
    title: 'Caution Money Refund — LY Batch 2022',
    body: 'Final year students (admitted in 2022) who are completing their B.Tech degree in 2026 are informed to apply for caution money refund before October 31, 2026. Submit the original caution money receipt, no dues certificate from all departments, and your bank account details at the accounts office. Refund of Rs. 25,000 will be processed within 30 working days.',
    targetBranch: null, targetDivision: null, targetYear: 4, category: 'fees',
  },
  {
    title: 'Anti-Ragging Committee Notice',
    body: 'The college strictly prohibits any form of ragging on campus and online platforms as per UGC Anti-Ragging Regulations 2009 and Maharashtra Anti-Ragging Act. Any incidents must be reported immediately to the Anti-Ragging Committee or helpline 1800-180-5522. All students must submit the anti-ragging undertaking through the AICTE portal. Violation may result in expulsion.',
    targetBranch: null, targetDivision: null, targetYear: null, category: 'general',
  },
];

async function seedNotices() {
  const notices = ALL_NOTICES.slice(0, SEED_NOTICE_COUNT);
  console.log(`📢 Seeding notices — ${notices.length} documents…`);

  const batch = db.batch();
  for (const n of notices) {
    batch.set(db.collection('notices').doc(), {
      ...n,
      isActive: true,
      publishedBy: 'seed_admin',
      publishedAt: FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
  console.log(`✅ Notices seeded: ${notices.length} documents`);
}

const ALL_EVENTS = [
  {
    name: 'Technovanza 2026 - Annual Technical Fest',
    description: 'A 3-day national level technical festival featuring coding competitions, robotics, paper presentations, project expo and cultural events. Open to all branches.',
    date: '2026-08-14', endDate: '2026-08-16', time: '09:00',
    venue: 'Main Auditorium & Sports Ground', targetBranch: null,
    type: 'fest', registrationLink: 'technovanza.mitaoe.ac.in',
  },
  {
    name: 'AI & Machine Learning Workshop',
    description: 'Hands-on workshop on Python, Scikit-learn, TensorFlow and real-world ML projects. Certificate provided. Bring your laptop.',
    date: '2026-07-05', endDate: '2026-07-06', time: '10:00',
    venue: 'CS Lab-2 & CS Lab-3', targetBranch: 'CS',
    type: 'workshop', registrationLink: null,
  },
  {
    name: 'Alumni Connect 2026',
    description: 'Annual alumni meet featuring panel discussions on industry trends, career guidance sessions and networking opportunities with graduates from top companies.',
    date: '2026-07-18', endDate: '2026-07-18', time: '11:00',
    venue: 'Seminar Hall, Building A', targetBranch: null,
    type: 'seminar', registrationLink: null,
  },
  {
    name: 'Smart India Hackathon - Internal Round',
    description: 'Internal selection round for Smart India Hackathon 2026. Teams of 6 will present problem statements and prototypes. Top teams represent college at national level.',
    date: '2026-07-22', endDate: '2026-07-23', time: '09:00',
    venue: 'Seminar Hall & Labs', targetBranch: null,
    type: 'hackathon', registrationLink: null,
  },
  {
    name: 'GATE Preparation Seminar',
    description: 'Expert guidance on GATE 2027 preparation strategy, important topics, recommended resources and mock test series details.',
    date: '2026-07-10', endDate: '2026-07-10', time: '14:00',
    venue: 'Main Auditorium', targetBranch: null,
    type: 'seminar', registrationLink: null,
  },
  {
    name: 'AutoCAD & SolidWorks Certification Workshop',
    description: 'Industry-recognized certification training in AutoCAD 2025 and SolidWorks. Practical sessions on 3D modeling, assembly and drawing.',
    date: '2026-07-25', endDate: '2026-07-27', time: '09:00',
    venue: 'CAD Lab & ME-Lab-1', targetBranch: 'MECH',
    type: 'workshop', registrationLink: null,
  },
  {
    name: 'Industry Visit — Tata Motors, Pune',
    description: 'Educational industrial visit to Tata Motors manufacturing plant. Students will observe automotive manufacturing, robotics assembly lines and quality control processes.',
    date: '2026-08-02', endDate: '2026-08-02', time: '07:30',
    venue: 'College Bus Stand (Departure)', targetBranch: 'MECH',
    type: 'industrial_visit', registrationLink: null,
  },
  {
    name: 'Civil Engineering Site Visit — Metro Rail Project',
    description: 'Site visit to Pune Metro Rail construction site. Students will observe live civil engineering structures, foundation work, and project management in action.',
    date: '2026-08-08', endDate: '2026-08-08', time: '08:00',
    venue: 'College Bus Stand (Departure)', targetBranch: 'CIVIL',
    type: 'industrial_visit', registrationLink: null,
  },
  {
    name: 'IoT & Embedded Systems Bootcamp',
    description: '3-day intensive bootcamp on Arduino, ESP32, Raspberry Pi and IoT cloud platforms. Build and deploy real IoT projects.',
    date: '2026-08-20', endDate: '2026-08-22', time: '09:00',
    venue: 'EC-Lab-1 & EC-Lab-2', targetBranch: 'EXTC',
    type: 'workshop', registrationLink: null,
  },
  {
    name: 'Web Development Bootcamp',
    description: 'Full-stack web development bootcamp covering HTML, CSS, JavaScript, React, Node.js and MongoDB. Beginner-friendly. Build 2 live projects.',
    date: '2026-08-10', endDate: '2026-08-12', time: '09:00',
    venue: 'CS-Lab-1', targetBranch: 'CS',
    type: 'workshop', registrationLink: null,
  },
  {
    name: 'NSS Blood Donation Camp',
    description: 'Annual blood donation camp organized by NSS unit in collaboration with Ruby Hall Clinic, Pune. All healthy students and staff are encouraged to donate.',
    date: '2026-09-01', endDate: '2026-09-01', time: '09:00',
    venue: 'Ground Floor, Building B', targetBranch: null,
    type: 'social', registrationLink: null,
  },
  {
    name: 'Mid-Semester Examination',
    description: 'Mid-semester theory examinations for all branches and years. Timetable will be shared division-wise by examination department. Bring ID card.',
    date: '2026-09-14', endDate: '2026-09-19', time: '10:00',
    venue: 'Respective Examination Halls', targetBranch: null,
    type: 'examination', registrationLink: null,
  },
  {
    name: 'Entrepreneur Startup Talk',
    description: 'Inspirational talk by startup founders and venture capitalists. Topics: idea validation, funding, product development and building teams.',
    date: '2026-09-05', endDate: '2026-09-05', time: '15:00',
    venue: 'Main Auditorium', targetBranch: null,
    type: 'seminar', registrationLink: null,
  },
  {
    name: 'Sports Week 2026',
    description: 'Annual inter-division and inter-branch sports competitions including cricket, football, volleyball, badminton, chess, carrom and athletics.',
    date: '2026-09-21', endDate: '2026-09-26', time: '08:00',
    venue: 'Sports Ground & Indoor Sports Hall', targetBranch: null,
    type: 'sports', registrationLink: null,
  },
  {
    name: 'Campus Placement Orientation — 2026 Batch',
    description: 'Placement orientation for final year students covering placement process, aptitude test patterns, resume building, technical interview tips and company expectations.',
    date: '2026-07-28', endDate: '2026-07-28', time: '10:00',
    venue: 'Main Auditorium', targetBranch: null,
    type: 'placement', registrationLink: null,
  },
];

async function seedEvents() {
  const events = ALL_EVENTS.slice(0, SEED_EVENT_COUNT);
  console.log(`🎉 Seeding events — ${events.length} documents…`);

  const batch = db.batch();
  for (const ev of events) {
    batch.set(db.collection('events').doc(), {
      ...ev,
      createdBy: 'seed_admin',
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
  console.log(`✅ Events seeded: ${events.length} documents`);
}

async function seedFeeStructure() {
  console.log('💰 Seeding fee structure — 3 documents…');
  const batch = db.batch();

  batch.set(db.collection('fee_structure').doc('btech_fy_2026_27'), {
    program: 'B.Tech', year: 'FY', academicYear: '2026-27',
    fees: {
      tuitionFees: 166087,
      developmentFees: 24913,
      universityFees: 737,
      managementSeatFees: 191737,
      nriSeatFees: 382737,
      againstNriSeatFees: 191737,
      cautionMoneyRefundableDeposit: 25000,
    },
    notes: {
      cautionMoney: 'One Time payment, refundable at the time of leaving the institute',
      managementSeat: 'Applicable for management quota admissions',
      nriSeat: 'Applicable for NRI category students',
    },
    updatedAt: FieldValue.serverTimestamp(),
  });

  batch.set(db.collection('fee_structure').doc('bdes_fy_2026_27'), {
    program: 'B.Des', year: 'FY', academicYear: '2026-27',
    fees: {
      tuitionFees: 139130,
      developmentFees: 20870,
      universityFees: 737,
      managementSeatFees: 160737,
      nriSeatFees: 320737,
      againstNriSeatFees: 160737,
      cautionMoneyDeposit: 25000,
    },
    notes: {
      cautionMoney: 'One Time payment',
    },
    updatedAt: FieldValue.serverTimestamp(),
  });

  batch.set(db.collection('fee_structure').doc('mtech_fy_2026_27'), {
    program: 'M.Tech', year: 'FY', academicYear: '2026-27',
    fees: {
      tuitionFees: 72142,
      developmentFees: 10821,
      universityFees: 832,
      totalFeesOpenCategory: 83795,
      scCategoryScholarshipOnly: 11653,
      cautionMoneyRefundableDeposit: 25000,
    },
    notes: {
      openCategory: 'Total fees per year for open category students',
      scCategory: 'Applicable only after scholarship deduction',
      cautionMoney: 'One Time refundable deposit',
    },
    updatedAt: FieldValue.serverTimestamp(),
  });

  await batch.commit();
  console.log('✅ Fee structure seeded: 3 documents');
}

const ALL_FAQS = [
  {
    question: 'What is the minimum attendance required to appear in exams?',
    answer: 'Students must maintain a minimum of 75% attendance in each subject to be eligible to appear in the end-semester examination. Students below 75% will be detained. A student with 60-75% attendance may apply for condonation to the Head of Department with valid medical or other acceptable reasons.',
    category: 'examination',
    keywords: ['attendance','minimum','exam','75','detained','eligibility'],
  },
  {
    question: 'When are supplementary or backlog exams held?',
    answer: 'Supplementary examinations for students with backlogs (ATKT) are typically held in October-November for the even semester and March-April for the odd semester. Students must pay the examination fee and apply through the college examination department within the notified period.',
    category: 'examination',
    keywords: ['supplementary','backlog','ATKT','re-exam','re-appear','failed'],
  },
  {
    question: 'How do I apply for a hall ticket?',
    answer: 'Hall tickets are issued automatically through the college ERP portal approximately 15 days before the examination. Ensure your fees are paid and no dues are pending. Download and print your hall ticket from the portal. Carry it along with your college photo ID card to every examination.',
    category: 'examination',
    keywords: ['hall ticket','admit card','exam entry','download'],
  },
  {
    question: 'What is the grace marks policy?',
    answer: 'As per university norms, grace marks up to a maximum of 5 marks per subject (subject to eligibility criteria) may be awarded to help students clear a subject. Grace marks are applied automatically by the university and are not applied at the college level.',
    category: 'examination',
    keywords: ['grace marks','passing marks','5 marks','borderline'],
  },
  {
    question: 'How is internal assessment calculated?',
    answer: 'Internal assessment (term work / continuous evaluation) typically contributes 25 marks out of a total 100 marks per subject. It includes mid-semester test (15 marks), assignments and class tests (5 marks) and attendance (5 marks). Theory external exam contributes 75 marks.',
    category: 'examination',
    keywords: ['internal marks','term work','IA','continuous evaluation','25 marks'],
  },
  {
    question: 'What happens if I miss the mid-semester exam?',
    answer: 'If you miss the mid-semester examination due to a genuine medical reason, you must submit a medical certificate and apply for a re-test to your Head of Department within 3 days of the examination. Re-tests are granted at the discretion of the HoD and are not guaranteed.',
    category: 'examination',
    keywords: ['miss exam','absent exam','mid sem','re-test','medical'],
  },
  {
    question: 'What is the tuition fee for B.Tech first year?',
    answer: 'The tuition fee for B.Tech First Year (FY) for AY 2026-27 is Rs. 1,66,087 per year. The development fee is Rs. 24,913 per year. University fees are Rs. 737 per year. For management quota seats the total is Rs. 1,91,737 per year. A one-time refundable caution money deposit of Rs. 25,000 is also applicable.',
    category: 'fee',
    keywords: ['tuition fee','btech','first year','FY','fee structure','annual fee'],
  },
  {
    question: 'What is the last date to pay college fees?',
    answer: 'The fee payment deadline for AY 2026-27 is July 31, 2026. Payments can be made online through the college ERP portal or via demand draft at the accounts office. Late payment may attract a penalty and students with outstanding dues will not be permitted to appear in examinations.',
    category: 'fee',
    keywords: ['fee deadline','last date','fee payment','due date'],
  },
  {
    question: 'How do I get a fee receipt?',
    answer: 'After successful fee payment online, your receipt is automatically generated on the ERP portal. Download and save it immediately. For offline payments, collect the receipt from the accounts office. Keep your fee receipts safely as they are required for scholarship applications and other official purposes.',
    category: 'fee',
    keywords: ['fee receipt','payment receipt','download receipt'],
  },
  {
    question: 'Are there any scholarships available?',
    answer: 'Yes, the following scholarships are available: Government of Maharashtra EBC Scholarship, OBC Post-Matric Scholarship, SC/ST Scholarship, Minority Scholarship and Merit Scholarship for top rankers. Visit the scholarship office or check the Maharashtra State Scholarship Portal (mahascholar.com) for eligibility and application details.',
    category: 'fee',
    keywords: ['scholarship','financial aid','EBC','OBC','SC','ST','fee waiver'],
  },
  {
    question: 'What is caution money and will I get it back?',
    answer: 'Caution money is a one-time refundable deposit of Rs. 25,000 collected at the time of admission. It is refunded upon successful completion of your degree and obtaining a no-dues certificate from all departments. Apply for refund at the accounts office within one year of course completion.',
    category: 'fee',
    keywords: ['caution money','refund','deposit','25000','security deposit'],
  },
  {
    question: 'What is the leave application procedure?',
    answer: 'For planned leave (prior intimation), submit a leave application to your class teacher or mentor at least 2 days in advance stating the reason. For unplanned absences due to medical emergencies, submit a medical certificate and leave application within 3 days of returning to college. Leaves are subject to HOD approval.',
    category: 'policy',
    keywords: ['leave','absent','application','procedure','sick leave'],
  },
  {
    question: 'What is the dress code policy?',
    answer: 'Students are expected to dress formally and decently. For labs, formal attire with closed shoes is mandatory for safety reasons. Wearing slippers in labs is strictly prohibited. Formal ID cards must be worn at all times within the campus. The college reserves the right to send students home who violate the dress code.',
    category: 'policy',
    keywords: ['dress code','uniform','formal','ID card','slippers'],
  },
  {
    question: 'What are the library rules?',
    answer: 'Library timings are Monday to Saturday, 8:00 AM to 8:00 PM. Students can borrow up to 3 books for 14 days. A fine of Rs. 2 per day per book is charged for late returns. Mobile phones must be on silent mode inside the library. Reference books and journals cannot be taken out.',
    category: 'policy',
    keywords: ['library','books','borrow','timings','fine','rules'],
  },
  {
    question: 'How do I apply for a bonafide certificate?',
    answer: 'Bonafide certificates can be obtained from the administrative office. Submit a written application mentioning the purpose (bank, railway concession, visa, etc.). The certificate is typically issued within 2-3 working days. Some purposes may require HOD signature additionally.',
    category: 'policy',
    keywords: ['bonafide','certificate','verification','student certificate'],
  },
  {
    question: 'What is the re-admission policy after gap year?',
    answer: 'Students who have taken a gap year may apply for re-admission through the university re-admission process. Contact the examination department with your previous enrollment details. Re-admission is subject to university and college rules and available seats.',
    category: 'policy',
    keywords: ['gap year','re-admission','dropout','return','break'],
  },
  {
    question: 'Where is the library located?',
    answer: 'The central library is located on the ground floor of Building B (Administrative Block). It spans approximately 5000 sq ft and houses over 20,000 books, national and international journals, and e-resources. The digital library section with computer terminals is adjacent to the main reading hall.',
    category: 'campus',
    keywords: ['library','location','where','building','address'],
  },
  {
    question: 'What are the computer lab timings?',
    answer: 'Computer labs (CS-Lab-1, CS-Lab-2, CS-Lab-3) are open Monday to Saturday from 8:00 AM to 8:00 PM. Students can use lab computers during free periods by signing the lab register. Labs are closed on Sundays and public holidays. Internet access is available throughout the campus.',
    category: 'campus',
    keywords: ['computer lab','timings','open','lab hours','internet'],
  },
  {
    question: 'Is there a canteen on campus?',
    answer: 'Yes, the college canteen is located near the main entrance on the ground floor. Canteen timings are 8:00 AM to 6:00 PM on weekdays and 8:00 AM to 2:00 PM on Saturdays. It serves breakfast, lunch, snacks and beverages at subsidized rates. Special dietary options are available on request.',
    category: 'campus',
    keywords: ['canteen','food','mess','cafeteria','timings','lunch'],
  },
  {
    question: 'Where can I park my vehicle on campus?',
    answer: 'Student two-wheeler parking is available in the designated parking zone near Gate 2 (east side of campus). Four-wheeler parking is not permitted for students. Students must register their vehicles with the security office and display the parking sticker. Unauthorized vehicles will be fined.',
    category: 'campus',
    keywords: ['parking','vehicle','bike','two-wheeler','car'],
  },
  {
    question: 'Is there a hostel facility available?',
    answer: "The college does not have its own hostel facility at present. However, the college maintains a list of approved paying guest (PG) accommodations near the campus. Contact the student welfare office for the approved PG list. The college is not responsible for accommodation arranged independently.",
    category: 'campus',
    keywords: ['hostel','accommodation','PG','paying guest','stay','lodging'],
  },
  {
    question: 'How do I register for elective subjects in final year?',
    answer: 'Elective subject registration for LY students is done through the college ERP portal during the registration window (typically June-July). Log in with your college credentials, navigate to Academic Registration and select your preferred electives from the available list. Seats are allocated on a first-come first-served basis. Contact your department for elective availability.',
    category: 'academic',
    keywords: ['elective','subject registration','LY','final year','optional subject'],
  },
  {
    question: 'What is the procedure to change my division?',
    answer: 'Division change requests can be submitted to the Academic Office within the first 2 weeks of a new academic year. Fill the division change request form, get it signed by your current class teacher and the HoD of the department. Changes are approved only if seats are available in the requested division and the academic calendar allows it.',
    category: 'academic',
    keywords: ['division change','section change','transfer','shift division'],
  },
  {
    question: 'How do I get my marksheet or transcript?',
    answer: 'Official marksheets are issued by Savitribai Phule Pune University after each semester examination. They are distributed through the college examination department. For transcripts (for higher education abroad), apply at the university directly or through the college examination office. Processing takes 15-30 working days.',
    category: 'academic',
    keywords: ['marksheet','transcript','result','marks','university','certificate'],
  },
  {
    question: 'What is the KT (Keep Term) or ATKT policy?',
    answer: 'Students who fail in one or more subjects receive ATKT (Allowed To Keep Term) status, meaning they can continue to the next semester while their backlog subjects remain pending. A maximum ATKT limit applies as per university rules. Students must clear all backlogs before the final year to be eligible for degree completion.',
    category: 'academic',
    keywords: ['KT','ATKT','backlog','fail','keep term','allowed to keep term'],
  },
];

async function seedFAQs() {
  const faqs = ALL_FAQS.slice(0, SEED_FAQ_COUNT);
  console.log(`❓ Seeding FAQs — ${faqs.length} documents…`);

  const batch = db.batch();
  for (const faq of faqs) {
    batch.set(db.collection('faqs').doc(), {
      ...faq,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
  console.log(`✅ FAQs seeded: ${faqs.length} documents`);
}

async function main() {
  const userCount =
    SEED_YEARS.length *
    SEED_BRANCHES.length *
    SEED_DIVISIONS.length *
    SEED_SECTIONS.length *
    STUDENTS_PER_SECTION;
  const timetableCount =
    SEED_YEARS.length * SEED_BRANCHES.length * SEED_DIVISIONS.length * DAYS.length;

  console.log('Lite seed plan:');
  console.log(`  users:      ${userCount}`);
  console.log(`  timetable:  ${timetableCount}`);
  console.log(`  notices:    ${SEED_NOTICE_COUNT}`);
  console.log(`  events:     ${SEED_EVENT_COUNT}`);
  console.log(`  faqs:       ${SEED_FAQ_COUNT}`);
  console.log(`  fee_structure: 3`);
  console.log(`  faculty:    (all unique from subject data)`);

  const tasks = [
    { name: 'users',         fn: seedUsers         },
    { name: 'faculty',       fn: seedFaculty       },
    { name: 'timetable',     fn: seedTimetable     },
    { name: 'notices',       fn: seedNotices       },
    { name: 'events',        fn: seedEvents        },
    { name: 'fee_structure', fn: seedFeeStructure  },
    { name: 'faqs',          fn: seedFAQs          },
  ];

  for (const task of tasks) {
    try {
      await task.fn();
    } catch (err) {
      console.error(`\n❌ Failed seeding [${task.name}]: ${err.message}`);
    }
  }

  console.log('\n🚀 Lite seed data pushed successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
