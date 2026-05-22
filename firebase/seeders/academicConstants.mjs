export const SEED_SOURCE = 'dummy_erp_seed_v1';
export const ACADEMIC_YEAR = '2026-2027';
export const DEFAULT_PASSWORD = 'Campus@12345';

export const COLLECTIONS = {
  USERS: 'users',
  STUDENTS: 'students',
  FACULTY: 'faculty',
  TIMETABLE: 'timetable',
  NOTICES: 'notices',
  EVENTS: 'events',
  FAQ: 'faq',
  NOTIFICATIONS: 'notifications',
};

export const BRANCHES = {
  COMPUTER: 'computer_engineering',
  ELECTRONICS: 'electronics_engineering',
  CIVIL: 'civil_engineering',
  MECHANICAL: 'mechanical_engineering',
};

export const BRANCH_DETAILS = {
  [BRANCHES.COMPUTER]: {
    label: 'Computer Engineering',
    shortCode: 'CE',
    department: 'Department of Computer Engineering',
    building: 'Block A',
  },
  [BRANCHES.ELECTRONICS]: {
    label: 'Electronics Engineering',
    shortCode: 'EX',
    department: 'Department of Electronics Engineering',
    building: 'Block B',
  },
  [BRANCHES.CIVIL]: {
    label: 'Civil Engineering',
    shortCode: 'CV',
    department: 'Department of Civil Engineering',
    building: 'Block C',
  },
  [BRANCHES.MECHANICAL]: {
    label: 'Mechanical Engineering',
    shortCode: 'ME',
    department: 'Department of Mechanical Engineering',
    building: 'Block D',
  },
};

export const BRANCH_LIST = Object.values(BRANCHES);
export const DIVISIONS = ['D1', 'D2', 'D3', 'D4'];
export const BATCH_PREFIXES = ['A', 'B', 'C'];
export const BATCHES = DIVISIONS.flatMap((division) =>
  BATCH_PREFIXES.map((prefix) => `${prefix}${division.replace('D', '')}`)
);
export const SEMESTERS = [3, 5, 7];
export const WEEK_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export const TIME_SLOTS = [
  { start: '09:00', end: '10:00', label: '09:00 AM - 10:00 AM' },
  { start: '10:00', end: '11:00', label: '10:00 AM - 11:00 AM' },
  { start: '11:15', end: '12:15', label: '11:15 AM - 12:15 PM' },
  { start: '12:15', end: '13:15', label: '12:15 PM - 01:15 PM' },
  { start: '14:00', end: '15:00', label: '02:00 PM - 03:00 PM' },
  { start: '15:00', end: '16:00', label: '03:00 PM - 04:00 PM' },
];

export const FACULTY_DESIGNATIONS = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Senior Lecturer',
];

export const SUBJECT_CATALOG = {
  [BRANCHES.COMPUTER]: {
    3: [
      { code: 'CE301', name: 'Data Structures', type: 'theory' },
      { code: 'CE302', name: 'Computer Organization', type: 'theory' },
      { code: 'CE303', name: 'Discrete Mathematics', type: 'theory' },
      { code: 'CE304', name: 'Object Oriented Programming', type: 'lab' },
      { code: 'CE305', name: 'Database Management Systems', type: 'theory' },
      { code: 'CE306', name: 'Data Structures Lab', type: 'lab' },
    ],
    5: [
      { code: 'CE501', name: 'Operating Systems', type: 'theory' },
      { code: 'CE502', name: 'Computer Networks', type: 'theory' },
      { code: 'CE503', name: 'Software Engineering', type: 'theory' },
      { code: 'CE504', name: 'Web Technologies', type: 'lab' },
      { code: 'CE505', name: 'Design and Analysis of Algorithms', type: 'theory' },
      { code: 'CE506', name: 'Network Programming Lab', type: 'lab' },
    ],
    7: [
      { code: 'CE701', name: 'Artificial Intelligence', type: 'theory' },
      { code: 'CE702', name: 'Cloud Computing', type: 'theory' },
      { code: 'CE703', name: 'Cyber Security', type: 'theory' },
      { code: 'CE704', name: 'Machine Learning Lab', type: 'lab' },
      { code: 'CE705', name: 'Big Data Analytics', type: 'theory' },
      { code: 'CE706', name: 'Project Phase I', type: 'project' },
    ],
  },
  [BRANCHES.ELECTRONICS]: {
    3: [
      { code: 'EX301', name: 'Electronic Devices and Circuits', type: 'theory' },
      { code: 'EX302', name: 'Digital Logic Design', type: 'theory' },
      { code: 'EX303', name: 'Signals and Systems', type: 'theory' },
      { code: 'EX304', name: 'Network Theory Lab', type: 'lab' },
      { code: 'EX305', name: 'Analog Communication', type: 'theory' },
      { code: 'EX306', name: 'Digital Electronics Lab', type: 'lab' },
    ],
    5: [
      { code: 'EX501', name: 'Microprocessors and Microcontrollers', type: 'theory' },
      { code: 'EX502', name: 'Digital Signal Processing', type: 'theory' },
      { code: 'EX503', name: 'Control Systems', type: 'theory' },
      { code: 'EX504', name: 'Embedded Systems Lab', type: 'lab' },
      { code: 'EX505', name: 'VLSI Design', type: 'theory' },
      { code: 'EX506', name: 'DSP Lab', type: 'lab' },
    ],
    7: [
      { code: 'EX701', name: 'Internet of Things', type: 'theory' },
      { code: 'EX702', name: 'Wireless Communication', type: 'theory' },
      { code: 'EX703', name: 'Robotics and Automation', type: 'theory' },
      { code: 'EX704', name: 'IoT Systems Lab', type: 'lab' },
      { code: 'EX705', name: 'Satellite Communication', type: 'theory' },
      { code: 'EX706', name: 'Project Phase I', type: 'project' },
    ],
  },
  [BRANCHES.CIVIL]: {
    3: [
      { code: 'CV301', name: 'Strength of Materials', type: 'theory' },
      { code: 'CV302', name: 'Surveying', type: 'theory' },
      { code: 'CV303', name: 'Fluid Mechanics', type: 'theory' },
      { code: 'CV304', name: 'Surveying Lab', type: 'lab' },
      { code: 'CV305', name: 'Building Materials', type: 'theory' },
      { code: 'CV306', name: 'Materials Testing Lab', type: 'lab' },
    ],
    5: [
      { code: 'CV501', name: 'Structural Analysis', type: 'theory' },
      { code: 'CV502', name: 'Geotechnical Engineering', type: 'theory' },
      { code: 'CV503', name: 'Transportation Engineering', type: 'theory' },
      { code: 'CV504', name: 'Concrete Technology Lab', type: 'lab' },
      { code: 'CV505', name: 'Environmental Engineering', type: 'theory' },
      { code: 'CV506', name: 'Soil Mechanics Lab', type: 'lab' },
    ],
    7: [
      { code: 'CV701', name: 'Design of Steel Structures', type: 'theory' },
      { code: 'CV702', name: 'Water Resources Engineering', type: 'theory' },
      { code: 'CV703', name: 'Construction Management', type: 'theory' },
      { code: 'CV704', name: 'CAD and BIM Lab', type: 'lab' },
      { code: 'CV705', name: 'Advanced Foundation Design', type: 'theory' },
      { code: 'CV706', name: 'Project Phase I', type: 'project' },
    ],
  },
  [BRANCHES.MECHANICAL]: {
    3: [
      { code: 'ME301', name: 'Thermodynamics', type: 'theory' },
      { code: 'ME302', name: 'Manufacturing Processes', type: 'theory' },
      { code: 'ME303', name: 'Fluid Mechanics', type: 'theory' },
      { code: 'ME304', name: 'Workshop Practice Lab', type: 'lab' },
      { code: 'ME305', name: 'Engineering Metallurgy', type: 'theory' },
      { code: 'ME306', name: 'Fluid Mechanics Lab', type: 'lab' },
    ],
    5: [
      { code: 'ME501', name: 'Machine Design', type: 'theory' },
      { code: 'ME502', name: 'Heat Transfer', type: 'theory' },
      { code: 'ME503', name: 'Industrial Engineering', type: 'theory' },
      { code: 'ME504', name: 'CAD CAM Lab', type: 'lab' },
      { code: 'ME505', name: 'Dynamics of Machinery', type: 'theory' },
      { code: 'ME506', name: 'Thermal Engineering Lab', type: 'lab' },
    ],
    7: [
      { code: 'ME701', name: 'Automobile Engineering', type: 'theory' },
      { code: 'ME702', name: 'Robotics', type: 'theory' },
      { code: 'ME703', name: 'Finite Element Analysis', type: 'theory' },
      { code: 'ME704', name: 'Automation Lab', type: 'lab' },
      { code: 'ME705', name: 'Energy Systems', type: 'theory' },
      { code: 'ME706', name: 'Project Phase I', type: 'project' },
    ],
  },
};

export const NOTICE_CATEGORIES = ['academic', 'exam', 'administrative', 'placement'];
export const EVENT_CATEGORIES = ['academic', 'technical', 'cultural', 'sports', 'placement'];
export const NOTIFICATION_TYPES = ['notice', 'event', 'schedule_update', 'reminder'];
