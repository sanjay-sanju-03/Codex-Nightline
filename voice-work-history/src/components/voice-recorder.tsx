"use client";

import { AudioLines, Mic, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
  disabled: boolean;
  onReady: (audio: Blob) => void;
  onError: (message: string) => void;
  onRecordingChange?: (recording: boolean) => void;
};

export function VoiceRecorder({ disabled, onReady, onError, onRecordingChange }: Props) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<BlobPart[]>([]);

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => setSeconds((current) => current + 1), 1000);
    return () => window.clearInterval(timer);
  }, [recording]);

  async function start() {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      onError("This browser cannot record audio. Try a modern mobile browser.");
      return;
    }

    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const next = new MediaRecorder(stream.current);
      recorder.current = next;
      chunks.current = [];
      next.ondataavailable = (event) => chunks.current.push(event.data);
      next.onstop = () => {
        stream.current?.getTracks().forEach((track) => track.stop());
        setRecording(false);
        onRecordingChange?.(false);
        const blob = new Blob(chunks.current, { type: next.mimeType || "audio/webm" });
        if (blob.size) onReady(blob);
        else onError("No audio was captured. Please try again.");
      };
      setSeconds(0);
      next.start();
      setRecording(true);
      onRecordingChange?.(true);
    } catch {
      onError("Microphone access is needed. Check browser permissions and try again.");
    }
  }

  const duration = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className={`record-wrapper${recording ? " is-recording" : ""}`}>
      <button
        aria-label={recording ? "Stop recording work note" : "Start recording work note"}
        className={`record${recording ? " danger" : ""}`}
        disabled={disabled}
        onClick={() => recording ? recorder.current?.stop() : start()}
        type="button"
      >
        <span className="record-icon">{recording ? <Square size={28} fill="currentColor" /> : <Mic size={32} />}</span>
        <span className="record-button-copy"><b>{recording ? "Stop recording" : "Start recording"}</b><small>{recording ? duration : "Tap to speak"}</small></span>
        {recording && <AudioLines className="record-levels" size={23} aria-hidden="true" />}
      </button>
    </div>
  );
}
