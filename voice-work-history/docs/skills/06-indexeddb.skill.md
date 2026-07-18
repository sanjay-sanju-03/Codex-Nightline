# IndexedDB Storage

## Purpose

Persist worker-confirmed records locally through the `idb` wrapper.

## Rules

- Drafts remain in React state and are never stored.
- Use `getLogs`, `putLog`, and `deleteLog` rather than browser storage directly.
- Keep records scoped to the current browser origin.
- Treat deletion as permanent on that device.
- Add schema migration logic before making incompatible database changes.

## Never Do

- Upload or sync records automatically.
- Store raw audio in IndexedDB without explicit user consent and a new design review.
