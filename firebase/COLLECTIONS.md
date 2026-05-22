# Firestore Collection Strategy — Campus Knowledge Agent

## Architecture Principle

> The frontend NEVER directly accesses Firebase.
> The AI engine NEVER directly accesses Firebase.
> All Firestore access happens exclusively through the Node.js backend using Firebase Admin SDK.

---

## Collection Naming Convention

- Use `snake_case` for collection names
- Use `camelCase` for document field names
- Use ISO 8601 strings for all timestamps

---

## Collections

### `users`
Stores all system users (students, faculty, admins).

```
users/{userId}
  ├── uid: string          (Firebase Auth UID)
  ├── email: string
  ├── displayName: string
  ├── role: string         ('student' | 'faculty' | 'admin')
  ├── branch: string       (for students/faculty)
  ├── semester: number     (for students)
  ├── division: string     (for students)
  ├── batch: string        (for students, e.g. 'A1')
  ├── rollNumber: string   (for students)
  ├── isActive: boolean
  ├── createdAt: timestamp
  └── updatedAt: timestamp
```

### `students`
Extended student profile data.

```
students/{studentId}
  ├── userId: string       (ref to users collection)
  ├── rollNumber: string
  ├── branch: string
  ├── semester: number
  ├── division: string
  ├── batch: string
  ├── enrollmentYear: number
  └── ...
```

### `faculty`
Faculty member profiles.

```
faculty/{facultyId}
  ├── userId: string
  ├── employeeId: string
  ├── department: string
  ├── designation: string
  ├── subjects: string[]
  └── ...
```

### `timetable`
Branch/semester/division timetable data.

```
timetable/{timetableId}
  ├── branch: string
  ├── semester: number
  ├── division: string
  ├── academicYear: string
  ├── schedule: {
  │     monday: [{ time, subject, faculty, room }]
  │     tuesday: [...]
  │     ...
  │   }
  └── updatedAt: timestamp
```

### `notices`
Academic notices and announcements.

```
notices/{noticeId}
  ├── title: string
  ├── content: string
  ├── branch: string       ('all' | specific branch)
  ├── semester: number     (0 = all semesters)
  ├── postedBy: string     (faculty userId)
  ├── isActive: boolean
  ├── createdAt: timestamp
  └── expiresAt: timestamp
```

### `events`
Campus events and activities.

```
events/{eventId}
  ├── title: string
  ├── description: string
  ├── eventDate: timestamp
  ├── venue: string
  ├── organizer: string
  ├── category: string     ('academic' | 'cultural' | 'sports' | 'technical')
  ├── isActive: boolean
  └── createdAt: timestamp
```

### `faq`
Frequently asked questions knowledge base.

```
faq/{faqId}
  ├── question: string
  ├── answer: string
  ├── category: string
  ├── tags: string[]
  ├── embedding: number[]  (vector — added in Phase 7)
  ├── isActive: boolean
  └── createdAt: timestamp
```

### `chat_sessions`
Conversation history (Phase 9).

```
chat_sessions/{sessionId}
  ├── userId: string
  ├── messages: [
  │     { role: 'user'|'assistant', content, timestamp }
  │   ]
  ├── createdAt: timestamp
  └── updatedAt: timestamp
```

---

## Implementation Timeline

| Collection     | Phase |
|----------------|-------|
| users          | 2     |
| students       | 4     |
| faculty        | 4     |
| timetable      | 4     |
| notices        | 4     |
| events         | 4     |
| faq            | 4     |
| notifications  | 4     |
| chat_sessions  | 9     |

---

## Phase 3 ERP Seed Dataset

Seed scripts live in `firebase/seeders` and use the same Firebase Admin SDK configuration as
the backend. The dataset is deterministic, relationship-validated, and marked with
`source: dummy_erp_seed_v1` so it can be verified or reset safely.

Additional collection:

### `notifications`

ERP notification feed generated and served only through backend APIs.

```
notifications/{notificationId}
  id: string
  type: string              ('notice' | 'event' | 'schedule_update' | 'reminder')
  title: string
  message: string
  priority: string          ('low' | 'normal' | 'high')
  audience: {
    role: string            ('student' | 'faculty' | 'admin')
    branch: string          ('all' | branch key)
    semester: number        (0 = all semesters)
    division: string        ('all' | D1-D4)
    batch: string           ('all' | A1-C4)
  }
  relatedCollection: string
  relatedId: string
  deliveryChannels: string[]
  readBy: string[]
  isActive: boolean
  scheduledAt: timestamp
  expiresAt: timestamp
  createdAt: timestamp
  updatedAt: timestamp
```

Generated counts:

- `users`: 274 seeded accounts (240 students, 32 faculty, 2 admins)
- `students`: 240 students across 4 branches, semesters 3/5/7, divisions D1-D4, batches A1-C4
- `faculty`: 32 faculty records with subject ownership
- `timetable`: 48 branch/semester/division timetables
- `notices`: 36 ERP-style notices
- `events`: 24 campus events
- `faq`: 48 knowledge base entries
- `notifications`: 100 in-app/email notification records

Useful commands:

```bash
npm run seed:erp:dry-run
npm run seed:erp:emulator
npm run verify:erp:emulator
npm run verify:erp:emulator:full
```
