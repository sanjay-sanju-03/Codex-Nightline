# Voice Work History — Product Bible (Hackathon Edition)

> **Project Shram** · Built for Codex Nightline — OpenAI Build Week

**One sentence:** Speak a work note in your own words. The app turns it into a reviewable, correctable work record — stored on your device, owned by you.

---

## Document Index

| # | Document | What it covers |
|---|---|---|
| [01](./01-PRD.md) | PRD | Problem, users, core flow, scope |
| [02](./02-Architecture.md) | Architecture | System design, data flow, offline-first strategy |
| [03](./03-API.md) | API | `/api/parse` contract, request/response, errors |
| [04](./04-AI.md) | AI Design | Whisper + GPT-4o-mini, prompt, fallback, safety |
| [05](./05-Database.md) | Database | IndexedDB schema, CRUD operations |
| [06](./06-Demo.md) | Demo Script | 90-second walkthrough for judges |

---

## Contributor Playbooks

The [`skills/`](./skills/README.md) folder contains focused guides for product philosophy, AI extraction, review, resilience, storage, API behavior, accessibility, testing, and demos.

## Tech Stack (at a glance)

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **AI:** OpenAI Whisper-1 (transcription) + GPT-4o-mini (extraction)
- **Storage:** IndexedDB via `idb` — fully client-side, no backend DB
- **Validation:** Zod schemas on both server and client
- **Offline:** Works without internet; demo fallback fires when no API key is set
- **Deployment:** Vercel-ready

## Latest MVP Update

The ledger now includes a weekly snapshot, optional local follow-up dates for pending payments, and a share/copy flow for worker-confirmed records. These features remain local-first and do not add employer contact, verification, or cloud storage.

## Status

MVP built. Spec frozen. Moving to demo rehearsal.
