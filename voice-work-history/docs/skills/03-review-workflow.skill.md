# Review Workflow

Every AI response is a draft, not a record.

```text
Record → AI draft → review → edit → worker confirms → save
```

## Requirements

- Show the transcript beside editable fields.
- Allow discard without a storage write.
- Save only after an explicit worker action.
- Keep `verification_status` as `draft` until save, then write `worker_confirmed`.
- Explain parse failures without implying the worker did anything wrong.
