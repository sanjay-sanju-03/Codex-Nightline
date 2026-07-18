# Security Principles

## API Keys

- Never expose OpenAI API keys to the browser.
- Read model credentials only from server-side environment variables.
- Keep `.env.local` ignored by Git and out of screenshots, logs, and demos.

## Privacy

- Worker records remain local by default.
- Do not automatically upload, synchronize, or share records.
- Do not persist raw audio after parsing.

## AI Safety

- Treat model output as untrusted input.
- Normalize and validate every response before it reaches review.
- Never write AI output directly to IndexedDB.

## Future Gate

Cloud sync requires explicit worker consent, deletion/export controls, and a security design review before implementation.
