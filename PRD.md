# Voice Work History MVP

| Field | Value |
| --- | --- |
| Version | 1.0.0 |
| Status | Draft â€” hackathon build specification |
| Author | Sanjay K P |
| Date | July 2026 |
| Hackathon | Codex Nightline / OpenAI Build Week Community Hackathon |
| Working title | Voice Work History MVP |
| Internal codename | Project Shram |
| Repository | To be created before the sprint |
| License | To be selected before public release |
| Reviewers | Hackathon judges, mentors, and future pilot users |
| Last updated | 18 July 2026 |

> **Document purpose:** This is the product and engineering source of truth for a two-hour solo hackathon MVP. It specifies a testable experiment, not a production financial, employment, or identity platform.

## 1. Executive Summary

Voice Work History MVP helps an informal worker turn a short spoken work summary into an editable, locally saved work record. The worker records a voice note such as: â€œRajeshinu vendi innu 8 manikkur joli cheythu. â‚¹500 kitti. â‚¹400 baki und.â€ The system transcribes it, extracts work details, shows them for review, and saves the record only after the worker confirms it.

The core experience is deliberately small:

1. Tap one large microphone button.
2. Speak a daily work summary in Malayalam, Manglish, or English.
3. Review and correct the extracted values.
4. Confirm to add the log to a private, on-device ledger.

The MVP does **not** claim to verify employment, prevent fraud, grant credit, replace e-Shram, operate payroll, or work fully offline. It tests whether voice plus a human confirmation loop makes daily record-keeping low-friction and useful.

## 2. Problem Statement

Many informal workers need a simple way to remember work completed, money paid, and money still pending. Paper notes are easy to lose, WhatsApp voice notes are difficult to search or total, and form-heavy applications can be slow or inaccessible after a long shift. When work and payments are disputed, an individual may have little organized personal history to refer to.

This MVP explores a narrow problem: **can a spoken daily summary become a clear, worker-owned work record without requiring the worker to type a form?**

### Opportunity

Voice is a familiar mobile interaction. A voice-first flow can reduce data-entry effort, while a review screen ensures that an AI suggestion never becomes a stored fact without the workerâ€™s approval.

### Competitive Positioning

| Alternative | Strength | Limitation addressed by this MVP |
| --- | --- | --- |
| Paper ledger | Familiar and private | Hard to search, total, or recover |
| WhatsApp voice note | Natural voice input | Unstructured and difficult to summarize |
| Manual spreadsheet/form | Structured records | Requires typing and digital comfort |
| e-Shram | National registration platform | Does not replace the need for a personal day-to-day work-log experiment |

e-Shram is a complementary public registration system, not a competitor or a product to replace.

## 3. Product Principles

1. **Voice first.** Typing is optional; the primary journey begins with speech.
2. **Human verified.** The worker always has the final say before a record is saved.
3. **AI assists; humans decide.** AI proposes a structured draft, never an authoritative employment fact.
4. **Simple before smart.** A dependable single flow is more valuable than feature breadth.
5. **Local first.** Confirmed records remain on the workerâ€™s device in the MVP.
6. **Transparent by default.** Show the transcript and editable fields so users can understand what is being saved.

## 4. AI Principles

- AI never writes directly to persistent storage.
- Every model output is schema-validated before reaching the UI.
- Every parsed value is editable before confirmation.
- The worker owns the final saved record and can delete it.
- The product does not display a generated â€œreliability scoreâ€ as a factual measure.
- Raw audio is not retained after processing, except in temporary in-memory/session retry handling.
- The model receives only the submitted audio/transcript and the extraction instructions required for that request.

## 5. Target Users and Personas

### Primary user: daily worker

**Anil, 34** is a construction worker who uses a budget Android phone and WhatsApp voice notes. He may work for different contractors and wants to remember hours, payments, and pending amounts without filling out a form in English.

**Needs:** fast input, clear money values, ability to fix mistakes, private on-device history.

### Secondary user: worker advocate or family helper

**Meera, 27** helps a family member keep track of work. She may read the screen, correct extracted fields, and explain the record history.

**Needs:** clear labels, readable UI, obvious edit controls, no hidden AI action.

### Future stakeholder: contractor

**Rajesh, 45** manages workers and may eventually verify records. He is not an MVP user and receives no message or workflow in this release.

## 6. Hypothesis, Goals, and Non-Goals

### Core hypothesis

Workers will voluntarily record their daily work using voice if it takes under 20 seconds and produces an immediately useful, editable work record.

### Success criteria

- A prepared user can complete the end-to-end demo on the first try.
- A user can understand the value within 90 seconds of seeing the product.
- A valid voice note produces a reviewable record in under eight seconds on a working connection.
- The worker can correct any extracted field before saving.
- A confirmed record survives a browser refresh on the same device.

### Product metrics for a future pilot

| Metric | Target | Interpretation |
| --- | --- | --- |
| Recording duration | Under 20 seconds | Input is low-friction |
| Processing time | Under 5 seconds | Connected pipeline is responsive |
| End-to-end latency | Under 8 seconds | Demo and user loop remain usable |
| Confirmation rate | Over 85% | Drafts are usually useful after review |
| Manual edit rate | Under 15% | Extraction quality is improving; edits remain expected |
| Pipeline success | Over 95% for prepared inputs | Technical reliability for the demo |

### Explicit non-goals

- Payroll, attendance, accounting, lending, or credit scoring.
- Employer, government, or identity verification.
- Fraud detection or evidentiary proof of employment.
- Employer management, messaging, or WhatsApp integration.
- Blockchain, OCR, chatbot, cloud synchronization, or raw audio archives.
- A fully offline speech-to-text product.
- Replacing e-Shram or any government service.

## 7. MVP Scope

### In scope

- Record a short audio note with the browser microphone.
- Upload or use a prepared demo audio file where supported.
- Transcribe the audio through a server-side OpenAI integration.
- Extract a normalized work-log draft from the transcript.
- Display transcript and editable parsed fields.
- Save only worker-confirmed logs to IndexedDB.
- Display totals and chronological history.
- Delete confirmed logs from the local device.
- Demonstrate graceful network/API fallback using clearly labelled deterministic sample data.

### Out of scope for the hackathon

- Sign-in, profiles, cloud database, sync, cross-device access, backups.
- Employer approvals, document generation, payment collection, notifications.
- Background audio upload, offline transcription, analytics, telemetry dashboards.

## 8. User Journey and State Machine

### Primary journey

```text
Idle
  â†’ Recording
  â†’ Uploading
  â†’ Processing
  â†’ Needs Review
  â†’ Confirmed
  â†’ Saved
  â†’ History
```

### States and transitions

| State | Entry condition | Allowed actions | Exit conditions |
| --- | --- | --- | --- |
| Idle | App loaded | Start recording, view history | Start recording |
| Recording | Microphone stream active | Stop, cancel | Stop creates Blob; cancel discards Blob |
| Uploading | FormData prepared | Cancel before request where possible | Request starts or fails |
| Processing | Server is transcribing/extracting | Wait; cancel UI and ignore late result | Parsed draft, error, or timeout |
| Needs Review | Valid draft returned | Edit, confirm, discard, retry | Confirmed or discarded |
| Confirmed | User selects confirm | Save | Save succeeds or fails |
| Saved | IndexedDB write succeeds | View history, add another | History or Idle |
| History | Existing records displayed | Delete, return to Idle | Delete completes or new recording starts |
| Error | Any recoverable failure | Retry, use demo fallback, manual edit, dismiss | Returns to prior suitable state |

### Cancellation and recovery rules

- Cancelling during recording stops all audio tracks and removes the unsaved Blob.
- Cancelling during processing prevents the client from saving a late response; the server request may complete but its result is ignored.
- A failed parse never creates a persistent record.
- A fallback result is labelled â€œDemo fallback â€” review before savingâ€ and still requires confirmation.
- Any reviewable draft can be discarded without changing history.

## 9. UX Specification

### Screen layout

```text
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Voice Work History                   â”‚
â”‚ Speak it. Review it. Keep it.        â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚             [ Microphone ]           â”‚
â”‚       Tap to record todayâ€™s work      â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Transcript                            â”‚
â”‚ â€œ...â€                                 â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Review work record                    â”‚
â”‚ Employer       [ Rajesh             ] â”‚
â”‚ Hours worked   [ 8                  ] â”‚
â”‚ Paid           [ â‚¹500               ] â”‚
â”‚ Pending        [ â‚¹400               ] â”‚
â”‚ Date           [ 18 Jul 2026        ] â”‚
â”‚ [Discard]                [Confirm]   â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Total hours 42   Paid â‚¹18,400         â”‚
â”‚ Pending â‚¹1,200                        â”‚
â”‚ Recent work history                   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Required UI states and messages

| Situation | UI behavior | Primary action |
| --- | --- | --- |
| Microphone denied | Explain permission requirement without blame | Open browser settings / Try again |
| Unsupported recording API | State browser limitation | Use prepared demo audio |
| Recording failure | Preserve no audio; show concise error | Try again |
| Upload failure | Keep the in-memory/session audio where possible | Retry / Use demo fallback |
| Processing timeout | Explain that no record was saved | Retry / Enter manually |
| Invalid extraction | Show transcript plus empty/editable review form | Edit manually / Retry |
| API/network error | Explain connection requirement | Retry / Use demo fallback |
| IndexedDB failure | Explain that device saving failed | Retry save / Copy values |
| Delete request | Require confirmation | Delete permanently / Cancel |

### Accessibility requirements

- Minimum 44 Ã— 44 px interactive targets.
- High-contrast colors and readable sans-serif typography.
- A visible text label for all icons and status colors.
- Keyboard-operable controls and visible focus states.
- Semantic form labels, descriptive error messages, and ARIA live updates for processing status.
- No auto-playing audio, flashing elements, or time-limited confirmation action.

## 10. Functional Acceptance Criteria

### Voice recording

- User can start and stop recording from the main screen.
- A stop action creates a non-empty audio Blob when the browser supports recording.
- App stops microphone tracks when recording completes or is cancelled.
- User can cancel before upload without creating a saved record.

### Parsing

- Client sends a valid Blob as `multipart/form-data` to `POST /api/parse`.
- Server rejects missing, empty, oversized, or unsupported audio with a clear client-safe error.
- Server returns transcript plus a normalized, validated draft or an actionable error.
- Client does not persist server output until explicit user confirmation.

### Review and save

- Every parsed field is editable.
- User can confirm, discard, or retry a draft.
- Confirm saves a `worker_confirmed` record in IndexedDB.
- Saved record appears in history and totals update immediately.

### History and deletion

- History sorts newest work date first, then saved timestamp.
- Totals calculate from confirmed records only.
- Delete permanently removes the selected record from local IndexedDB after confirmation.

## 11. Technical Stack

| Area | Choice | Reason |
| --- | --- | --- |
| Web framework | Next.js App Router | Fast full-stack TypeScript prototype |
| UI | React, Tailwind CSS, shadcn/ui, Lucide | Accessible, rapid component assembly |
| Language | TypeScript in strict mode | Safer data boundaries |
| Browser audio | MediaRecorder and Web Audio API | Native browser capture |
| AI SDK | OpenAI Node SDK | Server-side transcription and extraction |
| Validation | Zod | Runtime validation and inferred types |
| Local storage | IndexedDB through `idb` | More robust browser persistence than LocalStorage |
| Hosting | Vercel | Straightforward Next.js deployment |
| Testing | Vitest, React Testing Library, Playwright | Unit, component, and browser coverage |
| Formatting | ESLint and Prettier | Fast, consistent code quality |

`React Hook Form` may be added only if manual review fields become cumbersome. It is not required for the initial build.

## 12. Repository Structure and Coding Standards

```text
src/
  app/
    api/parse/route.ts
    layout.tsx
    page.tsx
  components/
    app-shell.tsx
    header.tsx
    voice-recorder.tsx
    processing-state.tsx
    transcript-panel.tsx
    work-log-review-card.tsx
    ledger-summary.tsx
    work-log-history.tsx
  features/work-logs/
    work-log-store.ts
    work-log-calculations.ts
  hooks/
    use-media-recorder.ts
    use-work-log-db.ts
  lib/
    constants.ts
    logger.ts
  schemas/
    api.ts
    work-log.ts
  services/
    transcription-service.ts
    extraction-service.ts
    normalization-service.ts
    validation-service.ts
    response-builder.ts
  types/
    work-log.ts
  utils/
    currency.ts
    dates.ts
```

### Standards

- TypeScript strict mode is mandatory.
- Use named exports except where framework conventions require a default export.
- Use functional React components and explicit props types.
- Do not use `any`; use `unknown` and validate at boundaries.
- Keep API, AI service, storage, and UI concerns separate.
- Run lint, type check, formatting check, and tests before deployment.
- Never log API keys, raw audio, or full transcripts in production diagnostics.

## 13. Architecture and Data Flow

```text
MediaRecorder
  â†“ audio Blob
FormData
  â†“
POST /api/parse
  â†“
Transcription Service
  â†“ transcript
Extraction Service
  â†“ structured candidate
Normalization Service
  â†“ normalized candidate
Validation Service
  â†“ validated draft
Response Builder
  â†“
Client review/edit
  â†“ user confirms
IndexedDB
```

### AI service layer responsibilities

| Service | Responsibility |
| --- | --- |
| Transcription service | Send audio to the configured transcription model and return text only |
| Extraction service | Convert the transcript into strict structured data using a versioned prompt/schema |
| Normalization service | Sanitize strings, coerce safe numeric formats, apply safe defaults, and mark review needs |
| Validation service | Validate the normalized draft with Zod; reject unsafe/malformed values |
| Response builder | Build a typed, client-safe API response with timings and request ID |

## 14. Data Model and Lifecycle

### Work log schema

```json
{
  "id": "uuid",
  "employer_name": "Rajesh",
  "hours_worked": 8,
  "amount_paid": 500,
  "amount_pending": 400,
  "work_date": "2026-07-18",
  "notes": "",
  "source_transcript": "Rajeshinu vendi...",
  "verification_status": "worker_confirmed",
  "created_at": "2026-07-18T23:30:00.000Z",
  "updated_at": "2026-07-18T23:30:00.000Z",
  "prompt_version": "1.0",
  "schema_version": "1.0",
  "normalization_version": "1.0"
}
```

### Field rules

- `employer_name`: trimmed text; use `Unknown` only as an editable draft default.
- `hours_worked`: number from 0 to 24; missing values default to 0 and require review.
- `amount_paid` and `amount_pending`: non-negative INR amounts; missing values default to 0 and require review.
- `work_date`: ISO calendar date; default to the device-local current date only when absent and flag for review.
- `notes`: optional string, maximum 500 characters.
- `verification_status`: `draft` in the review model, `worker_confirmed` after save only.

### Data lifecycle

```text
Voice
  â†“
Temporary Blob in browser memory/session retry storage
  â†“
Server processing
  â†“
Transcript and structured draft
  â†“
Worker review/edit
  â†“
Worker-confirmed record in IndexedDB
  â†“
User-initiated permanent deletion
```

The server does not store raw audio, transcripts, or work logs. The browser removes unsaved audio after cancellation, successful processing, session expiry, or user action.

## 15. API Contract

### `POST /api/parse`

**Purpose:** Convert a short audio work note into a reviewable draft. This endpoint never creates a persistent work record.

**Request**

```http
POST /api/parse
Content-Type: multipart/form-data
```

| Form field | Type | Requirement |
| --- | --- | --- |
| `audio` | File | Required; recorded audio Blob |
| `promptVersion` | String | Optional; default `1.0` |

**Audio constraints:** maximum 20 seconds and 5 MB for the demo. Client should prefer browser-supported `audio/webm`, `audio/mp4`, or `audio/wav` formats. The server verifies actual file presence and size.

**Success response**

```json
{
  "success": true,
  "requestId": "req_123",
  "transcript": "Rajeshinu vendi innu 8 manikkur joli cheythu.",
  "parsed": {
    "employer_name": "Rajesh",
    "hours_worked": 8,
    "amount_paid": 500,
    "amount_pending": 400,
    "work_date": "2026-07-18",
    "notes": "",
    "verification_status": "draft"
  },
  "needsReview": false,
  "metadata": {
    "promptVersion": "1.0",
    "schemaVersion": "1.0",
    "normalizationVersion": "1.0",
    "timingsMs": {
      "total": 3200,
      "transcription": 1700,
      "extraction": 1200,
      "normalizationValidation": 15
    }
  }
}
```

**Error response**

```json
{
  "success": false,
  "requestId": "req_123",
  "error": {
    "code": "PROCESSING_TIMEOUT",
    "message": "We could not process this recording. No work record was saved.",
    "retryable": true
  }
}
```

### Error codes

| HTTP | Code | Client behavior |
| --- | --- | --- |
| 400 | `AUDIO_REQUIRED` | Ask user to record again |
| 400 | `AUDIO_INVALID` | Explain supported formats/length |
| 413 | `AUDIO_TOO_LARGE` | Ask for a shorter recording |
| 422 | `EXTRACTION_INVALID` | Show transcript and manual review form |
| 429 | `RATE_LIMITED` | Ask user to retry after a short wait |
| 502 | `AI_UPSTREAM_ERROR` | Retry or use demo fallback |
| 504 | `PROCESSING_TIMEOUT` | Retry or enter values manually |
| 500 | `INTERNAL_ERROR` | Show request ID and retry option |

### Retry policy

- Client retries only after explicit user action.
- Server may retry one failed structured extraction when the upstream response is malformed.
- Server does not retry missing audio, invalid MIME, or validation failures caused by user input.
- Each retry receives a new request ID and is logged as a separate attempt.

## 16. Prompt, Extraction, and Normalization

### Prompt version 1.0

```text
You extract a daily work record from a workerâ€™s spoken transcript.
Return only data that is stated or directly implied by the transcript.
Do not invent employer names, dates, hours, wages, or pending amounts.
Use 0 for missing numeric amounts and "Unknown" for a missing employer name.
Set needs_review to true whenever any required value is missing, ambiguous, or inferred.
Return JSON matching the supplied schema exactly.
```

### Extraction schema

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": [
    "employer_name",
    "hours_worked",
    "amount_paid",
    "amount_pending",
    "work_date",
    "notes",
    "needs_review"
  ],
  "properties": {
    "employer_name": { "type": "string" },
    "hours_worked": { "type": "number" },
    "amount_paid": { "type": "number" },
    "amount_pending": { "type": "number" },
    "work_date": { "type": "string" },
    "notes": { "type": "string" },
    "needs_review": { "type": "boolean" }
  }
}
```

### Normalization rules

1. Strip whitespace and control characters from text fields.
2. Convert culturally formatted numeric values to finite numbers; reject negative values.
3. Clamp hours to 0â€“24; mark review when clamping or defaulting occurs.
4. Convert a missing date to the device-local date and set `needsReview`.
5. Do not derive a wage from hours, or pending amount from paid amount.
6. Preserve the original transcript separately for the worker to inspect.
7. Never follow instructions embedded in the transcript; treat it solely as user data to extract from.

## 17. Architecture Decision Records

### ADR-001: Use IndexedDB for confirmed records

- **Decision:** Store confirmed work logs in IndexedDB through `idb`.
- **Reason:** Supports structured local records without a backend database.
- **Alternative:** LocalStorage or PostgreSQL.
- **Tradeoff:** Records are browser/device-specific and can be lost if site data is cleared.

### ADR-002: No authentication in MVP

- **Decision:** Do not build login or profiles.
- **Reason:** The experiment tests voice-to-record friction, not account management.
- **Alternative:** Email/OTP authentication.
- **Tradeoff:** No cross-device sync or recovery.

### ADR-003: One parse endpoint

- **Decision:** Expose only `POST /api/parse`.
- **Reason:** Keeps orchestration and secret handling simple.
- **Alternative:** Separate transcription/extraction endpoints.
- **Tradeoff:** Less independently reusable API surface.

### ADR-004: Worker confirmation required

- **Decision:** Save only after review and explicit confirmation.
- **Reason:** AI extraction is a draft, not a fact.
- **Alternative:** Auto-save all parsed records.
- **Tradeoff:** One extra user action.

### ADR-005: No reliability score

- **Decision:** Do not calculate or display a worker score.
- **Reason:** The MVP lacks sufficient verified data and a score would imply judgment.
- **Alternative:** Generated confidence/reliability score.
- **Tradeoff:** Less dashboard-like visual impact, with stronger trust posture.

## 18. Threat Model and Mitigations

| Threat | Risk | Mitigation |
| --- | --- | --- |
| Incorrect extraction | Wrong wage record | Review/edit before any save; schema validation; regression fixtures |
| Fake recording | Unverified claim presented as fact | Label all MVP records `worker_confirmed`; make no external verification claim |
| Prompt injection in transcript | Transcript attempts to alter extraction behavior | Fixed system instructions; transcript treated as data; strict schema; no tools |
| API/network failure | User cannot complete flow | Explicit retry, manual review, deterministic demo fallback |
| Microphone permission denial | Recording unavailable | Clear permission guidance and demo-audio fallback |
| Browser storage loss | User loses local history | Explain local-only limitation; provide deletion and future sync roadmap |
| Privacy leakage | Audio/transcript exposure | No raw audio persistence; no production transcript logs; server-only API key |
| Secret leakage | Unauthorized API use | Use server environment variables only; never expose `OPENAI_API_KEY` to browser |

## 19. Performance Budget and Diagnostics

| Area | Budget | Measurement |
| --- | --- | --- |
| Recording | Under 20 seconds | Client timer |
| API processing | Under 5 seconds | Server total timer |
| End-to-end flow | Under 8 seconds | Client start-to-review timer |
| UI state update | Under 100 ms perceived | Manual device test |
| Initial production bundle | Keep small; avoid unnecessary media/UI packages | Build analyzer/production output review |

### Safe diagnostic event fields

- Request ID.
- Prompt, schema, and normalization versions.
- Total, transcription, extraction, and validation timings.
- Outcome category and error code.
- Whether fallback was used.
- Validation outcome and `needsReview` flag.

Do **not** log audio bytes, audio URLs, API keys, or full transcript text in production diagnostics.

## 20. Testing Strategy

### Automated tests

| Layer | Scenario | Expected result |
| --- | --- | --- |
| Unit | Numeric/date normalization | Safe normalized values and correct `needsReview` flag |
| Unit | Invalid values | Reject negative/non-finite values |
| Unit | Totals | Sum only `worker_confirmed` logs |
| API | Missing/empty audio | `400` client-safe error |
| API | Malformed upstream extraction | One retry, then `422` manual-review path |
| API | Valid fixture transcript | Response matches versioned JSON fixture |
| Component | Recorder state | Button labels and disabled state change correctly |
| Component | Review form | Edit values and save correct local record |
| Browser | IndexedDB persistence | Confirmed log remains after refresh |
| Browser | Delete | Record and totals disappear after confirmation |

### AI regression fixtures

- Keep a small set of consented/prepared audio fixtures and expected normalized JSON.
- Run the same fixtures before each demo/deploy.
- Allow transcript wording to vary if the transcription model varies, but require the normalized record to meet expected values or intentionally flag review.
- Never use unconsented real user recordings as fixtures.

### Manual test matrix

| Area | Checks |
| --- | --- |
| Speech | Malayalam, Manglish, English, mixed money expressions |
| Audio | Quiet, moderate background noise, short silence, empty recording |
| Browser | Chrome, Edge, Firefox, Safari |
| Mobile | Android Chrome, iPhone Safari |
| Accessibility | Keyboard, focus, contrast, screen-reader labels |
| Resilience | Wi-Fi/mobile interruption, API failure, IndexedDB disabled/blocked |

## 21. Debugging Playbook

| Symptom | Likely cause | Investigation | Resolution |
| --- | --- | --- | --- |
| Mic button fails | Permission denied or insecure origin | Inspect browser permissions and `navigator.mediaDevices` | Use HTTPS/localhost; guide user to enable mic |
| Empty audio | Recorder stopped too early | Check Blob size and event sequence | Require minimum duration/size; retry |
| Unsupported audio | Browser MIME mismatch | Inspect `MediaRecorder.isTypeSupported` | Choose supported MIME and send type metadata |
| API 401 | Missing/invalid key | Verify server environment only | Set `OPENAI_API_KEY`, restart deployment |
| Parse timeout | Network/API latency | Inspect timing fields/request ID | Retry; use prepared fallback for demo |
| Bad parsed values | Ambiguous transcript | Compare transcript and draft | Edit manually; improve prompt/fixture after event |
| Zod error | Upstream schema drift/malformed output | Inspect safe validation error category | Retry once; return manual review state |
| History missing | IndexedDB blocked/cleared | Inspect browser storage | Retry, explain device-local storage limitation |
| Vercel failure | Missing variable/build issue | Read deployment build/function logs | Fix environment/build issue, redeploy |

## 22. Local Setup and Deployment

### Local prerequisites

- Node.js current LTS.
- A package manager such as pnpm.
- OpenAI API key with access to the selected transcription and text extraction models.
- Modern browser with microphone permission.

### Environment variables

```bash
OPENAI_API_KEY=replace_me
OPENAI_TRANSCRIPTION_MODEL=whisper-1
OPENAI_EXTRACTION_MODEL=gpt-4o-mini
```

Model names must remain configurable. Before the sprint demo, verify that the selected account can call the configured models; use the available structured-output capable text model if the default is unavailable.

### Local workflow

1. Create Next.js application with TypeScript, Tailwind, ESLint, and App Router.
2. Install runtime dependencies: OpenAI SDK, Zod, `idb`, UI/icon packages.
3. Create `.env.local` locally and add it to `.gitignore`.
4. Build and test with prepared audio before adding visual polish.
5. Run lint, type check, unit tests, and production build.

### Vercel deployment

1. Push the repository to a Git provider.
2. Import it into Vercel as a Next.js project.
3. Add all server environment variables in Vercel project settings; never use `NEXT_PUBLIC_` for API keys.
4. Deploy and test microphone access on the production HTTPS URL.
5. Submit only after the live app, fallback path, and screenshot/video backup have been verified.

### Rollback

- Keep the last known-good Vercel deployment.
- If a new deployment fails, promote the prior deployment or redeploy its known-good commit.
- Do not change prompt/model configuration immediately before judging without rerunning prepared fixtures.

## 23. Demo Plan

### 90-second pitch

**Opening, 20 seconds:** â€œMillions of informal workers need a simple way to remember work completed, money paid, and money still pending. We asked one focused question: can a 20-second voice note become a trustworthy work record?â€

**Demo, 45 seconds:** Record a natural Malayalam/Manglish work note. Show the transcript, structured fields, edit one value if useful, confirm, and show the ledger totals/history update.

**AI explanation, 10 seconds:** â€œThe system transcribes the spoken note, extracts a structured draft, and requires the worker to confirm it before anything is saved.â€

**Close, 15 seconds:** â€œToday this is a worker-owned, voice-to-record experiment. If it proves useful, an editable daily work history could eventually support better employment records and opportunitiesâ€”without claiming that outcome today.â€

### Prepared demo input

> â€œRajeshinu vendi innu 8 manikkur joli cheythu. â‚¹500 kitti. â‚¹400 baki und.â€

Expected review draft: Employer Rajesh; Hours 8; Paid â‚¹500; Pending â‚¹400; current date; `needsReview: false` if all values are clear.

### Pre-demo checklist

- Production URL opens on the demonstration device.
- Microphone permission is already approved.
- API key and model access have been verified on the deployed app.
- One prepared audio file and one screen-recorded successful run are available locally.
- Demo fallback response is tested and visibly labelled.
- IndexedDB history includes one or two non-sensitive example entries for totals.
- Browser is refreshed, battery/network are checked, and pitch is rehearsed.

### Judge questions and answers

1. **Why AI?** Speech is unstructured; AI reduces it into an editable record instead of forcing a typed form.
2. **Why not a normal form?** The hypothesis tests whether voice reduces daily friction for this use case.
3. **Why transcription plus extraction?** Separating them makes the transcript visible and the record reviewable.
4. **Why not regex?** Natural speech varies by language, phrasing, and ordering; structured extraction handles broader phrasing while still requiring review.
5. **Why not fine-tune?** The MVP needs a fast experiment first; there is not enough consented, labelled data yet.
6. **Why not WhatsApp?** Voice familiarity is useful, but this MVP needs a dedicated review and local-ledger experience before adding messaging platforms.
7. **Why not OCR?** The input problem is spoken daily work, not a paper document.
8. **How do you prevent AI errors?** The system validates output, shows the transcript, and only saves after worker confirmation.
9. **How do you prevent fraud?** It does not claim to. MVP records are worker-confirmed, not employer-verified evidence.
10. **How is this different from e-Shram?** e-Shram is a national registration platform; this is a complementary experiment for ongoing daily work history.
11. **Why local storage?** It is fast and privacy-friendly for the scoped MVP, with the limitation clearly documented.
12. **What if there is no internet?** Transcription needs a connection; the app saves no false promise. It offers retry and a labelled demo fallback.
13. **What happens to the audio?** It is processed for the request and not persisted by the app/server.
14. **Why no login?** Authentication would not test the core voice-to-record hypothesis and would reduce sprint reliability.
15. **What languages are supported?** The demo focuses on prepared Malayalam/Manglish/English phrasing and requires broader user testing before any support claim.
16. **What is the business model?** Not in MVP scope; first validate usefulness and consent before considering future partnerships.
17. **What is the hardest technical risk?** Variability in noisy, code-switched speech; review/edit is the safety valve.
18. **Why no reliability score?** A score would imply unsupported judgment from limited, unverified data.
19. **What would you build next?** Pilot testing, consent-driven cloud backup, then optional employer verification only if users value it.
20. **What makes this hackathon-worthy?** It demonstrates an AI pipeline with a clear human-control loop around a concrete, local everyday problem.

## 24. Future Roadmap and Research Questions

### Phases

| Phase | Focus |
| --- | --- |
| 1: Hackathon | Voice â†’ review â†’ local ledger |
| 2: Pilot | Test language, edit rate, repeated use, and consent needs |
| 3: Optional cloud sync | User-controlled backup and cross-device access |
| 4: Optional employer verification | Only after worker/contractor workflow research |
| 5: Ecosystem exploration | Evaluate ethical, legal, and partner requirements before any financial use |

### Research questions

- Will workers record a daily log repeatedly, not just once?
- Which phrases, languages, and accents produce the fewest edits?
- Is the review screen understandable without assistance?
- Do users value pending-payment totals enough to return?
- Would contractors voluntarily verify records, and what consent model would be fair?
- Would WhatsApp reduce friction or create privacy and trust concerns?
- What recovery mechanism do users expect when they change or lose phones?

## 25. Final Hackathon Schedule

| Time allocation | Outcome |
| --- | --- |
| 0â€“15 min | Scaffold project, environment variables, design shell |
| 15â€“50 min | Recorder and one server parse pipeline work with prepared input |
| 50â€“75 min | Review/edit, confirmation, IndexedDB, totals/history |
| 75â€“95 min | Error UX, deterministic fallback, mobile visual polish |
| 95â€“110 min | Test production deployment and backup recording |
| 110â€“120 min | Rehearse pitch, verify fallback, submit |

## Appendix A: Glossary

- **Draft:** AI-assisted, editable work record that has not been saved.
- **Worker-confirmed:** Record explicitly approved by the person using the device; not externally verified.
- **Normalization:** Converting model-proposed values into safe, consistent application data.
- **Fallback:** Clearly labelled deterministic demo data shown when API/network processing cannot complete.
- **Prompt version:** Identifier for the extraction instructions used for a response.

## Appendix B: References to Validate Before Public Claims

- Official e-Shram information for any statement about its purpose or scope.
- Official OpenAI API documentation for configured transcription and structured-output model support.
- Consent and privacy guidance appropriate to any future pilot or user-data collection.


