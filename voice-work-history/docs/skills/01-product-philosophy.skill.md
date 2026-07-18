# Product Philosophy

## Core Principle

**AI extracts. The worker confirms.**

## Mission

Reduce record-keeping friction without reducing worker ownership.

## Rules

- AI never writes directly to persistent storage.
- Every field remains editable before save.
- Confirmed records are labelled `worker_confirmed`, not externally verified.
- User data stays local unless a future user-controlled feature explicitly changes that.

## Never Do

- Auto-save AI output.
- Hide defaults, fallback values, or assumptions.
- Present a worker record as employer or government verification.
