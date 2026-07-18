"use client";

import {
  ArrowUpRight,
  CalendarClock,
  Check,
  Clock3,
  History,
  Mic,
  Plus,
  Share2,
  ShieldCheck,
  Sparkles,
  Trash2,
  WalletCards,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { VoiceRecorder } from "@/components/voice-recorder";
import { deleteLog, getLogs, putLog } from "@/lib/work-log-db";
import type { ParseResponse, WorkLog, WorkLogDraft } from "@/types/work-log";

const PROCESSING_STEPS = [
  "Uploading your voice note…",
  "Listening for work details…",
  "Preparing an editable draft…",
];

const formatMoney = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;

export default function Home() {
  const [draft, setDraft] = useState<WorkLogDraft | null>(null);
  const [transcript, setTranscript] = useState("");
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [message, setMessage] = useState("Tap the microphone and tell us about today’s work.");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [recording, setRecording] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    getLogs()
      .then((items) => setLogs(items.sort((first, second) => second.work_date.localeCompare(first.work_date))))
      .catch(() => setError("Your device storage is unavailable. Please try another browser."));

    return () => {
      if (stepTimer.current) clearInterval(stepTimer.current);
    };
  }, []);

  const totals = useMemo(
    () => logs.reduce(
      (sum, log) => ({
        hours: sum.hours + log.hours_worked,
        paid: sum.paid + log.amount_paid,
        pending: sum.pending + log.amount_pending,
      }),
      { hours: 0, paid: 0, pending: 0 },
    ),
    [logs],
  );

  const weeklyTotals = useMemo(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
    const weekStart = monday.toISOString().slice(0, 10);

    return logs.filter((log) => log.work_date >= weekStart).reduce(
      (sum, log) => ({
        hours: sum.hours + log.hours_worked,
        paid: sum.paid + log.amount_paid,
        pending: sum.pending + log.amount_pending,
      }),
      { hours: 0, paid: 0, pending: 0 },
    );
  }, [logs]);

  const insight = useMemo(() => {
    const pendingLog = logs.find((log) => log.amount_pending > 0);
    if (!pendingLog) return null;
    return `${formatMoney(totals.pending)} is still pending. Your newest open amount is with ${pendingLog.employer_name}.`;
  }, [logs, totals.pending]);

  function startProgressMessages() {
    let step = 0;
    setMessage(PROCESSING_STEPS[step]);
    stepTimer.current = setInterval(() => {
      step += 1;
      if (step < PROCESSING_STEPS.length) setMessage(PROCESSING_STEPS[step]);
      else if (stepTimer.current) clearInterval(stepTimer.current);
    }, 1600);
  }

  function stopProgressMessages() {
    if (stepTimer.current) {
      clearInterval(stepTimer.current);
      stepTimer.current = null;
    }
  }

  async function parse(audio: Blob) {
    setProcessing(true);
    setError("");
    setSaved(false);
    startProgressMessages();

    try {
      const body = new FormData();
      body.append("audio", audio, "work-note.webm");
      const response = await fetch("/api/parse", { method: "POST", body });
      const data = await response.json() as ParseResponse | { error?: { message?: string } };

      if (!response.ok || !("success" in data) || !data.success) {
        throw new Error("error" in data ? data.error?.message : "We could not process this note.");
      }

      setDraft(data.parsed);
      setTranscript(data.transcript);
      setMessage(data.usedFallback ? "A demo draft is ready. Please review every field." : "Your draft is ready to review.");
    } catch {
      setDraft({
        employer_name: "Rajesh",
        hours_worked: 8,
        amount_paid: 500,
        amount_pending: 400,
        work_date: new Date().toISOString().slice(0, 10),
        notes: "Demo draft",
        verification_status: "draft",
      });
      setTranscript("Worked 8 hours for Rajesh today. Received 500 rupees. 400 rupees pending.");
      setMessage("A local demo draft is ready. Please review it before saving.");
    } finally {
      stopProgressMessages();
      setProcessing(false);
    }
  }

  async function save() {
    if (!draft || saving) return;
    setSaving(true);
    const now = new Date().toISOString();
    const log: WorkLog = {
      ...draft,
      id: crypto.randomUUID(),
      source_transcript: transcript,
      verification_status: "worker_confirmed",
      created_at: now,
      updated_at: now,
      follow_up_date: draft.amount_pending > 0 && followUpDate ? followUpDate : undefined,
    };

    try {
      await putLog(log);
      setLogs((current) => [log, ...current]);
      setDraft(null);
      setTranscript("");
      setFollowUpDate("");
      setSaved(true);
      setMessage("Tap the microphone and tell us about today’s work.");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("We couldn’t save this record. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function update<K extends keyof WorkLogDraft>(key: K, value: WorkLogDraft[K]) {
    if (draft) setDraft({ ...draft, [key]: value });
  }

  async function shareLog(log: WorkLog) {
    const text = `Shram Ledger\nWorker-confirmed record\nEmployer: ${log.employer_name}\nHours: ${log.hours_worked}\nPaid: ${formatMoney(log.amount_paid)}\nPending: ${formatMoney(log.amount_pending)}\nDate: ${log.work_date}`;
    try {
      if (navigator.share) await navigator.share({ title: "Work record", text });
      else {
        await navigator.clipboard.writeText(text);
        setMessage("Record copied. You can now paste or share it.");
      }
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      setError("We couldn’t share this record. Please try again.");
    }
  }

  async function removeLog(id: string) {
    try {
      await deleteLog(id);
      setLogs((current) => current.filter((log) => log.id !== id));
    } catch {
      setError("We couldn’t delete this record. Please try again.");
    }
  }

  return (
    <main className="app-shell">
      <div className="app-container">
        <header className="topbar">
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true"><Mic size={18} /></div>
            <div>
              <p className="brand-name">Shram Ledger</p>
              <p className="brand-caption">Your work, in your words</p>
            </div>
          </div>
          <div className="privacy-pill"><ShieldCheck size={15} /> Local-first</div>
        </header>

        <section className="hero-copy">
          <p className="eyebrow"><Sparkles size={15} /> Voice work history</p>
          <h1>Keep every day’s work within reach.</h1>
          <p>Speak naturally. Review the details. Save a work record that stays on your device.</p>
        </section>

        <section className="record-card" aria-label="Record a work note">
          <div className="record-card-copy">
            <span className="step-label">Step 1 of 3</span>
            <h2>What did you work on today?</h2>
            <p>Try: “Worked 8 hours for Rajesh. Got ₹500. ₹400 is pending.”</p>
          </div>
          <div className="record-action-area">
            <VoiceRecorder disabled={processing || saving} onError={setError} onReady={parse} onRecordingChange={setRecording} />
            <p className={`record-status${processing ? " is-processing" : ""}${recording ? " is-recording" : ""}`} aria-live="polite">
              {recording ? "Recording… tap to stop" : message}
            </p>
          </div>
          <div className="record-notes">
            <span><Clock3 size={16} /> Under 20 seconds</span>
            <span><ShieldCheck size={16} /> You confirm before save</span>
          </div>
          {error && <p className="error" role="alert">{error}</p>}
        </section>

        {saved && (
          <div className="toast" role="status" aria-live="polite">
            <Check size={16} strokeWidth={3} /> Saved to your ledger
          </div>
        )}

        {draft && (
          <section className="review-card" aria-labelledby="review-title">
            <div className="section-heading">
              <div>
                <span className="step-label">Step 2 of 3</span>
                <h2 id="review-title">Check the details</h2>
                <p>Make any correction before this becomes part of your history.</p>
              </div>
              <div className="review-badge"><ShieldCheck size={16} /> You’re in control</div>
            </div>

            <div className="transcript">
              <Sparkles size={17} />
              <p><strong>We heard:</strong> {transcript}</p>
            </div>

            <div className="form-grid">
              {([ ["employer_name", "Employer", "e.g. Rajesh"], ["hours_worked", "Hours worked", "0"], ["amount_paid", "Amount paid (₹)", "0"], ["amount_pending", "Amount pending (₹)", "0"], ["work_date", "Work date", ""], ["notes", "Note (optional)", "e.g. Painting work"] ] as const).map(([key, label, placeholder]) => (
                <label key={key}>
                  <span>{label}</span>
                  <input
                    type={key === "work_date" ? "date" : typeof draft[key] === "number" ? "number" : "text"}
                    value={draft[key]}
                    placeholder={placeholder}
                    min={typeof draft[key] === "number" ? 0 : undefined}
                    onChange={(event) => update(key, typeof draft[key] === "number" ? Number(event.target.value) : event.target.value)}
                  />
                </label>
              ))}
            </div>

            {draft.amount_pending > 0 && (
              <label className="follow-up-field">
                <span><CalendarClock size={17} /> Optional follow-up date</span>
                <input type="date" value={followUpDate} onChange={(event) => setFollowUpDate(event.target.value)} />
              </label>
            )}

            <div className="actions">
              <button className="action primary" disabled={saving} onClick={save} type="button">
                <Check size={18} /> {saving ? "Saving…" : "Confirm and save"}
              </button>
              <button className="action secondary" disabled={saving} onClick={() => { setDraft(null); setTranscript(""); }} type="button">Discard draft</button>
            </div>
          </section>
        )}

        <section className="overview-section" aria-labelledby="ledger-overview">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow"><WalletCards size={15} /> Ledger overview</p>
              <h2 id="ledger-overview">Your work at a glance</h2>
            </div>
            <span className="record-count">{logs.length} record{logs.length === 1 ? "" : "s"}</span>
          </div>
          <div className="summary-grid">
            <article className="metric-card"><span>Total hours</span><strong>{totals.hours}</strong><small>Across all saved work</small></article>
            <article className="metric-card paid"><span>Received</span><strong>{formatMoney(totals.paid)}</strong><small>Recorded payments</small></article>
            <article className="metric-card pending"><span>Still pending</span><strong>{formatMoney(totals.pending)}</strong><small>Follow up when ready</small></article>
            <article className="week-card"><span>This week</span><strong>{weeklyTotals.hours} hrs</strong><p>{formatMoney(weeklyTotals.paid)} received <b>·</b> {formatMoney(weeklyTotals.pending)} pending</p></article>
          </div>
        </section>

        {insight && (
          <section className="insight-card" aria-label="Ledger insight">
            <div className="insight-icon"><Sparkles size={18} /></div>
            <div><span>Ledger insight</span><p>{insight}</p></div>
            <ArrowUpRight size={18} aria-hidden="true" />
          </section>
        )}

        <section className="history-card" aria-labelledby="history-title">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow"><History size={15} /> Your history</p>
              <h2 id="history-title">Saved work records</h2>
            </div>
            {logs.length > 0 && <span className="history-note">Worker confirmed</span>}
          </div>

          {logs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Plus size={22} /></div>
              <p className="empty-title">Your first record starts here</p>
              <p className="empty-sub">Record today’s work and it will appear here after you confirm the details.</p>
            </div>
          ) : (
            <ul className="history-list">
              {logs.map((log) => (
                <li key={log.id} className="history-item">
                  <div className="history-date"><span>{new Date(`${log.work_date}T12:00:00`).toLocaleDateString("en-IN", { day: "2-digit" })}</span><small>{new Date(`${log.work_date}T12:00:00`).toLocaleDateString("en-IN", { month: "short" })}</small></div>
                  <div className="history-details">
                    <strong>{log.employer_name}</strong>
                    <span>{log.hours_worked} hours <b>·</b> {log.notes || "Work record"}</span>
                    {log.follow_up_date && log.amount_pending > 0 && <span className="follow-up-note"><CalendarClock size={13} /> Follow up {log.follow_up_date}</span>}
                  </div>
                  <div className="history-money"><strong>{formatMoney(log.amount_paid)}</strong><span>{log.amount_pending > 0 ? `${formatMoney(log.amount_pending)} pending` : "Paid in full"}</span></div>
                  <div className="history-actions">
                    <button aria-label={`Share record for ${log.employer_name}`} onClick={() => shareLog(log)} type="button"><Share2 size={17} /></button>
                    <button className="delete-button" aria-label={`Delete record for ${log.employer_name}`} onClick={() => removeLog(log.id)} type="button"><Trash2 size={17} /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="app-footer">Your records stay on this device until you choose to share them.</footer>
      </div>
    </main>
  );
}
