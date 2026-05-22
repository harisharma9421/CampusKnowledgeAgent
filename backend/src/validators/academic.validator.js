import { z } from 'zod';
import { BATCHES, DIVISIONS } from '../constants/auth.js';

const branchEnum = z.enum([
  'all',
  'computer_engineering',
  'electronics_engineering',
  'civil_engineering',
  'mechanical_engineering',
]);

const semesterSchema = z.coerce.number().int().min(0).max(8);
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

export const chatQuerySchema = z.object({
  query: z.string().trim().min(2).max(1000),
  sessionId: z.string().trim().min(1).max(120).optional(),
});

export const notificationParamsSchema = z.object({
  id: z.string().trim().min(1).max(160),
});

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
