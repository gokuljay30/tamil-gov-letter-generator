"use client";

import Field from "@/components/common/Field";
import TextTransformActions from "@/components/ai/TextTransformActions";
import type { LetterDocument } from "@/models/letter";

const toLines = (value: string) => value.split("\n");

export default function CopyFieldsEditor({ letter, update, aiConfigured }: {
  letter: LetterDocument;
  update: <K extends keyof LetterDocument>(key: K, value: LetterDocument[K]) => void;
  aiConfigured: boolean;
}) {
  const updateTypeData = (values: Partial<LetterDocument["typeData"]>) =>
    update("typeData", { ...letter.typeData, ...values });

  const copyText = (letter.typeData.copyToLines ?? []).join("\n");
  const submittedCopyText = (letter.typeData.submittedCopyToLines ?? []).join("\n");

  return <div className="section-card">
    <h2>நகல் விவரங்கள் (விருப்பம்)</h2>
    <Field label="நகல்" hint="தேவையில்லையெனில் காலியாக விடவும்; ஒவ்வொரு வரியையும் தனி வரியில் உள்ளிடவும்">
      <textarea id="letter-copy-to" rows={4} value={copyText} onChange={(event) => updateTypeData({ copyToLines: toLines(event.target.value) })} />
    </Field>
    <TextTransformActions field="body" currentText={copyText} supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil"]} onAccept={(text) => updateTypeData({ copyToLines: toLines(text) })} aiConfigured={aiConfigured} dictationTargetId="letter-copy-to" />

    <Field label="நகல் பணிந்து அனுப்பப்படுகிறது" hint="தேவையில்லையெனில் காலியாக விடவும்; ஒவ்வொரு வரியையும் தனி வரியில் உள்ளிடவும்">
      <textarea id="letter-submitted-copy-to" rows={4} value={submittedCopyText} onChange={(event) => updateTypeData({ submittedCopyToLines: toLines(event.target.value) })} />
    </Field>
    <TextTransformActions field="body" currentText={submittedCopyText} supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil"]} onAccept={(text) => updateTypeData({ submittedCopyToLines: toLines(text) })} aiConfigured={aiConfigured} dictationTargetId="letter-submitted-copy-to" />
  </div>;
}
