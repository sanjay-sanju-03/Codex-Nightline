# Parse API

## Contract

`POST /api/parse` accepts a short audio Blob in `multipart/form-data` and returns a validated `WorkLogDraft` plus transcript.

## Server Responsibilities

- Reject missing, empty, and oversized audio.
- Keep `OPENAI_API_KEY` server-only.
- Transcribe, extract, normalize, and validate before responding.
- Return no persistent record; the browser owns confirmation and storage.

## Failure Behavior

- Return a client-safe error when live parsing fails.
- The client, not the API, may then show its labelled fallback draft.
