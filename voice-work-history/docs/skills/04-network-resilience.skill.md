# Network Resilience

## Goal

Do not let a failed parse request break the review-and-save workflow.

```text
Live parse succeeds → AI draft
Live parse fails → labelled local demo fallback → review → save
```

## Boundaries

- Live transcription and extraction need an internet connection.
- The fallback is a deterministic demo draft, not offline AI.
- Fallback data must be visibly reviewable and never auto-saved.
- Keep prepared demo audio and a screen recording for event recovery.
