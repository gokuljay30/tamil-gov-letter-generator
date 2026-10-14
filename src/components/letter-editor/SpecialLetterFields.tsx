"use client";

import Field from "@/components/common/Field";
import TextTransformActions from "@/components/ai/TextTransformActions";
import type { LetterDocument } from "@/models/letter";

function toLines(value: string) {
  return value.split("\n");
}

export default function SpecialLetterFields({ letter, update, aiConfigured }: {
  letter: LetterDocument;
  update: <K extends keyof LetterDocument>(key: K, value: LetterDocument[K]) => void;
  aiConfigured: boolean;
}) {
  const updateTypeData = (values: Partial<LetterDocument["typeData"]>) =>
    update("typeData", { ...letter.typeData, ...values });

  if (letter.letterType === "financial_sanction") {
    return <>
      <div className="section-card">
        <h2>நிதி இசைவாணை விவரங்கள்</h2>
        <Field label="அலுவலகத் தலைப்பு">
          <textarea id="sanction-heading" rows={3} value={letter.departmentHeading} onChange={(event) => update("departmentHeading", event.target.value)} />
        </Field>
        <TextTransformActions field="department_heading" currentText={letter.departmentHeading} supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil"]} onAccept={(text) => update("departmentHeading", text)} aiConfigured={aiConfigured} dictationTargetId="sanction-heading" />

        <Field label="முன்னிலை / அலுவலர்">
          <input id="sanction-presiding-officer" value={letter.typeData.presidingOfficer ?? ""} onChange={(event) => updateTypeData({ presidingOfficer: event.target.value })} />
        </Field>
        <TextTransformActions field="sender" currentText={letter.typeData.presidingOfficer ?? ""} supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil"]} onAccept={(text) => updateTypeData({ presidingOfficer: text })} aiConfigured={aiConfigured} dictationTargetId="sanction-presiding-officer" />
      </div>

      <div className="section-card two-field-grid">
        <Field label="ந.க.எண்"><input value={letter.fileNumber} onChange={(event) => update("fileNumber", event.target.value)} /></Field>
        <Field label="நாள்"><input value={letter.date} onChange={(event) => update("date", event.target.value)} placeholder="DD-MM-YYYY" /></Field>
      </div>

      <div className="section-card">
        <Field label="பொருள்">
          <textarea id="sanction-subject" rows={3} value={letter.subject} onChange={(event) => update("subject", event.target.value)} />
        </Field>
        <TextTransformActions field="subject" currentText={letter.subject} supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil"]} onAccept={(text) => update("subject", text)} aiConfigured={aiConfigured} dictationTargetId="sanction-subject" />

        <Field label="பார்வை" hint="ஒவ்வொரு பார்வையையும் தனி வரியில் உள்ளிடவும்">
          <textarea id="sanction-references" rows={5} value={letter.references.join("\n")} onChange={(event) => update("references", toLines(event.target.value))} />
        </Field>
        <TextTransformActions field="reference" currentText={letter.references.join("\n")} supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil"]} onAccept={(text) => update("references", toLines(text))} aiConfigured={aiConfigured} dictationTargetId="sanction-references" />

        <Field label="ஆணை / விவரம்">
          <textarea id="sanction-body" className="body-editor" rows={12} value={letter.body} onChange={(event) => update("body", event.target.value)} />
        </Field>
        <TextTransformActions field="body" currentText={letter.body} supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil", "grammar_tamil", "shorten", "expand"]} onAccept={(text) => update("body", text)} aiConfigured={aiConfigured} context={{ subject: letter.subject, department: letter.departmentHeading }} dictationTargetId="sanction-body" />

        <Field label="கணக்குத் தலைப்பு" hint="ஒவ்வொரு வரியையும் தனி வரியில் உள்ளிடவும்">
          <textarea id="sanction-account-head" rows={4} value={(letter.typeData.accountHeadLines ?? []).join("\n")} onChange={(event) => updateTypeData({ accountHeadLines: toLines(event.target.value) })} />
        </Field>
        <TextTransformActions field="body" currentText={(letter.typeData.accountHeadLines ?? []).join("\n")} supportedActions={["transliterate_tanglish", "translate_en_ta"]} onAccept={(text) => updateTypeData({ accountHeadLines: toLines(text) })} aiConfigured={aiConfigured} dictationTargetId="sanction-account-head" />
      </div>

      <div className="section-card">
        <Field label="கையொப்பப் பதவி / அலுவலகம்" hint="ஒவ்வொரு வரியையும் தனி வரியில் உள்ளிடவும்">
          <textarea id="sanction-signature" rows={4} value={letter.signature.lines.join("\n")} onChange={(event) => update("signature", { ...letter.signature, lines: toLines(event.target.value) })} />
        </Field>
        <TextTransformActions field="signature" currentText={letter.signature.lines.join("\n")} supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil"]} onAccept={(text) => update("signature", { ...letter.signature, lines: toLines(text) })} aiConfigured={aiConfigured} dictationTargetId="sanction-signature" />

      </div>
    </>;
  }

  if (letter.letterType === "proceedings") {
    return <>
      <div className="section-card">
        <h2>செயல்முறை ஆணை விவரங்கள்</h2>
        <Field label="அலுவலகத் தலைப்பு">
          <textarea id="proceedings-heading" rows={4} value={letter.departmentHeading} onChange={(event) => update("departmentHeading", event.target.value)} />
        </Field>
        <TextTransformActions field="department_heading" currentText={letter.departmentHeading} supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil"]} onAccept={(text) => update("departmentHeading", text)} aiConfigured={aiConfigured} dictationTargetId="proceedings-heading" />
      </div>

      <div className="section-card two-field-grid">
        <Field label="ந.க.எண்"><input value={letter.fileNumber} onChange={(event) => update("fileNumber", event.target.value)} /></Field>
        <Field label="நாள்"><input value={letter.date} onChange={(event) => update("date", event.target.value)} placeholder="DD-MM-YYYY" /></Field>
      </div>

      <div className="section-card">
        <Field label="பொருள்"><textarea id="proceedings-subject" rows={4} value={letter.subject} onChange={(event) => update("subject", event.target.value)} /></Field>
        <TextTransformActions field="subject" currentText={letter.subject} supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil"]} onAccept={(text) => update("subject", text)} aiConfigured={aiConfigured} dictationTargetId="proceedings-subject" />

        <Field label="பார்வை" hint="ஒவ்வொரு பார்வையையும் தனி வரியில் உள்ளிடவும்">
          <textarea id="proceedings-references" rows={6} value={letter.references.join("\n")} onChange={(event) => update("references", toLines(event.target.value))} />
        </Field>
        <TextTransformActions field="reference" currentText={letter.references.join("\n")} supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil"]} onAccept={(text) => update("references", toLines(text))} aiConfigured={aiConfigured} dictationTargetId="proceedings-references" />

        <Field label="ஆணை / விவரம்"><textarea id="proceedings-body" className="body-editor" rows={14} value={letter.body} onChange={(event) => update("body", event.target.value)} /></Field>
        <TextTransformActions field="body" currentText={letter.body} supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil", "grammar_tamil", "shorten", "expand"]} onAccept={(text) => update("body", text)} aiConfigured={aiConfigured} context={{ subject: letter.subject, department: letter.departmentHeading }} dictationTargetId="proceedings-body" />
      </div>

      <div className="section-card">
        <Field label="கையொப்பப் பதவி / அலுவலகம்" hint="ஒவ்வொரு வரியையும் தனி வரியில் உள்ளிடவும்">
          <textarea id="proceedings-signature" rows={4} value={letter.signature.lines.join("\n")} onChange={(event) => update("signature", { ...letter.signature, lines: toLines(event.target.value) })} />
        </Field>
        <TextTransformActions field="signature" currentText={letter.signature.lines.join("\n")} supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil"]} onAccept={(text) => update("signature", { ...letter.signature, lines: toLines(text) })} aiConfigured={aiConfigured} dictationTargetId="proceedings-signature" />

        <Field label="பெறுநர்" hint="ஒவ்வொரு வரியையும் தனி வரியில் உள்ளிடவும்">
          <textarea id="proceedings-recipient" rows={4} value={letter.recipient.lines.join("\n")} onChange={(event) => update("recipient", { lines: toLines(event.target.value) })} />
        </Field>
        <TextTransformActions field="recipient" currentText={letter.recipient.lines.join("\n")} supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil"]} onAccept={(text) => update("recipient", { lines: toLines(text) })} aiConfigured={aiConfigured} dictationTargetId="proceedings-recipient" />
      </div>
    </>;
  }

  return <>
    <div className="section-card">
      <h2>இரசீது விவரங்கள்</h2>
      <Field label="தலைப்பு"><input value={letter.typeData.receiptTitle ?? "இரசீது"} onChange={(event) => updateTypeData({ receiptTitle: event.target.value })} /></Field>
      <Field label="நாள்"><input value={letter.date} onChange={(event) => update("date", event.target.value)} placeholder="DD-MM-YYYY" /></Field>
      <Field label="இரசீது விவரம்">
        <textarea id="receipt-body" className="body-editor" rows={12} value={letter.body} onChange={(event) => update("body", event.target.value)} />
      </Field>
      <TextTransformActions field="body" currentText={letter.body} supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil", "grammar_tamil"]} onAccept={(text) => update("body", text)} aiConfigured={aiConfigured} dictationTargetId="receipt-body" />
    </div>

    <div className="section-card">
      <h2>பெற்றுக்கொண்டவர் விவரங்கள்</h2>
      <Field label="கையொப்பம்"><input id="receipt-signature" value={letter.typeData.receiptSignature ?? ""} onChange={(event) => updateTypeData({ receiptSignature: event.target.value })} /></Field>
      <Field label="பெயர்"><input id="receipt-name" value={letter.typeData.receiptName ?? ""} onChange={(event) => updateTypeData({ receiptName: event.target.value })} /></Field>
      <Field label="முகவரி"><textarea id="receipt-address" rows={4} value={letter.typeData.receiptAddress ?? ""} onChange={(event) => updateTypeData({ receiptAddress: event.target.value })} /></Field>
      <TextTransformActions field="recipient" currentText={letter.typeData.receiptAddress ?? ""} supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil"]} onAccept={(text) => updateTypeData({ receiptAddress: text })} aiConfigured={aiConfigured} dictationTargetId="receipt-address" />
    </div>
  </>;
}
