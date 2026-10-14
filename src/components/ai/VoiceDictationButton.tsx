"use client";

import { useEffect, useRef, useState } from "react";
import TransformReviewDialog from "@/components/ai/TransformReviewDialog";
import { insertTranscript } from "@/lib/dictation/text";
import { normalizeDictationPunctuation } from "@/lib/text/punctuation";

const MAX_RECORDING_SECONDS = 60;

function preferredMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"]
    .find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

export default function VoiceDictationButton({ currentText, onAccept, configured, context, targetId }: {
  currentText: string;
  onAccept: (text: string) => void;
  configured: boolean;
  context?: string;
  targetId?: string;
}) {
  const [state, setState] = useState<"idle" | "recording" | "transcribing">("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");
  const [review, setReview] = useState<{ original: string; proposed: string; spellcheckApplied: boolean } | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const selectionRef = useRef<{ start: number; end: number } | undefined>(undefined);

  function releaseMicrophone() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  useEffect(() => () => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    releaseMicrophone();
  }, []);

  useEffect(() => {
    if (state !== "recording") return;
    const timer = window.setInterval(() => setSeconds((value) => {
      if (value + 1 >= MAX_RECORDING_SECONDS) recorderRef.current?.stop();
      return value + 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [state]);

  async function transcribe(blob: Blob) {
    if (!blob.size) {
      setError("குரல் பதிவு காலியாக உள்ளது. மீண்டும் முயற்சிக்கவும்.");
      setState("idle");
      return;
    }
    setState("transcribing");
    try {
      const extension = blob.type.includes("mp4") ? "m4a" : blob.type.includes("ogg") ? "ogg" : "webm";
      const form = new FormData();
      form.append("audio", blob, `dictation.${extension}`);
      if (context?.trim()) form.append("context", context.trim().slice(0, 3000));
      const response = await fetch("/api/ai/transcribe", { method: "POST", body: form });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: unknown } | null;
        throw new Error(typeof payload?.error === "string" ? payload.error : `HTTP ${response.status}`);
      }
      const payload = await response.json() as { text?: unknown; spellcheckApplied?: unknown };
      if (typeof payload.text !== "string" || !payload.text.trim()) throw new Error("Empty transcription");
      const original = currentText;
      const selectionEnd = selectionRef.current?.end ?? original.length;
      const isMidTextInsertion = original.slice(selectionEnd).trim().length > 0;
      const transcript = normalizeDictationPunctuation(
        payload.text,
        targetId?.startsWith("government-table-") === true || isMidTextInsertion
      );
      setReview({
        original,
        proposed: insertTranscript(original, transcript, selectionRef.current),
        spellcheckApplied: payload.spellcheckApplied === true
      });
      if (payload.spellcheckApplied !== true) {
        setError("குரல் எழுத்தாக்கம் கிடைத்தது. எழுத்துப்பிழை சரிபார்ப்பு மட்டும் கிடைக்கவில்லை — ஏற்பதற்கு முன் சரிபார்க்கவும்.");
      }
    } catch {
      setError("குரல் எழுத்துப்பிழை சரிபார்ப்பு முடியவில்லை. மீண்டும் முயற்சிக்கவும்.");
    } finally {
      setState("idle");
    }
  }

  async function startRecording() {
    setError("");
    const target = targetId ? document.getElementById(targetId) : null;
    selectionRef.current = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
      ? { start: target.selectionStart ?? currentText.length, end: target.selectionEnd ?? currentText.length }
      : undefined;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("இந்த உலாவியில் குரல் பதிவு ஆதரிக்கப்படவில்லை.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const mimeType = preferredMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onerror = () => {
        releaseMicrophone();
        setState("idle");
        setError("குரல் பதிவு தோல்வியடைந்தது.");
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        releaseMicrophone();
        void transcribe(blob);
      };
      setSeconds(0);
      setState("recording");
      recorder.start(250);
    } catch {
      releaseMicrophone();
      setError("மைக்ரோஃபோன் அனுமதி தேவை. உலாவி அனுமதியைச் சரிபார்க்கவும்.");
    }
  }

  function handleClick() {
    if (state === "recording") recorderRef.current?.stop();
    else void startRecording();
  }

  const label = state === "recording"
    ? `■ நிறுத்து (${seconds}s)`
    : state === "transcribing" ? "எழுத்தாக்குகிறது…" : "🎙 பேசித் தமிழில் எழுது";

  return <>
    <button type="button" className={state === "recording" ? "dictation-recording" : undefined} onClick={handleClick} disabled={!configured || state === "transcribing"} title={!configured ? "AI not configured" : "ஒரு வாக்கியத்தைப் பேசி நிறுத்தவும்"}>{label}</button>
    {error ? <span className="transform-error" role="alert">{error}</span> : null}
    {review ? <TransformReviewDialog
      original={review.original}
      result={{ text: review.proposed, warnings: [] }}
      actionLabel={review.spellcheckApplied ? "குரல் பதிவு + எழுத்துப்பிழை மட்டும்" : "குரல் எழுத்தாக்கம் — சரிபார்க்கவும்"}
      onCancel={() => setReview(null)}
      onAccept={() => { onAccept(review.proposed); setReview(null); }}
    /> : null}
  </>;
}
