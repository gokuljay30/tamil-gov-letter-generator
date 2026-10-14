"use client";

import type { AITransformResult } from "@/lib/ai/types";

export default function TransformReviewDialog({ original, result, actionLabel, onAccept, onCancel }: {
  original: string;
  result: AITransformResult;
  actionLabel: string;
  onAccept: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="transform-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
      <section className="transform-dialog" role="dialog" aria-modal="true" aria-labelledby="transform-review-title">
        <h2 id="transform-review-title">மாற்றத்தைச் சரிபார்க்கவும்</h2>
        <div className="transform-action-label">செயல்: {actionLabel}</div>
        {result.warnings.length ? <div className="transform-warnings" role="alert">{result.warnings.map((warning, index) => <div key={`${warning}-${index}`}>⚠ {warning}</div>)}{result.missingIdentifiers?.length ? <div>காணப்படாதவை: {result.missingIdentifiers.join(", ")}</div> : null}</div> : null}
        <div className="transform-comparison">
          <div><h3>தற்போதைய உரை</h3><pre>{original}</pre></div>
          <div><h3>புதிய உரை</h3><pre>{result.text}</pre></div>
        </div>
        <div className="transform-dialog-actions">
          <button type="button" className="button button-secondary" onClick={onCancel}>வேண்டாம் / Cancel</button>
          <button type="button" className="button button-primary" onClick={onAccept}>ஏற்றுக்கொள் / Accept</button>
        </div>
      </section>
    </div>
  );
}
