# Project Notes – Consultation Recording Manager

## 1. Tech Stack

**Frontend**
- React 19 + Vite
- React Router DOM for routing
- TanStack Query (React Query) for server-state management and caching
- Tailwind CSS for styling
- Recharts for analytics charts
- Lucide React for icons

**Backend**
- Node.js + Express (TypeScript)
- MongoDB with Mongoose (models: `User`, `Client`, `Consultation`)
- JWT-based authentication, bcryptjs for password hashing
- Multer for handling audio file uploads
- Cloudinary for audio storage (with local-disk fallback if not configured)
- Zod for request validation
- Groq API (Whisper for transcription,whisper-large-v3 & llama-3.3-70b-versatile  for structured summaries)

**Dev Tooling**
- TypeScript across client and server
- ts-node-dev for backend hot reload
- ESLint

## 2. Architecture

The project follows a standard client–server architecture with a clear separation of concerns on the backend (routes → controllers → services → models).

**Backend (server/src)**
- `routes/` – Express route definitions for auth, clients, consultations, analytics
- `controllers/` – request/response handling, input validation via `validators/`
- `services/` – business logic, isolated per domain:
  - `auth.service.ts` – signup/login, JWT issuance
  - `client.service.ts` – client CRUD
  - `consultation.service.ts` – core consultation lifecycle (create, update, list, soft delete)
  - `recording.service.ts` – uploads audio to Cloudinary or falls back to local storage
  - `transcript.service.ts` – generates transcripts via OpenAI Whisper (mock fallback)
  - `summary.service.ts` – generates structured AI summaries via GPT-4o-mini (mock fallback)
  - `export.service.ts` – exports consultation data
  - `analytics.service.ts` – aggregated stats for the dashboard
- `models/` – Mongoose schemas (`User`, `Client`, `Consultation`)
- `middleware/` – auth guard, error handling
- `config/` – env loading, DB connection, Cloudinary/OpenAI config checks

**Consultation creation flow**
1. Audio file uploaded via Multer to a temp local path.
2. `TranscriptService.generateTranscript()` sends the audio to OpenAI Whisper to get a transcript (falls back to a templated mock transcript if no API key or on failure).
3. `SummaryService.generateSummary()` sends the transcript to GPT-4o-mini, which returns a structured JSON summary (key topics, recommendations, action items, follow-ups, keywords, sentiment). Falls back to a rule-based mock summary if AI is unavailable.
4. `RecordingService.uploadRecording()` uploads the audio to Cloudinary (or serves it locally if Cloudinary isn't configured), then the consultation record (with transcript + summary + recording URL) is saved to MongoDB.

**Frontend (client/src)**
- `pages/` – top-level views (dashboard, consultations list/detail, clients, auth)
- `components/` – reusable UI (audio player/recorder, consultation cards, layout/navbar)
- `services/` – API clients (axios/fetch wrappers per resource: auth, clients, consultations, analytics)
- `context/` – auth/session context
- `hooks/` – custom React Query hooks
- `routes/` – protected/public route definitions

## 3. Assumptions

- A single astrologer/user account manages their own clients and consultations (data is scoped per `userId`).
- Client consent (`consentGiven` + `consentTimestamp`) is mandatory before a recording can be created — this is enforced at the service layer.
- Cloudinary credentials are optional; if absent, audio files are served from local `/uploads`. This is acceptable for a development/demo environment but not for production scaling.
- OpenAI credentials are optional; if absent, the app gracefully falls back to deterministic mock transcripts/summaries so the app remains fully demoable without API costs.
- Transcription happens synchronously during consultation creation (acceptable for short demo recordings); for longer recordings this would ideally be moved to a background job/queue.
- Soft delete (`isDeleted` flag) is used instead of hard delete, so consultations can be restored or audited later.
- The "category"/tag of a consultation (e.g. Career, Relationship) is used to tailor both mock transcripts and AI prompts contextually.

## 4. Future Improvements

- Move transcription/summarization to an async background job (e.g. BullMQ/queue) with a status field (`pending` / `processing` / `done` / `failed`) so large recordings don't block the request.
- Add streaming/chunked transcription for long audio files (Whisper has file-size limits).
- Add retry/exponential backoff for OpenAI API calls.
- Allow re-generating just the summary (without re-transcribing) from the UI.
- Add role-based access (e.g. team accounts where multiple astrologers share clients).
- Add automated tests (unit tests for services, integration tests for API routes).
- Add pagination, full-text search indexing (MongoDB text index) for consultations.
- Improve audio recorder UX (waveform visualization, pause/resume, file size limits/validation on the client).
- Add export-to-PDF for consultation summaries (building on `export.service.ts`).
- Add rate limiting and request logging/monitoring middleware for production readiness.
