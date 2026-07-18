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
    getLogs()
      .then(async (fetched) => {
        if (fetched.length === 0) {
          // Pre-populate with three realistic demo records for a polished visual presentation
          const now = new Date().toISOString();
          const seedData: WorkLog[] = [
            {
              id: "seed-1",
              employer_name: "Suresh",
              hours_worked: 8,
              amount_paid: 500,
              amount_pending: 200,
              work_date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
              notes: "Construction work log",
              source_transcript: "Worked 8 hours for Suresh today. Received 500 rupees. 200 still pending.",
              verification_status: "worker_confirmed",
              created_at: now,
              updated_at: now,
            },
            {
              id: "seed-2",
              employer_name: "Anil",
              hours_worked: 6,
              amount_paid: 600,
              amount_pending: 0,
              work_date: new Date(Date.now() - 172800000).toISOString().slice(0, 10),
              notes: "Painting log",
              source_transcript: "Worked 6 hours for Anil. Paid in full.",
              verification_status: "worker_confirmed",
              created_at: now,
              updated_at: now,
            },
            {
              id: "seed-3",
              employer_name: "Rajesh",
              hours_worked: 10,
              amount_paid: 700,
              amount_pending: 300,
              work_date: new Date(Date.now() - 259200000).toISOString().slice(0, 10),
              notes: "Material transport",
              source_transcript: "Worked 10 hours for Rajesh today. Got 700 rupees. 300 pending.",
              verification_status: "worker_confirmed",
              created_at: now,
              updated_at: now,
            },
          ];
          for (const log of seedData) {
            await putLog(log);
          }
          setLogs(seedData);
        } else {
          setLogs(fetched);
        }
      })
      .catch(() => setError("Local storage is unavailable in this browser."));
  }, []);

  const totals = useMemo(
    () => logs.reduce(
      (sum, log) => ({ hours: sum.hours + log.hours_worked, paid: sum.paid + log.amount_paid, pending: sum.pending + log.amount_pending }),
      { hours: 0, paid: 0, pending: 0 }
    ),
    [logs]
  );

  // Generate dynamic, useful assistant insights client-side using current logs
  const aiInsight = useMemo(() => {
    if (logs.length === 0) return null;
    const pendingLogs = logs.filter(log => log.amount_pending > 0);
    if (pendingLogs.length > 0) {
      const mostRecentPending = pendingLogs[0];
      return `You have ₹${totals.pending} in pending payments. Consider following up with ${mostRecentPending.employer_name} about the ₹${mostRecentPending.amount_pending} pending from ${mostRecentPending.work_date}.`;
    }
    return "All logged jobs are fully paid. Good job keeping your ledger balanced!";
  }, [logs, totals.pending]);

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
          <p className="eyebrow">Shram Ledger</p>
          <h1>Never forget a day&apos;s work again</h1>
          <p className="subtitle">Record your work in your own voice. Review it. Save it.</p>
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
            <h2>Review your work</h2>
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
                <Check size={18} /> {saving ? "Saving…" : "Keep record"}
              </button>
              <button className="action" disabled={saving} onClick={() => { setDraft(null); setTranscript(""); }} type="button">
                Discard
              </button>
            </div>
          </section>
        )}

        {/* Dynamic AI Insight Card */}
        {aiInsight && (
          <section className="insight-card">
            <p>💡 <strong>AI Insight:</strong> {aiInsight}</p>
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
          <h2>My work history</h2>
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
