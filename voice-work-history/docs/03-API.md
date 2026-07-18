# 03 — API Reference

## POST /api/parse

Transcribes an audio recording and extracts structured work-log fields using AI.

### Request

```
POST /api/parse
Content-Type: multipart/form-data
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `audio` | `File` | Yes | audio/webm, max 5 MB |

### Response — Success (200)

```json
{
  "success": true,
  "transcript": "Worked 8 hours for Rajesh today. Received 500 rupees. 400 rupees pending.",
  "parsed": {
    "employer_name": "Rajesh",
    "hours_worked": 8,
    "amount_paid": 500,
    "amount_pending": 400,
    "work_date": "2025-07-18",
    "notes": "",
    "verification_status": "draft"
  },
  "needsReview": false,
  "usedFallback": false
}
```

### Response — Demo Fallback (200, no API key)

Same shape as success, with `"usedFallback": true`. UI shows a warning to review every field.

### Response — Errors

| Status | Condition | `error.message` |
|---|---|---|
| 400 | No audio file or empty | `"Record a short voice note before continuing."` |
| 413 | Audio > 5 MB | `"Keep recordings under 20 seconds."` |
| 502 | OpenAI call failed | `"We could not process this recording. No work record was saved."` |

### `needsReview` flag

Set to `true` when any of:
- GPT returned `needs_review: true`
- `work_date` was missing (defaulted to today)
- `employer_name` defaulted to `"Unknown"`

The UI does not currently surface this flag visually — all drafts go through manual review by design.

### Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | — | Required for live mode. Absent = demo fallback. |
| `OPENAI_TRANSCRIPTION_MODEL` | `whisper-1` | Override the transcription model |
| `OPENAI_EXTRACTION_MODEL` | `gpt-4o-mini` | Override the extraction model |
