"use client";

import { Mic, Square } from "lucide-react";
import { useRef, useState } from "react";

type Props = { disabled: boolean; onReady: (audio: Blob) => void; onError: (message: string) => void };

export function VoiceRecorder({ disabled, onReady, onError }: Props) {
  const [recording, setRecording] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<BlobPart[]>([]);
  async function start() {
    if (!navigator.mediaDevices || !window.MediaRecorder) return onError("This browser cannot record audio. Try a modern mobile browser.");
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const next = new MediaRecorder(stream.current); recorder.current = next; chunks.current = [];
      next.ondataavailable = (event) => chunks.current.push(event.data);
      next.onstop = () => { stream.current?.getTracks().forEach((track) => track.stop()); setRecording(false); const blob = new Blob(chunks.current, { type: next.mimeType || "audio/webm" }); if (blob.size) onReady(blob); else onError("No audio was captured. Please try again."); };
      next.start(); setRecording(true);
    } catch { onError("Microphone access is needed. Check browser permissions and try again."); }
  }
  return (
    <div className="record-wrapper">
      {recording ? (
        <button
          aria-label="Stop recording work note"
          className="record danger"
          onClick={() => recorder.current?.stop()}
          type="button"
        >
          <Square size={32} fill="white" />
        </button>
      ) : (
        <button
          aria-label="Start recording work note"
          className="record"
          disabled={disabled}
          onClick={start}
          type="button"
        >
          <Mic size={36} />
        </button>
      )}
    </div>
  );
}
