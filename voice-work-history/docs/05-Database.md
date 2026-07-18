# 05 — Database

## Storage: IndexedDB

All data is stored in the browser's IndexedDB. There is no server-side database.

- **Library:** `idb` (typed wrapper for IndexedDB)
- **DB name:** `voice-work-history`
- **Version:** `1`
- **Store:** `work-logs` (keyPath: `id`)

---

## WorkLog Schema (stored record)

```typescript
type WorkLog = {
  id: string;                          // crypto.randomUUID()
  employer_name: string;               // max 120 chars
  hours_worked: number;                // 0–24, finite
  amount_paid: number;                 // ≥ 0
  amount_pending: number;              // ≥ 0
  work_date: string;                   // "YYYY-MM-DD"
  notes: string;                       // max 500 chars
  source_transcript: string;           // raw Whisper output
  verification_status: "worker_confirmed";
  created_at: string;                  // ISO 8601
  updated_at: string;                  // ISO 8601
}
```

### Optional Wage-Management Field

```typescript
follow_up_date?: string; // local YYYY-MM-DD date, only for a pending payment
```

This value is optional, does not create a notification, and is not sent to an employer or server.

## WorkLogDraft Schema (before confirmation)

```typescript
type WorkLogDraft = {
  employer_name: string;
  hours_worked: number;
  amount_paid: number;
  amount_pending: number;
  work_date: string;
  notes: string;
  verification_status: "draft";
}
```

Drafts are never persisted. They exist only in React state during the review step.

---

## Operations (`lib/work-log-db.ts`)

| Function | Description |
|---|---|
| `getLogs()` | Returns all `WorkLog` records, sorted by `work_date` descending |
| `putLog(log)` | Upserts a `WorkLog` (uses `keyPath: id`) |
| `deleteLog(id)` | Removes a record by id |

---

## Zod Validation (`schemas/work-log.ts`)

```typescript
// Used server-side to validate GPT output
extractionSchema = draftSchema
  .omit({ verification_status: true })
  .extend({ needs_review: z.boolean() })

// Used to validate what gets sent to IndexedDB
draftSchema = z.object({
  employer_name: z.string().trim().min(1).max(120),
  hours_worked:  z.number().finite().min(0).max(24),
  amount_paid:   z.number().finite().min(0),
  amount_pending: z.number().finite().min(0),
  work_date:     z.string().date(),
  notes:         z.string().max(500),
  verification_status: z.literal("draft"),
})
```

---

## Privacy

- Data never leaves the device (except during the `/api/parse` audio upload)
- No user ID, no account, no sync
- Clearing browser storage deletes all records — the user is responsible for their own backup
