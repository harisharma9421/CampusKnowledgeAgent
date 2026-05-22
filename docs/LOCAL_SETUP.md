# Local Development Setup - Campus Knowledge Agent

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | >= 20.19.0 or >= 22.12.0 | https://nodejs.org |
| npm | >= 10.0.0 | Bundled with Node.js |
| Python | >= 3.10 | https://python.org |
| pip | Latest | Bundled with Python |
| Git | Latest | https://git-scm.com |

---

## 1. Clone the Repository

```bash
git clone https://github.com/harisharma9421/CampusKnowledgeAgent.git
cd CampusKnowledgeAgent
```

---

## 2. Environment Variables

### Frontend

```bash
cp frontend/.env.example frontend/.env
# Edit frontend/.env if needed (defaults work for local dev)
```

### Backend

```bash
cp backend/.env.example backend/.env
# Edit backend/.env - add Firebase credentials when available
```

### AI Engine

```bash
cp ai-engine/.env.example ai-engine/.env
# Edit ai-engine/.env - add Gemini credentials in Phase 8
```

---

## 3. Install Dependencies

### Frontend + Backend (from monorepo root)

```bash
npm install
```

### AI Engine

```bash
cd ai-engine
pip install -r requirements.txt
cd ..
```

---

## 4. Run Services

### Option A - Run all at once (frontend + backend)

```bash
npm run dev
```

### Option B - Run individually

**Frontend** (http://localhost:5173)

```bash
npm run dev:frontend
```

**Backend** (http://localhost:5000)

```bash
npm run dev:backend
```

**AI Engine** (http://localhost:8000)

```bash
cd ai-engine
python run.py
```

---

## 5. Verify Services

| Service | URL | Expected |
|---------|-----|----------|
| Frontend | http://localhost:5173 | Landing page |
| Backend Health | http://localhost:5000/health | JSON health response |
| Backend API | http://localhost:5000/api/v1 | API info JSON |
| AI Engine | http://localhost:8000 | Root JSON |
| AI Engine Health | http://localhost:8000/health | Health JSON |
| AI Engine Docs | http://localhost:8000/docs | Swagger UI |

---

## 6. Lint & Format

```bash
# Lint all
npm run lint

# Format all
npm run format

# Check formatting
npm run format:check
```

---

## Troubleshooting

**Port already in use**

```bash
# Find and kill process on port 5000
npx kill-port 5000
```

**Python module not found**

```bash
cd ai-engine
pip install -r requirements.txt
```

**Firebase warnings on backend startup**

This is expected in Phase 1. Firebase credentials are not yet configured.
The backend will start normally and log a warning.
