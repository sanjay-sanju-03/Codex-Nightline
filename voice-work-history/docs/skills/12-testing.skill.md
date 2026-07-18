# Testing

## Core Checklist

- Microphone permission and recording start/stop.
- Empty or silent audio.
- Live parse success and malformed extraction.
- Fallback draft when the API or network fails.
- Edit, confirm, discard, save, delete, and reload history.
- Weekly summary and follow-up-date persistence.
- Web Share API and clipboard fallback.
- Manglish, Malayalam, English, noise, and ambiguous amounts.

## Regression Rule

Before changing prompts, normalization, or schemas, run prepared audio/transcript fixtures and confirm that all output remains reviewable.
