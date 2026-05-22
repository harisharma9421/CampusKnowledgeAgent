# System Architecture — Campus Knowledge Agent

## Overview

Campus Knowledge Agent is a layered, API-driven system. Each layer has a single responsibility and communicates only with its adjacent layer.

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│              (Vite + Tailwind CSS)                       │
│         http://localhost:5173                            │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP REST (Axios)
                       ▼
┌─────────────────────────────────────────────────────────┐
│               Node.js + Express API Layer                │
│         http://localhost:5000/api/v1                     │
│                                                          │
│  Routes → Controllers → Services → Repositories         │
└──────────┬──────────────────────────┬───────────────────┘
           │ HTTP (internal)          │ Firebase Admin SDK
           ▼                          ▼
┌──────────────────────┐   ┌──────────────────────────────┐
│  Python FastAPI       │   │     Firebase Firestore        │
│  AI Engine            │   │     (Data Provider)           │
│  http://localhost:8000│   │                               │
│                       │   │  Collections:                 │
│  • DistilBERT         │   │  • users, students, faculty   │
│  • Sentence Transformers│  │  • timetable, notices        │
│  • FAISS              │   │  • events, faq                │
│  • Gemini (Vertex AI) │   │  • chat_sessions              │
└──────────────────────┘   └──────────────────────────────┘
```

## Key Architecture Decisions

### 1. API Abstraction Layer
The backend acts as the single source of truth for all data access. This means:
- Frontend never imports Firebase SDK
- AI engine never imports Firebase SDK
- When migrating to a real ERP (SAP, Oracle), only the repository layer changes

### 2. Layered Backend
```
Request → Route → Controller → Service → Repository → Firestore
```
- **Route**: URL mapping and middleware
- **Controller**: Request/response handling, input validation
- **Service**: Business logic
- **Repository**: Data access abstraction (Firestore queries)

### 3. AI Engine Isolation
The AI engine is a separate Python service. This allows:
- Independent scaling
- Python ML ecosystem (PyTorch, HuggingFace, FAISS)
- Independent deployment
- Clean separation of NLP concerns

### 4. Standardized Response Envelope
All API responses follow this contract:
```json
{
  "status": "success" | "error",
  "message": "Human-readable message",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "meta": { "total": 100, "page": 1 }  // optional, for paginated responses
}
```

## Data Flow — Chat Query

```
User types query
    ↓
React Frontend (sends POST /api/v1/chat)
    ↓
Express Backend (validates, authenticates)
    ↓
Chat Service (orchestrates pipeline)
    ↓
AI Engine (POST /infer/query)
    ├── Preprocessing
    ├── DistilBERT Intent Classification
    ├── Confidence Evaluation
    └── Returns: { intent, confidence }
    ↓
Backend selects appropriate Repository
    ↓
Repository queries Firestore
    ↓
Data returned to Chat Service
    ↓
AI Engine (POST /embed/search — semantic search)
    ↓
AI Engine (Gemini reasoning — Phase 8)
    ↓
Final response returned to Frontend
    ↓
Chat UI renders response
```
