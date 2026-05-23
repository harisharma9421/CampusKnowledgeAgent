import { z } from 'zod';
import { BATCHES, DIVISIONS, ROLE_LIST } from '../constants/auth.js';

const branchEnum = z.enum([
  'all',
  'computer_engineering',
  'electronics_engineering',
  'civil_engineering',
  'mechanical_engineering',
]);
const exactBranchEnum = z.enum([
  'computer_engineering',
  'electronics_engineering',
  'civil_engineering',
  'mechanical_engineering',
]);

const semesterSchema = z.coerce.number().int().min(0).max(8);
const exactSemesterSchema = z.coerce.number().int().min(1).max(8);
const pageSchema = z.coerce.number().int().min(1).default(1);
const limitSchema = z.coerce.number().int().min(1).max(100).default(20);
const activeSchema = z
  .enum(['true', 'false'])
  .optional()
  .transform((value) => (value === undefined ? undefined : value === 'true'));

const paginationFields = {
  page: pageSchema,
  limit: limitSchema,
};

const searchField = z.string().trim().min(1).max(120).optional();
const sortOrderField = z.enum(['asc', 'desc']).optional();

export const timetableQuerySchema = z.object({
  ...paginationFields,
  branch: branchEnum.optional(),
  semester: semesterSchema.optional(),
  division: z.enum(DIVISIONS).optional(),
  day: z
    .enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'])
    .optional(),
  active: activeSchema,
});

export const noticesQuerySchema = z.object({
  ...paginationFields,
  branch: branchEnum.optional(),
  semester: semesterSchema.optional(),
  division: z.enum(['all', ...DIVISIONS]).optional(),
  category: z.enum(['academic', 'exam', 'administrative', 'placement']).optional(),
  search: searchField,
  active: activeSchema,
  sort: sortOrderField,
});

export const eventsQuerySchema = z.object({
  ...paginationFields,
  branch: branchEnum.optional(),
  semester: semesterSchema.optional(),
  category: z.enum(['academic', 'technical', 'cultural', 'sports', 'placement']).optional(),
  search: searchField,
  upcoming: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value === undefined ? true : value === 'true')),
  active: activeSchema,
});

export const facultyQuerySchema = z.object({
  ...paginationFields,
  branch: branchEnum.optional(),
  department: z.string().trim().min(1).max(120).optional(),
  search: searchField,
  active: activeSchema,
});

export const faqQuerySchema = z.object({
  ...paginationFields,
  branch: branchEnum.optional(),
  semester: semesterSchema.optional(),
  category: z.enum(['erp', 'timetable', 'notices', 'events', 'faculty', 'academic']).optional(),
  search: searchField,
  active: activeSchema,
});

export const notificationsQuerySchema = z.object({
  ...paginationFields,
  type: z.enum(['notice', 'event', 'schedule_update', 'reminder']).optional(),
  unreadOnly: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value === undefined ? false : value === 'true')),
  active: activeSchema,
});

const notificationAudienceSchema = z.object({
  role: z.enum(['all', ...ROLE_LIST]).default('student'),
  branch: branchEnum.default('all'),
  semester: semesterSchema.default(0),
  division: z.enum(['all', ...DIVISIONS]).default('all'),
  batch: z.enum(['all', ...BATCHES]).default('all'),
});

export const notificationTriggerSchema = z.object({
  type: z.enum(['notice', 'event', 'schedule_update', 'reminder']),
  title: z.string().trim().min(3).max(160),
  message: z.string().trim().min(5).max(2000),
  audience: notificationAudienceSchema.default({}),
  channel: z.enum(['in_app', 'email', 'both']).default('in_app'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  relatedCollection: z.enum(['notices', 'events', 'timetable', 'notifications']).optional(),
  relatedId: z.string().trim().min(1).max(160).optional(),
  scheduledAt: z.string().datetime().optional(),
});

export const chatQuerySchema = z.object({
  query: z.string().trim().min(2).max(1000),
  sessionId: z.string().trim().min(1).max(120).optional(),
});

export const embeddingTestSchema = z
  .object({
    query: z.string().trim().min(2).max(1000).optional(),
    text: z.string().trim().min(2).max(2000).optional(),
    texts: z.array(z.string().trim().min(2).max(2000)).min(1).max(20).optional(),
  })
  .refine((value) => value.query || value.text || value.texts?.length, {
    message: 'Provide query, text, or texts for embedding diagnostics.',
  });

export const semanticSearchTestSchema = z.object({
  query: z.string().trim().min(2).max(1000),
  topK: z.coerce.number().int().min(1).max(20).optional(),
  top_k: z.coerce.number().int().min(1).max(20).optional(),
  collection: z.enum(['faq', 'notices', 'events', 'timetable', 'faculty', 'notifications']).optional(),
  threshold: z.coerce.number().min(0).max(1).optional(),
});

export const geminiTestSchema = z.object({
  query: z.string().trim().min(2).max(1000),
  draftResponse: z.string().trim().min(2).max(5000).optional(),
});

export const notificationParamsSchema = z.object({
  id: z.string().trim().min(1).max(160),
});

export const documentParamsSchema = notificationParamsSchema;

const timetableSlotSchema = z
  .object({
    slotId: z.string().trim().min(1).max(80).optional(),
    startTime: z.string().trim().min(1).max(20),
    endTime: z.string().trim().min(1).max(20),
    label: z.string().trim().min(1).max(80).optional(),
    subjectCode: z.string().trim().max(40).optional(),
    subject: z.string().trim().min(1).max(160),
    type: z.enum(['theory', 'lab', 'tutorial', 'project', 'exam', 'other']).default('theory'),
    facultyId: z.string().trim().max(120).optional().nullable(),
    facultyName: z.string().trim().max(120).optional().nullable(),
    room: z.string().trim().max(80).optional().nullable(),
    batch: z.enum(['all', ...BATCHES]).optional().nullable(),
  })
  .passthrough();

const scheduleSchema = z
  .object({
    monday: z.array(timetableSlotSchema).optional(),
    tuesday: z.array(timetableSlotSchema).optional(),
    wednesday: z.array(timetableSlotSchema).optional(),
    thursday: z.array(timetableSlotSchema).optional(),
    friday: z.array(timetableSlotSchema).optional(),
    saturday: z.array(timetableSlotSchema).optional(),
  })
  .default({});

export const timetableCreateSchema = z.object({
  branch: exactBranchEnum,
  semester: exactSemesterSchema,
  division: z.enum(DIVISIONS),
  academicYear: z.string().trim().min(4).max(20).optional(),
  effectiveFrom: z.string().trim().min(4).max(40).optional(),
  effectiveTo: z.string().trim().min(4).max(40).optional(),
  schedule: scheduleSchema,
  isActive: z.boolean().optional(),
});

export const timetableUpdateSchema = timetableCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: 'Provide at least one timetable field to update.' }
);

export const noticeCreateSchema = z.object({
  title: z.string().trim().min(3).max(160),
  content: z.string().trim().min(5).max(4000),
  category: z.enum(['academic', 'exam', 'administrative', 'placement']),
  branch: branchEnum.default('all'),
  semester: semesterSchema.default(0),
  division: z.enum(['all', ...DIVISIONS]).default('all'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  attachmentUrl: z.string().trim().url().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const noticeUpdateSchema = noticeCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: 'Provide at least one notice field to update.' }
);

export const eventCreateSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(5).max(4000),
  eventDate: z.string().datetime(),
  registrationDeadline: z.string().datetime().optional().nullable(),
  venue: z.string().trim().min(2).max(160),
  organizer: z.string().trim().max(160).optional(),
  category: z.enum(['academic', 'technical', 'cultural', 'sports', 'placement']),
  branch: branchEnum.default('all'),
  semester: semesterSchema.default(0),
  maxParticipants: z.coerce.number().int().min(1).max(10000).optional().nullable(),
  registrationUrl: z.string().trim().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const eventUpdateSchema = eventCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: 'Provide at least one event field to update.' }
);

export const faqCreateSchema = z.object({
  question: z.string().trim().min(5).max(300),
  answer: z.string().trim().min(5).max(4000),
  category: z.enum(['erp', 'timetable', 'notices', 'events', 'faculty', 'academic']),
  branch: branchEnum.default('all'),
  semester: semesterSchema.default(0),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
  isActive: z.boolean().optional(),
});

export const faqUpdateSchema = faqCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: 'Provide at least one FAQ field to update.' }
);

export const studentScopeSchema = z.object({
  branch: z.enum([
    'computer_engineering',
    'electronics_engineering',
    'civil_engineering',
    'mechanical_engineering',
  ]),
  semester: z.coerce.number().int().min(1).max(8),
  division: z.enum(DIVISIONS),
  batch: z.enum(BATCHES),
});
