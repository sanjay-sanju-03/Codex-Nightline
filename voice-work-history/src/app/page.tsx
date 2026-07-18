"use client";

import { Check, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { VoiceRecorder } from "@/components/voice-recorder";
import { deleteLog, getLogs, putLog } from "@/lib/work-log-db";
import type { ParseResponse, WorkLog, WorkLogDraft } from "@/types/work-log";

const PROCESSING_STEPS = [
  "Uploading audio…",
  "Transcribing speech…",
  "Extracting work details…",
  "Preparing your review…",
];

export default function Home() {
  const [draft, setDraft] = useState<WorkLogDraft | null>(null);
  const [transcript, setTranscript] = useState("");
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [message, setMessage] = useState("Ready to record a short work note.");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    getLogs().then(setLogs).catch(() => setError("Local storage is unavailable in this browser."));
  }, []);

  const totals = useMemo(
    () => logs.reduce(
      (sum, log) => ({ hours: sum.hours + log.hours_worked, paid: sum.paid + log.amount_paid, pending: sum.pending + log.amount_pending }),
      { hours: 0, paid: 0, pending: 0 }
    ),
    [logs]
  );

  function startProgressMessages() {
    let step = 0;
    setMessage(PROCESSING_STEPS[0]);
    stepTimer.current = setInterval(() => {
      step += 1;
      if (step < PROCESSING_STEPS.length) {
        setMessage(PROCESSING_STEPS[step]);
      } else {
        if (stepTimer.current) clearInterval(stepTimer.current);
      }
    }, 1800);
  }

  function stopProgressMessages() {
    if (stepTimer.current) { clearInterval(stepTimer.current); stepTimer.current = null; }
  }

  async function parse(audio: Blob) {
    setProcessing(true); setError(""); setSaved(false);
    startProgressMessages();
    try {
      const body = new FormData();
      body.append("audio", audio, "work-note.webm");
      const response = await fetch("/api/parse", { method: "POST", body });
      const data = await response.json() as ParseResponse | { error?: { message?: string } };
      if (!response.ok || !("success" in data) || !data.success) {
        throw new Error("error" in data ? data.error?.message : "Could not process the recording.");
      }
      setDraft(data.parsed);
      setTranscript(data.transcript);
      setMessage(data.usedFallback ? "Demo fallback is ready — review every field." : "Review the draft before saving it.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not process the recording.");
      setMessage("No work record was saved.");
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
    };
    try {
      await putLog(log);
      setLogs((current) => [log, ...current]);
      setDraft(null);
      setTranscript("");
      setSaved(true);
      setMessage("Ready to record a short work note.");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("We could not save this record. Try again.");
    } finally {
      setSaving(false);
    }
  }

  function update<K extends keyof WorkLogDraft>(key: K, value: WorkLogDraft[K]) {
    if (draft) setDraft({ ...draft, [key]: value });
  }

  return (
    <main>
      <div className="shell">
        <header>
          <p className="eyebrow">Project Shram</p>
          <h1>Voice Work History</h1>
          <p className="subtitle">Speak it. Review it. Keep it.</p>
        </header>

        {/* Record panel */}
        <section className="panel center">
          <VoiceRecorder disabled={processing || saving} onError={setError} onReady={parse} />
          <p className={`message${processing ? " processing" : ""}`} aria-live="polite">
            {message}
          </p>
          {error && <p className="error" role="alert">{error}</p>}
        </section>

        {/* Success toast */}
        {saved && (
          <div className="toast" role="status" aria-live="polite">
            <Check size={15} strokeWidth={3} />
            Record saved to this device
          </div>
        )}

        {/* Review / edit draft */}
        {draft && (
          <section className="panel">
            <h2>Review work record</h2>
            <p className="transcript"><strong>Transcript:</strong> {transcript}</p>
            <div className="form-grid">
              {([ ["employer_name", "Employer"], ["hours_worked", "Hours worked"], ["amount_paid", "Paid (₹)"], ["amount_pending", "Pending (₹)"], ["work_date", "Work date"], ["notes", "Notes"] ] as const).map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    type={key === "work_date" ? "date" : typeof draft[key] === "number" ? "number" : "text"}
                    value={draft[key]}
                    onChange={(e) => update(key, typeof draft[key] === "number" ? Number(e.target.value) : e.target.value)}
                  />
                </label>
              ))}
            </div>
            <div className="actions">
              <button className="action primary" disabled={saving} onClick={save} type="button">
                <Check size={18} /> {saving ? "Saving…" : "Confirm & save"}
              </button>
              <button className="action" disabled={saving} onClick={() => { setDraft(null); setTranscript(""); }} type="button">
                Discard
              </button>
            </div>
          </section>
        )}

        {/* Totals */}
        <section className="totals">
          {([["Hours", totals.hours], ["Paid", `₹${totals.paid}`], ["Pending", `₹${totals.pending}`]] as const).map(([label, value]) => (
            <article className="panel" key={label}>
              <p>{label}</p>
              <strong>{value}</strong>
            </article>
          ))}
        </section>

        {/* History */}
        <section className="panel">
          <h2>Recent history</h2>
          {logs.length === 0 ? (
            <div className="empty-state">
              <p className="empty-title">Your work history starts here</p>
              <p className="empty-sub">Record today&apos;s work to build a personal work ledger.</p>
            </div>
          ) : (
            <ul>
              {logs.map((log) => (
                <li key={log.id}>
                  <div>
                    <strong>{log.employer_name} · {log.hours_worked} hours</strong>
                    <span>Paid ₹{log.amount_paid} · Pending ₹{log.amount_pending} · {log.work_date}</span>
                  </div>
                  <button
                    aria-label={`Delete record for ${log.employer_name}`}
                    onClick={() => deleteLog(log.id).then(() => setLogs((current) => current.filter((item) => item.id !== log.id)))}
                    type="button"
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
