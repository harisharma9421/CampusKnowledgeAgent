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
| users          | 3     |
| students       | 4     |
| faculty        | 4     |
| timetable      | 4     |
| notices        | 4     |
| events         | 4     |
| faq            | 4     |
| chat_sessions  | 9     |
