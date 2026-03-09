# 🚀 Quick Start

## Prerequisites
- Node.js >= 18
- npm >= 8
- git

## Installation & Running

### Option 1: Both servers in one command
```bash
# Install all dependencies
npm run install:all

# Start both backend and frontend
npm run dev
```

### Option 2: Individual startup (2 terminals)

**Terminal 1 - Backend (port 5000)**
```bash
cd backend
npm install
npm start  # or npm run dev for hot-reload
```

**Terminal 2 - Frontend (port 3000)**
```bash
cd frontend
npm install
npm run dev
```

**Access:** Open `http://localhost:3000` in your browser

---

## Testing

```bash
# Unit tests (17 tests)
npm run test:unit

# E2E tests (Playwright)
npm run test:e2e

# Run all tests
npm test
```

---

## Demo Flow (2 minutes)

1. **Upload** → Drag expenses.csv + browser_history.json → "Detect Shadow SaaS"
2. **Dashboard** → View detected apps (Recruiting Bot = critical risk)
3. **Playbook** → Click "🛡️ Playbook" on any app
   - See evidence & data permissions
   - Click "⚡ Simulate Revoke (DEMO MODE)"
   - Email draft is generated (no real sending)
   - Undo available for 30 seconds
4. **Simulator** → Switch to "💰 Simulator" tab
   - Choose which app to keep per category
   - Slide adoption rate (0-100%)
   - Watch savings recalculate in real-time

---

## Deployment

### Frontend (Vercel)
```bash
# Build
cd frontend && npm run build

# Deploy built dist/ folder to Vercel
```

### Backend (Heroku / Railway)
```bash
# Build
cd backend && npm run build

# Deploy with `npm start` as start script
```

---

## Architecture

| Component | Tech | Port |
|-----------|------|------|
| **Backend** | Node + Express + TypeScript | 5000 |
| **Frontend** | React + Vite + TypeScript | 3000 |
| **Database** | JSON files (demo mode) | N/A |
| **Testing** | Vitest + Playwright | N/A |

### Key Features
- ✅ **Upload & Detection** — CSV + JSON parsing, SaaS database matching
- ✅ **Savings Simulator** — Real consolidation math with adoption slider
- ✅ **Playbook** — Simulated revoke with audit logging + email draft
- ✅ **Demo Mode** — All actions are simulated (no external APIs)
- ✅ **Responsive UI** — Dark theme, animations, accessible design
- ✅ **Full Test Coverage** — 17 unit tests + e2e Playwright

---

## File Structure
```
.
├── backend/
│   ├── server.ts          # Express app
│   ├── services/          # Simulator, Playbook, Detector
│   ├── routes/            # API endpoints
│   └── data/              # JSON databases & audit logs
├── frontend/
│   └── src/
│       ├── components/    # PlabookModal, Simulator, Dashboard, Toast
│       ├── pages/         # DemoStory
│       └── services/      # API client
├── tests/
│   ├── unit/              # Vitest (17 tests)
│   └── e2e/               # Playwright
└── artifacts/
    ├── screenshots/       # 4 key screen captures
    └── video/             # 2-min demo walkthrough
```
