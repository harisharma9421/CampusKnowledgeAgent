/**
 * Auth request validation schemas (Zod).
 */

import { z } from 'zod';
import { ROLES, ROLE_LIST, DIVISIONS, BATCHES } from '../constants/auth.js';

const branchEnum = z.enum([
  'computer_engineering',
  'electronics_engineering',
  'civil_engineering',
  'mechanical_engineering',
]);

const studentFields = {
  branch: branchEnum,
  semester: z.number().int().min(1).max(8),
  division: z.enum(DIVISIONS),
  batch: z.enum(BATCHES),
  rollNumber: z.string().trim().min(1).max(30),
};

const facultyFields = {
  employeeId: z.string().trim().min(1).max(30),
  department: z.string().trim().min(1).max(100),
  branch: branchEnum.optional(),
};

const adminFields = {
  department: z.string().trim().min(1).max(100).optional(),
};

export const registerSchema = z
  .object({
    email: z.string().trim().email('A valid email address is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must not exceed 128 characters'),
    displayName: z.string().trim().min(2).max(100),
    role: z.enum(ROLE_LIST),
    branch: branchEnum.optional(),
    semester: z.number().int().min(1).max(8).optional(),
    division: z.enum(DIVISIONS).optional(),
    batch: z.enum(BATCHES).optional(),
    rollNumber: z.string().trim().optional(),
    employeeId: z.string().trim().optional(),
    department: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === ROLES.STUDENT) {
      const studentSchema = z.object(studentFields);
      const result = studentSchema.safeParse(data);
      if (!result.success) {
        result.error.issues.forEach((issue) => ctx.addIssue(issue));
      }
    }

    if (data.role === ROLES.FACULTY) {
      const facultySchema = z.object(facultyFields);
      const result = facultySchema.safeParse(data);
      if (!result.success) {
        result.error.issues.forEach((issue) => ctx.addIssue(issue));
      }
    }

    if (data.role === ROLES.ADMIN) {
      const adminSchema = z.object(adminFields);
      const result = adminSchema.safeParse(data);
      if (!result.success) {
        result.error.issues.forEach((issue) => ctx.addIssue(issue));
      }
    }
  });

export const loginSchema = z.object({
  email: z.string().trim().email('A valid email address is required'),
  password: z.string().min(1, 'Password is required'),
});

export default { registerSchema, loginSchema };
