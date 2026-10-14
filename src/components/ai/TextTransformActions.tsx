"use client";

import { useState } from "react";
import TransformReviewDialog from "@/components/ai/TransformReviewDialog";
import VoiceDictationButton from "@/components/ai/VoiceDictationButton";
import type { AIAction, AITransformResult, TransformAction, TransformField } from "@/lib/ai/types";
import { validateTransform } from "@/lib/ai/validation";
import { LocalTamilTransliterationProvider } from "@/lib/transliteration/tamil";

const LABELS: Record<TransformAction, string> = {
  transliterate_tanglish: "Tanglish எழுத்து → தமிழ்",
  translate_en_ta: "English பொருள் → தமிழ்",
  formal_tamil: "அலுவல் தமிழாக்கு",
  grammar_tamil: "இலக்கணம் சரிபார்",
  shorten: "சுருக்கு",
  expand: "விரிவாக்கு"
};

const ACTION_HELP: Record<TransformAction, string> = {
  transliterate_tanglish: "தமிழை English எழுத்துகளில் டைப் செய்ததைத் தமிழ் எழுத்தாக மாற்றும்.",
  translate_en_ta: "English வாக்கியத்தின் பொருளைத் தமிழில் மொழிபெயர்க்கும்.",
  formal_tamil: "ஏற்கனவே உள்ள தமிழை அலுவல் நடையில் மாற்றும்.",
  grammar_tamil: "தமிழ் இலக்கணத்தைச் சரிபார்க்கும்.",
  shorten: "பொருளைப் பாதுகாத்து உரையைச் சுருக்கும்.",
  expand: "உரையை விரிவாக்கும்."
};

const LOADING_LABELS: Record<TransformAction, string> = {
  transliterate_tanglish: "தமிழாக்கப்படுகிறது…",
  translate_en_ta: "தமிழில் மொழிபெயர்க்கப்படுகிறது…",
  formal_tamil: "அலுவல் தமிழ் தயாராகிறது…",
  grammar_tamil: "இலக்கணம் சரிபார்க்கப்படுகிறது…",
  shorten: "சுருக்கப்படுகிறது…",
  expand: "விரிவாக்கப்படுகிறது…"
};

export default function TextTransformActions({ field, currentText, supportedActions, onAccept, aiConfigured, context, dictationTargetId }: {
  field: TransformField;
  currentText: string;
  supportedActions: TransformAction[];
  onAccept: (text: string) => void;
  aiConfigured: boolean;
  context?: { subject?: string; department?: string };
  dictationTargetId?: string;
}) {
  const [loading, setLoading] = useState<TransformAction | null>(null);
  const [result, setResult] = useState<AITransformResult | null>(null);
  const [error, setError] = useState("");
  const [reviewOriginal, setReviewOriginal] = useState("");
  const [reviewAction, setReviewAction] = useState<TransformAction>("formal_tamil");

  async function transform(action: TransformAction) {
    if (!currentText.trim()) return;
    setLoading(action);
    setError("");
    setReviewOriginal(currentText);
    setReviewAction(action);
    try {
      let transformed: AITransformResult;
      if (action === "transliterate_tanglish") {
        const provider = new LocalTamilTransliterationProvider();
        transformed = validateTransform(currentText, { text: await provider.transliterate(currentText), warnings: [] });
      } else {
        const response = await fetch("/api/ai/transform", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: action as AIAction, field, text: currentText, context })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        transformed = validateTransform(currentText, await response.json() as AITransformResult);
      }
      setResult(transformed);
    } catch {
      setError("மாற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="transform-actions">
      <div className="transform-buttons">
        <VoiceDictationButton
          currentText={currentText}
          onAccept={onAccept}
          configured={aiConfigured}
          targetId={dictationTargetId}
          context={[
            `Field: ${field}`,
            context?.department ? `Department: ${context.department}` : "",
            context?.subject ? `Subject: ${context.subject}` : "",
            currentText ? `Existing field text: ${currentText}` : ""
          ].filter(Boolean).join("\n")}
        />
        {supportedActions.map((action) => {
          const isAI = action !== "transliterate_tanglish";
          return <button type="button" key={action} onClick={() => transform(action)} disabled={Boolean(loading) || !currentText.trim() || (isAI && !aiConfigured)} title={isAI && !aiConfigured ? "AI not configured" : ACTION_HELP[action]}>{loading === action ? LOADING_LABELS[action] : LABELS[action]}</button>;
        })}
      </div>
      {!aiConfigured && supportedActions.some((action) => action !== "transliterate_tanglish") ? <span className="ai-unavailable">AI not configured — Tanglish மாற்றம் மட்டும் கிடைக்கும்</span> : null}
      {error ? <span className="transform-error" role="alert">{error}</span> : null}
      {result ? <TransformReviewDialog original={reviewOriginal} result={result} actionLabel={LABELS[reviewAction]} onCancel={() => setResult(null)} onAccept={() => { onAccept(result.text); setResult(null); }} /> : null}
    </div>
  );
}
