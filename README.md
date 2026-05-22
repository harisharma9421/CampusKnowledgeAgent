# 🚀 Campus Knowledge Agent

### AI-Powered Smart Campus Chatbot System

<div align="center">

![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge\&logo=react)
![NodeJS](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge\&logo=node.js)
![Firebase](https://img.shields.io/badge/Database-Firebase%20Firestore-FFCA28?style=for-the-badge\&logo=firebase)
![Python](https://img.shields.io/badge/AI%20Layer-Python%20NLP-3776AB?style=for-the-badge\&logo=python)
![DistilBERT](https://img.shields.io/badge/NLP-DistilBERT-8A2BE2?style=for-the-badge)
![Gemini](https://img.shields.io/badge/LLM-Google%20Gemini-4285F4?style=for-the-badge\&logo=google)
![FAISS](https://img.shields.io/badge/Search-FAISS-orange?style=for-the-badge)
![Tailwind](https://img.shields.io/badge/UI-TailwindCSS-06B6D4?style=for-the-badge\&logo=tailwindcss)

</div>

---

# 📌 Overview

**Campus Knowledge Agent** is an AI-powered smart campus chatbot system designed to centralize academic communication and provide intelligent, contextual responses to students, faculty, and administrators.

The system combines:

* 🧠 DistilBERT for lightweight intent classification
* 🔍 Sentence Transformers + FAISS for semantic search
* 🤖 Gemini via Vertex AI for advanced reasoning
* 🔐 JWT-based authentication
* ☁ Firebase Firestore as structured academic data provider
* ⚡ REST API-driven modular architecture

Unlike traditional ERP systems, this project focuses primarily on:

> Intelligent AI-driven query handling and conversational assistance.

---

# 🏗 System Architecture

```text
                    ┌─────────────────────┐
                    │     React Frontend  │
                    │   (Vite + Tailwind) │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Node.js + Express   │
                    │     API Layer       │
                    └──────────┬──────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
    ┌──────────────────┐          ┌─────────────────────┐
    │ Python AI Engine │          │ Firebase Firestore  │
    │ DistilBERT       │          │ Dummy ERP Dataset   │
    │ FAISS            │          │ Timetable/Notices   │
    │ Semantic Search  │          │ Events/FAQ          │
    └────────┬─────────┘          └─────────────────────┘
             │
             ▼
    ┌─────────────────────┐
    │ Gemini via VertexAI │
    │ Reasoning Layer     │
    └─────────────────────┘
```

---

# ✨ Core Features

## 🤖 AI Chatbot

* Natural language query handling
* Context-aware conversational responses
* Real-time academic assistance
* AI-enhanced reasoning pipeline

---

## 🧠 DistilBERT Intent Engine

Supports intelligent intent classification for:

* Timetable Queries
* Event Queries
* Notice Queries
* FAQ Queries
* Faculty Queries
* Schedule Updates

---

## 🔍 Semantic Search Engine

Using:

* Sentence Transformers
* FAISS Vector Search

Features:

* Semantic similarity matching
* Contextual FAQ retrieval
* Fuzzy query understanding
* Intelligent response retrieval

---

## 📚 Smart Academic Data Retrieval

Supports:

* Personalized timetables
* Branch-wise notices
* Events and announcements
* Faculty information
* Academic FAQs

---

## 🔐 Authentication & Authorization

* JWT Authentication
* Role-based access
* Student Dashboard
* Faculty Dashboard
* Admin Dashboard

---

# 🏫 Dummy ERP Dataset

The system uses a realistic academic dataset containing:

✅ 200–300 Students
✅ 4 Academic Branches
✅ Multiple Divisions & Batches
✅ Timetable Data
✅ Notices & Events
✅ Faculty Information
✅ FAQ Knowledge Base

---

# 🧩 Supported Branches

* Computer Engineering
* Electronics Engineering
* Civil Engineering
* Mechanical Engineering

---

# ⚙ Technology Stack

| Layer           | Technology                    |
| --------------- | ----------------------------- |
| Frontend        | React + Vite                  |
| Styling         | Tailwind CSS                  |
| Backend         | Node.js + Express             |
| Database        | Firebase Firestore            |
| Authentication  | JWT                           |
| NLP             | DistilBERT                    |
| Semantic Search | Sentence Transformers + FAISS |
| LLM             | Gemini via Vertex AI          |
| Version Control | Git + GitHub                  |

---

# 🧠 AI Processing Pipeline

```text
User Query
    ↓
Preprocessing
    ↓
DistilBERT Intent Classification
    ↓
Confidence Evaluation
    ↓
API Selection
    ↓
Data Retrieval
    ↓
Semantic Search (FAISS)
    ↓
Context Construction
    ↓
Gemini Reasoning Enhancement
    ↓
Final Response
```

---

# 🔥 Why This Architecture?

This project intentionally uses an API abstraction layer.

The chatbot NEVER directly accesses Firebase.

```text
Frontend → API Layer → Database
```

This allows future migration to:

* SAP ERP
* Oracle ERP
* College ERP APIs
* SQL Databases

without redesigning the AI system.

---

# 📂 Planned Project Structure

```bash
campus-knowledge-agent/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── services/
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   ├── validators/
│   └── repositories/
│
├── ai-engine/
│   ├── distilbert/
│   ├── semantic-search/
│   ├── embeddings/
│   └── inference/
│
├── firebase/
│   ├── seeders/
│   ├── schemas/
│   └── configs/
│
└── docs/
```

---

# 🚀 Development Workflow

This project follows a strict modular AI-assisted development pipeline.

## Development Phases

1. Project Foundation
2. Firebase Setup
3. Authentication Module
4. Dummy ERP Dataset
5. REST API Layer
6. DistilBERT Intent Engine
7. Semantic Search Engine
8. Gemini Integration
9. Chatbot UI
10. Notifications
11. Testing & Optimization
12. Deployment

---

# 🔄 Automated GitHub Workflow

⚠ IMPORTANT DEVELOPMENT RULE

After EVERY completed phase:

✅ Verify Code
✅ Run Tests
✅ Fix Errors
✅ Commit Changes
✅ Push Automatically To GitHub

Example commit messages:

```bash
feat(auth): implement JWT authentication
feat(firebase): add Firestore schema and seeders
feat(ai): integrate DistilBERT intent engine
feat(search): add FAISS semantic retrieval
feat(chatbot): implement AI chat interface
```

This ensures:

* Continuous project visibility
* External review tracking
* Stable incremental development
* Proper commit history

---

# 📈 Future Enhancements

* 🎤 Voice-enabled chatbot
* 📱 Mobile application
* 💬 WhatsApp/Telegram integration
* 🌐 Multi-language support
* 📊 Smart analytics dashboard
* 🧠 RAG-based knowledge retrieval
* 📅 AI attendance assistant

---

# 👨‍💻 Team INDEX

| Name             |
| ---------------- | 
| Hari Sharma      | 
| Bharat Sarkar    | 
| Kaushik Chute    | 
| Anshul Gawande   | 
| Yeeshank Chawake | 
| Koduri V L Kamal | 

---

# 📜 Academic Project

**Semester 3 Software Engineering Hackathon Project**
AI-Powered Smart Campus Chatbot System

---

# ⭐ Vision

> “Transforming fragmented campus communication into an intelligent conversational experience.”

---
"# CampusKnowledgeAgent" 
