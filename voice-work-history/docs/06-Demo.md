# 06 — Demo Script

> Target: Complete in **90 seconds**. One take. No slides needed.

---

## Setup (before presenting)

- [ ] App running at `http://localhost:3000` (or deployed Vercel URL)
- [ ] `OPENAI_API_KEY` set — or confirm demo fallback works in airplane mode
- [ ] Microphone permissions granted in browser
- [ ] No existing records in the list (clear IndexedDB if needed: DevTools → Application → IndexedDB → Delete database)
- [ ] Browser tab is the only thing on screen

---

## The Script

### Opening (10 seconds)
> "Millions of daily-wage workers in India have no record of what they worked and what they're owed. Paper gets lost. Typing is too slow. We built Voice Work History."

### Step 1 — Tap to record (5 seconds)
Tap the microphone button.

> "I tap. I speak."

### Step 2 — Speak the work note (10 seconds)
Say naturally:
> *"Worked 8 hours for Suresh today. Received 400 rupees. 200 still pending."*

Tap Stop.

### Step 3 — Show AI extraction (15 seconds)
> "In about three seconds, the AI turns that into a reviewable record."

Wait for the form to appear. Point to each field.

> "Employer name — Suresh. Hours — 8. Paid — 400. Pending — 200. Date — today. Every field is editable. I correct anything wrong."

### Step 4 — Confirm & save (5 seconds)
Tap **Confirm & save**.

> "I confirm. It's saved — on this device only. No cloud. No account. The data belongs to the worker."

### Step 5 — Show totals (10 seconds)
Point to the totals strip.

> "At the end of the week, they can show an employer exactly what they worked and what's outstanding. That's the record that doesn't exist today."

### Close (5 seconds)
> "Voice Work History. Speak it. Review it. Keep it."

---

## Fallback (if API fails during demo)

The demo fallback fires automatically with no API key. Tell judges:

> "This is our offline fallback — the app works even without internet. In production, the AI fills this in from your voice."

Then proceed with editing and saving the fallback record — the flow is identical.

---

## Q&A Prep

| Question | Answer |
|---|---|
| Why not WhatsApp? | WhatsApp requires phone number, a Meta account, and internet. IndexedDB works offline and is private by default. Post-validation we'd consider it. |
| What about Hindi or Tamil? | Whisper auto-detects language. Workers can speak in any language Whisper supports. |
| Is the data secure? | It never leaves the device. The only server call is the audio upload for transcription, which is discarded after extraction. |
| What about workers without smartphones? | That's outside the MVP scope. A feature-phone or IVR version is a post-validation direction. |
| Why not a native app? | A PWA gives us mobile-first install behaviour without app store friction. That's the next step if users return daily. |
