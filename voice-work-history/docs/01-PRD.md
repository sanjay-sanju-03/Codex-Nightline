# 01 — Product Requirements Document

## Problem

Daily-wage and informal workers in India have no reliable way to track what they worked, what they were paid, and what is still owed. Paper records get lost. Spreadsheets require literacy and a device with data. At the end of a dispute or a loan application, workers often have nothing to show.

## Core Hypothesis

> Workers will create daily work records using voice — faster than typing, in their own language, on a basic smartphone.

## Target User

A daily-wage worker in India who:
- Uses a smartphone but may have low English literacy
- Works for multiple employers across a week
- Needs a record of hours and payments for disputes, loans, or government schemes
- Has limited or intermittent internet access

**Primary persona:** Construction worker, domestic worker, agricultural labourer, delivery rider.

## Core User Flow

```
1. Open the app
2. Tap the microphone
3. Speak a short work note (≤ 20 seconds)
4. Review the auto-filled form (employer, hours, paid, pending, date, notes)
5. Correct any field if needed
6. Confirm & save
7. See the record appear in Recent history
8. View running totals (hours, paid, pending)
```

## MVP Features (Built)

| Feature | Status |
|---|---|
| Browser microphone recording | ✅ |
| Audio upload to `/api/parse` | ✅ |
| Whisper transcription | ✅ |
| GPT-4o-mini field extraction | ✅ |
| Editable review form | ✅ |
| Confirm & save to IndexedDB | ✅ |
| Running totals (hours / paid / pending) | ✅ |
| Delete a record | ✅ |
| Demo fallback (no API key needed) | ✅ |
| Offline-capable (after first load) | ✅ |

---

## Deliberately Out of Scope

To preserve focus and validate one hypothesis, the MVP intentionally excludes:

- User authentication or accounts
- Employer verification
- Cloud synchronization or backup
- WhatsApp or SMS integration
- Loan or credit recommendations
- Credit scoring
- Analytics or dashboards
- Push notifications
- Multi-user or family collaboration
- OCR for paper wage slips
- Government scheme integrations (e-Shram, MGNREGA)
- Multilingual voice input (Whisper handles it, but UI is English-only)
- Export to PDF or CSV

These are post-validation features. None of them are needed to test the core hypothesis.

---

## Evidence Plan

**Hypothesis:**
Workers will create daily work records using voice, faster and more accurately than they would by typing.

**Evidence to Collect:**

| Signal | How to measure |
|---|---|
| Time to complete a log | Stopwatch from tap-to-record to Confirm & save |
| Edit rate | % of AI-extracted fields corrected before saving |
| Most corrected field | Which field is wrong most often |
| Comprehension | Does the user understand the transcript shown? |
| Return intent | "Would you use this tomorrow?" (verbal) |

**Success Criteria:**
- Users complete a work log in under 20 seconds
- Fewer than 2 fields corrected per log on average
- Users understand the value without explanation from the researcher

**Failure Criteria:**
- Users prefer typing over speaking
- AI extraction requires extensive corrections every time
- Workers do not perceive a benefit worth continuing

---

## Success Metric for This Hackathon

A judge who has never seen the app can complete a work log in one take during the live demo, using only voice.
