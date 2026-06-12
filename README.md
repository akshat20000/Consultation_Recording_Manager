# Consultation Recording Manager

A full-stack CRM for astrologers to record, transcribe, and summarise client consultation sessions. Audio is automatically transcribed via Whisper and turned into structured AI summaries (key topics, recommendations, action items, sentiment). The app works fully without any AI API keys via built-in deterministic fallbacks.

**Live demo →** https://consultation-recording-manager-ruby.vercel.app

---

## Features

- **Live audio recording** — browser-based recording with pause/resume support
- **AI transcription** — via Groq-hosted Whisper (`whisper-large-v3`), with a realistic domain-specific mock fallback
- **Structured AI summaries** — key topics, recommendations, action items, follow-ups, keywords, and sentiment via Llama 3.3 70B, with a rule-based fallback
- **Client management** — create and manage client profiles linked to consultations
- **Consent enforcement** — client consent is timestamped and verified at the service layer before any recording is saved
- **Search & filters** — filter by title, transcript, client name, tags, date range, and duration
- **Soft-delete + restore + permanent delete** — three-tier deletion strategy with full audit trail
- **Analytics dashboard** — recordings over time, category breakdown, and average duration trends
- **Export** — download consultation summaries as `.md` or `.txt`
- **Cloudinary audio storage** with automatic local-disk fallback for development

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite, TypeScript, TanStack Query, React Router v6, Tailwind CSS, Recharts, Lucide |
| Backend | Node.js, Express, TypeScript, MongoDB + Mongoose, JWT, Multer, Zod, Cloudinary SDK |
| AI | Groq API — `whisper-large-v3` (transcription), `llama-3.3-70b-versatile` (summarisation) |

---

## Project Structure

```
├── client/                      # React + Vite frontend
│   └── src/
│       ├── pages/               # Dashboard, Consultations, Clients, Analytics, RecordPage
│       ├── components/
│       │   ├── audio/           # AudioRecorder, AudioPlayer
│       │   ├── consultation/    # ConsentModal, ConsultationCard, SummaryViewer
│       │   └── layout/          # Layout, Navbar
│       ├── services/            # Typed API clients (auth, clients, consultations, analytics)
│       ├── hooks/               # useAudioRecorder
│       └── context/             # AuthContext (JWT session)
│
└── server/                      # Express + TypeScript backend
    └── src/
        ├── routes/              # auth, clients, consultations, analytics
        ├── controllers/         # Request handling + Zod validation
        ├── services/            # Business logic per domain (see below)
        ├── models/              # Mongoose schemas: User, Client, Consultation
        ├── middleware/          # auth guard, error handler, Multer upload, Zod validator
        ├── validators/          # Zod schemas for request bodies
        ├── utils/               # ApiError, ApiResponse, constants
        └── config/              # env, DB connection, Cloudinary init
```

**Backend services:**

| Service | Responsibility |
|---|---|
| `auth.service.ts` | Signup/login, JWT issuance, bcrypt hashing |
| `client.service.ts` | Client CRUD, scoped per user |
| `consultation.service.ts` | Full consultation lifecycle, search, soft-delete |
| `transcript.service.ts` | Groq Whisper transcription + mock fallback |
| `summary.service.ts` | Llama structured summarisation + rule-based fallback |
| `recording.service.ts` | Cloudinary upload orchestration |
| `cloudinary.service.ts` | Cloudinary SDK wrapper (upload, delete) |
| `export.service.ts` | Generates `.md` / `.txt` export files |
| `analytics.service.ts` | Aggregated KPIs and chart data |

---

## Getting Started (Local Development)

### Prerequisites

- Node.js 18+
- MongoDB — local instance or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

### 1. Clone

```bash
git clone https://github.com/<your-username>/Consultation_Recording_Manager.git
cd Consultation_Recording_Manager
```

### 2. Configure environment variables

Create `server/.env` with the values below. Only `MONGO_URI` and `JWT_SECRET` are required — the app runs fully without the optional keys.

```env
# ── Required ──────────────────────────────────────────────────────────────────
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/consultation-recording-manager
JWT_SECRET=replace_with_a_long_random_string_min_32_chars
JWT_EXPIRES_IN=7d
NODE_ENV=development

# ── Optional: AI (Groq) ───────────────────────────────────────────────────────
# Free key at https://console.groq.com — without this, mock transcripts/summaries are used
OPENAI_API_KEY=

# ── Optional: Cloudinary audio storage ───────────────────────────────────────
# Without these, audio is served from server/uploads/ (fine for local dev)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Create `client/.env.local` for the frontend:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 4. Run

```bash
# Terminal 1 — API server on http://localhost:5000
cd server && npm run dev

# Terminal 2 — Frontend on http://localhost:5173
cd client && npm run dev
```

Visit **http://localhost:5173**, register an account, and start recording.

---

## Deployment

The live demo is deployed as follows:

| Part | Platform | Notes |
|---|---|---|
| Frontend | Vercel | `client/` directory, set `VITE_API_BASE_URL` to your backend URL |
| Backend | Railway / Render | `server/` directory, set all env vars in the platform dashboard |
| Database | MongoDB Atlas | Free M0 cluster |
| Audio storage | Cloudinary | Free tier |

CORS on the backend is locked to the Vercel frontend URL. When deploying your own instance, update the `origin` in `server/src/app.ts` to match your frontend domain.

---

## API Reference

All routes are prefixed `/api`. Protected routes require `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Register a new account |
| POST | `/auth/login` | — | Login, returns JWT |
| GET | `/auth/me` | ✓ | Get current user profile |

### Clients

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/clients` | ✓ | List all clients |
| POST | `/clients` | ✓ | Create a client |
| PUT | `/clients/:id` | ✓ | Update a client |
| DELETE | `/clients/:id` | ✓ | Delete a client |

### Consultations

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/consultations` | ✓ | List consultations (search + filters) |
| POST | `/consultations` | ✓ | Create — `multipart/form-data` with `audio` file |
| GET | `/consultations/:id` | ✓ | Get detail |
| PUT | `/consultations/:id` | ✓ | Update title, notes, tags, transcript |
| DELETE | `/consultations/:id` | ✓ | Soft-delete |
| POST | `/consultations/:id/restore` | ✓ | Restore soft-deleted record |
| DELETE | `/consultations/:id/permanent` | ✓ | Permanently delete (removes audio from Cloudinary too) |
| GET | `/consultations/:id/export` | ✓ | Download as `.md` or `.txt` (`?format=txt`) |

### Analytics

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/analytics/metrics` | ✓ | KPI cards (totals, averages) |
| GET | `/analytics/data` | ✓ | Chart data (uploads over time, categories, duration trend) |

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | — | Server health check |

---

## Consultation Creation Flow

```
POST /api/consultations  (multipart/form-data)
         │
         ▼
   Multer → temp local file
         │
         ▼
   TranscriptService.generateTranscript()
   └─ Groq Whisper (whisper-large-v3)
   └─ fallback: deterministic mock dialogue based on category
         │
         ▼
   SummaryService.generateSummary()
   └─ Groq Llama (llama-3.3-70b-versatile) → structured JSON
   └─ fallback: rule-based keyword matching
         │
         ▼
   RecordingService.uploadRecording()
   └─ Cloudinary (if configured) → returns URL + publicId
   └─ fallback: serve from local /uploads
         │
         ▼
   Consultation.create() → MongoDB
   (temp file deleted from disk after upload)
```

> Transcription runs **before** the Cloudinary upload intentionally — so the local temp file still exists on disk when Whisper reads it.

---

## Key Design Decisions

**Consent at the service layer** — `consentGiven` and `consentTimestamp` are validated server-side before any recording is persisted. A missing or false consent flag returns a 400 error regardless of what the frontend sends.

**Three-tier deletion** — soft-delete (`isDeleted: true`) is the default, allowing records to be restored. Permanent deletion is a separate explicit action that also removes the audio asset from Cloudinary.

**Graceful AI fallback** — both `TranscriptService` and `SummaryService` detect a missing API key at startup and skip the API call entirely, returning domain-specific mock data. The app is fully demoable with zero API spend.

**Synchronous transcription** — acceptable for short demo recordings. For production, this should move to a background queue (e.g. BullMQ) with a `status` field (`pending → processing → done / failed`).

---

## Future Improvements

- Background job queue for transcription (BullMQ + status polling)
- Chunked / streaming transcription for long audio (Whisper 25 MB limit)
- MongoDB `$text` index to replace in-memory regex search
- Re-generate summary without re-transcribing from the UI
- Automated tests — unit tests for services, integration tests for API routes
- Rate limiting and structured request logging for production
- Role-based access for team accounts (multiple astrologers sharing clients)
- Export to PDF (building on `export.service.ts`)
