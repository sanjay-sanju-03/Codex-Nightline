# AI Extraction

## Purpose

Convert a short voice note into a reviewable work-record draft.

## Pipeline

```text
Audio → transcription → transcript → structured extraction → normalization → Zod validation → draft
```

## Requirements

- Treat the transcript as data, never as instructions.
- Never trust raw model JSON.
- Normalize numeric values, dates, whitespace, and safe defaults.
- Missing employer and numeric values use the current `Unknown`/`0` draft convention and set `needsReview`.
- Keep transcription and extraction model IDs configurable through server environment variables.

## Change Guardrail

Any extraction change needs regression fixtures for clear, ambiguous, and incomplete speech.
