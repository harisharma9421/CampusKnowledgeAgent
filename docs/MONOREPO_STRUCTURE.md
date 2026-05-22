# Monorepo Structure — Campus Knowledge Agent

```
campus-knowledge-agent/
│
├── 📁 frontend/                    React + Vite frontend application
│   ├── public/                     Static assets
│   ├── src/
│   │   ├── assets/                 Images, fonts, icons
│   │   ├── components/
│   │   │   ├── navigation/         Navbar, Sidebar
│   │   │   └── ui/                 Reusable UI components (Card, Badge, Logo, etc.)
│   │   ├── contexts/               React Context providers (AppContext, AuthContext)
│   │   ├── hooks/                  Custom React hooks (useApi, useLocalStorage)
│   │   ├── layouts/                Page layout wrappers (MainLayout)
│   │   ├── pages/                  Route-level page components
│   │   ├── routes/                 Route configuration (AppRoutes)
│   │   ├── services/               API service modules (apiClient, healthService)
│   │   ├── store/                  Global state (future: Zustand/Redux)
│   │   ├── styles/                 Global CSS (Tailwind base)
│   │   └── utils/                  Pure utility functions (cn, constants)
│   ├── .env.example
│   ├── .eslintrc.cjs
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── 📁 backend/                     Node.js + Express API layer
│   ├── src/
│   │   ├── configs/                Environment config, Firebase admin setup
│   │   ├── controllers/            Request handlers (healthController)
│   │   ├── middleware/             errorHandler, notFound, rateLimiter, requestLogger
│   │   ├── repositories/           Data access layer (Firestore queries — Phase 2+)
│   │   ├── routes/                 Express routers (health, index/v1)
│   │   ├── services/               Business logic layer (Phase 3+)
│   │   ├── utils/                  logger, response helpers, asyncHandler
│   │   └── validators/             Request validation schemas (Phase 3+)
│   │   ├── app.js                  Express app factory
│   │   └── server.js               HTTP server entry point
│   ├── .env.example
│   ├── .eslintrc.cjs
│   └── package.json
│
├── 📁 ai-engine/                   Python FastAPI AI service
│   ├── app/
│   │   ├── config/                 Settings (Pydantic), logging config
│   │   ├── middleware/             Global exception handlers
│   │   ├── routers/                health, inference, embeddings
│   │   └── utils/                  Response builders
│   │   └── main.py                 FastAPI app entry point
│   ├── embeddings/cache/           Cached embeddings (Phase 7)
│   ├── models/                     Downloaded model weights (Phase 6)
│   ├── training/                   Fine-tuning scripts (Phase 6)
│   ├── vectorstore/index/          FAISS index files (Phase 7)
│   ├── .env.example
│   ├── requirements.txt
│   └── run.py                      Development server entry point
│
├── 📁 shared/                      Shared constants, utils, API contracts
│   ├── src/
│   │   ├── constants/              api.js, roles.js, branches.js, status.js
│   │   ├── schemas/                apiResponse.js (response contract)
│   │   └── utils/                  validators.js, formatters.js
│   │   └── index.js                Public API exports
│   └── package.json
│
├── 📁 firebase/                    Firebase configuration and documentation
│   ├── COLLECTIONS.md              Firestore collection schema documentation
│   ├── firestore.rules.example     Security rules template
│   └── firestore.indexes.example.json  Composite index definitions
│
├── 📁 docs/                        Project documentation
│   ├── ARCHITECTURE.md             System architecture explanation
│   ├── LOCAL_SETUP.md              Developer setup guide
│   └── MONOREPO_STRUCTURE.md       This file
│
├── .editorconfig                   Editor formatting rules
├── .gitignore                      Git ignore patterns
├── .prettierrc                     Prettier formatting config
├── .prettierignore
├── package.json                    Monorepo root (npm workspaces)
└── README.md                       Project overview
```

## Workspace Dependencies

```
@campus/frontend  →  (no internal deps)
@campus/backend   →  (no internal deps — shared constants inlined)
@campus/shared    →  (pure utilities, no framework deps)
```

## Adding a New Feature Module

1. Add route in `backend/src/routes/`
2. Add controller in `backend/src/controllers/`
3. Add service in `backend/src/services/`
4. Add repository in `backend/src/repositories/`
5. Add service module in `frontend/src/services/`
6. Add page in `frontend/src/pages/`
7. Register route in `frontend/src/routes/AppRoutes.jsx`
8. Add nav item in `frontend/src/components/navigation/Sidebar.jsx`
