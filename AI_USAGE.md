# AI Usage Declaration

This file declares how AI tools were used during the development of the
**Consultation Recording Manager** project, as part of the Humara Pandit
placement assignment.

## AI Tools Used

- **Claude (Anthropic)** – used as a coding assistant throughout development.

## How AI Was Used

1. **Scaffolding & boilerplate** – Generating initial boilerplate for Express
   routes, controllers, Mongoose models, and React components/pages, which
   were then reviewed, adjusted, and integrated manually.
2. **Feature integration** – Integrating real AI-powered transcription and
   summarization into the backend:
   - Replacing hardcoded mock transcript generation with whisper-large-v3
     (`transcript.service.ts`).
   - Replacing hardcoded mock summary generation with llama-3.3-70b-versatile based
     structured summarization (`summary.service.ts`).
   - Both services retain rule-based mock fallbacks when no OpenAI API key
     is configured, ensuring the app remains demoable without API costs.
3. **Debugging & refactoring** – Identifying and fixing ordering issues
   (e.g. ensuring audio transcription happens before the temporary local
   file is deleted during upload), and refactoring service methods to
   async/await where required.
4. **Documentation** – Drafting this AI usage declaration and the project
   notes (`PROJECT_NOTES.md`) covering tech stack, architecture,
   assumptions, and future improvements.

## Disclosure Statement

AI tools were used as a productivity aid (similar to autocomplete/pair
programming), not as a replacement for understanding the codebase.
