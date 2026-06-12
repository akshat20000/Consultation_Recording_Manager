# Consultation Recording Manager

A full-stack web application for astrologers to record, transcribe, and summarise client consultation sessions. Audio is automatically transcribed via Whisper and summarised into structured reports (key topics, recommendations, action items) using an LLM. The app works fully without any AI API keys via built-in mock fallbacks.

---

## Features

- **Live audio recording** with real-time waveform visualisation and pause/resume support
- **AI transcription** via Whisper (Groq-hosted) with rule-based mock fallback
- **Structured AI summaries** — key topics, recommendations, action items, follow-ups, sentiment
- **Client management** — create and manage client profiles linked to consultations
- **Consent enforcement** — consent must be logged (with timestamp) before a recording can be saved
- **Advanced search & filters** — search by title, transcript, client name, tags, date range, duration
- **Soft-delete + restore + hard-delete** — three-tier deletion with audit trail
- **Analytics dashboard** — recordings over time, category distribution, avg duration trends (Recharts)
- **Export** — download consultation summaries as `.md` or `.txt`
- **Cloudinary audio storage** with local-disk fallback for dev/demo environments

---

## Tech Stack

**Frontend** — React 19, Vite, TypeScript, TanStack Query, React Router, Tailwind CSS, Recharts, Lucide

**Backend** — Node.js, Express, TypeScript, MongoDB + Mongoose, JWT auth, Multer, Zod, Cloudinary SDK, OpenAI SDK (Groq endpoint)

---

## Project Structure

```
├── client/          # React + Vite frontend
│   └── src/
│       ├── pages/       # Dashboard, Consultations, Clients, Analytics, Record
│       ├── components/  # AudioRecorder, AudioPlayer, ConsentModal, SummaryViewer
│       ├── hooks/       # useAudioRecorder
│       ├── services/    # Typed API clients (auth, clients, consultations, analytics)
│       └── context/     # AuthContext
│
└── server/          # Express + TypeScript backend
    └── src/
        ├── routes/      # Auth, clients, consultations, analytics
        ├── controllers/ # Request handling + input validation
        ├── services/    # Business logic (auth, client, consultation, transcript, summary, recording, analytics, export)
        ├── models/      # Mongoose schemas: User, Client, Consultation
        ├── middleware/  # JWT auth guard, error handler, upload (Multer), Zod validator
        └── config/      # Env loading, DB connection, Cloudinary + OpenAI init
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local instance or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free cluster)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/Consultation_Recording_Manager.git
cd Consultation_Recording_Manager
```

### 2. Configure environment variables

Create a `.env` file inside the `server/` directory:

```bash
cp server/.env.example server/.env
```

Then open `server/.env` and fill in your values (see the table below).

### 3. Install dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 4. Run in development mode

Open two terminals:

```bash
# Terminal 1 — backend (runs on http://localhost:5000)
cd server && npm run dev

# Terminal 2 — frontend (runs on http://localhost:5173)
cd client && npm run dev
```

Visit **http://localhost:5173**, register an account, and start recording.

---

## Environment Variables

Copy the block below into `server/.env`. Only `MONGO_URI` and `JWT_SECRET` are required to run the app. The AI and Cloudinary variables are optional — the app falls back gracefully without them.

```env
# ── Required ──────────────────────────────────────────────
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/consultation-recording-manager
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
NODE_ENV=development

# ── Optional: AI transcription + summarisation (Groq) ─────
# Get a free key at https://console.groq.com
# Without this key, the app uses realistic mock transcripts and summaries.
OPENAI_API_KEY=

# ── Optional: Cloudinary audio storage ────────────────────
# Without these, audio files are stored locally in server/uploads/
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

> **Note on `OPENAI_API_KEY`:** Despite the variable name, this key is used against the **Groq API** (`https://api.groq.com/openai/v1`), which exposes an OpenAI-compatible endpoint. The models used are `whisper-large-v3` for transcription and `llama-3.3-70b-versatile` for summarisation.

---

## API Overview

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | — | Register a new astrologer account |
| POST | `/auth/login` | — | Login, returns JWT |
| GET | `/auth/me` | ✓ | Get current user profile |
| GET | `/clients` | ✓ | List clients |
| POST | `/clients` | ✓ | Create client |
| PUT | `/clients/:id` | ✓ | Update client |
| DELETE | `/clients/:id` | ✓ | Delete client |
| GET | `/consultations` | ✓ | List consultations (supports search + filters) |
| POST | `/consultations` | ✓ | Create consultation (multipart/form-data with audio) |
| GET | `/consultations/:id` | ✓ | Get consultation detail |
| PUT | `/consultations/:id` | ✓ | Update title / notes / tags / transcript |
| DELETE | `/consultations/:id` | ✓ | Soft-delete |
| PUT | `/consultations/:id/restore` | ✓ | Restore soft-deleted record |
| DELETE | `/consultations/:id/hard` | ✓ | Permanently delete (removes audio too) |
| GET | `/consultations/:id/export` | ✓ | Download summary as `.md` or `.txt` |
| GET | `/analytics/metrics` | ✓ | Dashboard KPI cards |
| GET | `/analytics/data` | ✓ | Chart data (uploads over time, categories, duration) |

---

## Consultation Creation Flow

```
Audio file (Multer)
    │
    ▼
TranscriptService.generateTranscript()   ← Groq Whisper / mock fallback
    │
    ▼
SummaryService.generateSummary()         ← Groq Llama / rule-based fallback
    │
    ▼
RecordingService.uploadRecording()       ← Cloudinary / local /uploads
    │
    ▼
Consultation.create()                    ← Saved to MongoDB
```

Transcription intentionally happens **before** the upload step so the local temp file still exists when Whisper reads it. The file is deleted from disk after the Cloudinary upload completes.

---

## Assumptions

- Single-user model — each astrologer manages their own clients and consultations; all data is scoped by `userId`.
- Client consent (`consentGiven` + `consentTimestamp`) is mandatory and enforced at the service layer, not just the UI.
- Transcription is synchronous during request handling — acceptable for short demo recordings. For production, this should move to a background job queue (e.g. BullMQ).
- Soft-delete is used by default so records can be restored or audited; hard-delete is available as an explicit second step.

---

## Known Limitations & Future Improvements

- Move transcription/summarisation to an async background job with a status field (`pending / processing / done / failed`)
- Add streaming/chunked transcription for long audio (Whisper has a 25 MB file-size limit)
- Replace regex-based text search with a MongoDB `$text` index for performance
- Add automated tests (unit tests for services, integration tests for routes)
- Add rate limiting and request logging middleware for production readiness
- Restrict CORS `origin` from `*` to the actual frontend domain in production
- Add role-based access for team accounts (multiple astrologers sharing clients)