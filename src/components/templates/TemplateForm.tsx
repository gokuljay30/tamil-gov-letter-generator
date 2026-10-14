"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { templateToRow } from "@/lib/templates/mappers";
import type { LetterTemplate, TemplateVariable, TemplateVariableType } from "@/models/template";

const newVariable = (): TemplateVariable => ({ key: "", label: "", type: "text", required: false, defaultValue: "" });

export default function TemplateForm({ initial }: { initial: LetterTemplate }) {
  const router = useRouter();
  const [template, setTemplate] = useState(initial);
  const [saving, setSaving] = useState(false);

  function updateVariable(index: number, patch: Partial<TemplateVariable>) {
    setTemplate((current) => ({
      ...current,
      variables: current.variables.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item)
    }));
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("templates").update(templateToRow({
      ...template,
      variables: template.variables.filter((item) => item.key.trim() && item.label.trim())
    })).eq("id", template.id);
    setSaving(false);
    if (error) return window.alert("வார்ப்புருவைச் சேமிக்க முடியவில்லை.");
    router.push("/templates");
    router.refresh();
  }

  return (
    <form className="settings-form template-form" onSubmit={save}>
      <div className="two-field-grid">
        <label className="field"><span className="field__label">வார்ப்புரு பெயர்</span><input required value={template.name} onChange={(e) => setTemplate({ ...template, name: e.target.value })} /></label>
        <label className="field"><span className="field__label">வகை</span><input value={template.category} onChange={(e) => setTemplate({ ...template, category: e.target.value })} /></label>
      </div>
      <label className="field"><span className="field__label">விளக்கம்</span><textarea rows={2} value={template.description} onChange={(e) => setTemplate({ ...template, description: e.target.value })} /></label>
      <label className="field"><span className="field__label">துறைத் தலைப்பு</span><input value={template.departmentHeading} onChange={(e) => setTemplate({ ...template, departmentHeading: e.target.value })} /></label>
      <div className="two-field-grid">
        <label className="field"><span className="field__label">அனுப்புநர் வரிகள்</span><textarea rows={5} value={template.sender.lines.join("\n")} onChange={(e) => setTemplate({ ...template, sender: { lines: e.target.value.split("\n") } })} /></label>
        <label className="field"><span className="field__label">பெறுநர் வரிகள்</span><textarea rows={5} value={template.recipient.lines.join("\n")} onChange={(e) => setTemplate({ ...template, recipient: { lines: e.target.value.split("\n") } })} /></label>
      </div>
      <label className="field"><span className="field__label">விளிப்பு</span><input value={template.salutation} onChange={(e) => setTemplate({ ...template, salutation: e.target.value })} /></label>
      <label className="field"><span className="field__label">பொருள்</span><textarea rows={2} value={template.subject} onChange={(e) => setTemplate({ ...template, subject: e.target.value })} /></label>
      <label className="field"><span className="field__label">பார்வைகள் — ஒவ்வொரு வரியிலும் ஒன்று</span><textarea rows={4} value={template.references.join("\n")} onChange={(e) => setTemplate({ ...template, references: e.target.value.split("\n") })} /></label>
      <label className="field"><span className="field__label">கடித உள்ளடக்கம்</span><textarea className="body-editor" rows={10} value={template.body} onChange={(e) => setTemplate({ ...template, body: e.target.value })} /></label>
      <div className="two-field-grid">
        <label className="field"><span className="field__label">கையொப்ப முடிப்பு</span><input value={template.signature.closing} onChange={(e) => setTemplate({ ...template, signature: { ...template.signature, closing: e.target.value } })} /></label>
        <label className="field"><span className="field__label">கையொப்ப வரிகள்</span><textarea rows={4} value={template.signature.lines.join("\n")} onChange={(e) => setTemplate({ ...template, signature: { ...template.signature, lines: e.target.value.split("\n") } })} /></label>
      </div>
      <section className="variable-editor">
        <div className="reference-header"><div><div className="field__label">மாறிகள் / Variables</div><div className="field__hint">உள்ளடக்கத்தில் {"{{variable_key}}"} வடிவில் பயன்படுத்தவும்.</div></div><button type="button" className="mini-button" onClick={() => setTemplate({ ...template, variables: [...template.variables, newVariable()] })}>+ மாறி சேர்க்க</button></div>
        {template.variables.map((item, index) => (
          <div className="variable-row" key={index}>
            <input aria-label="Variable key" placeholder="variable_key" value={item.key} onChange={(e) => updateVariable(index, { key: e.target.value.replace(/[^a-zA-Z0-9_]/g, "") })} />
            <input aria-label="Variable label" placeholder="காட்சி பெயர்" value={item.label} onChange={(e) => updateVariable(index, { label: e.target.value })} />
            <select aria-label="Variable type" value={item.type} onChange={(e) => updateVariable(index, { type: e.target.value as TemplateVariableType })}><option value="text">Text</option><option value="date">Date</option><option value="number">Number</option><option value="textarea">Textarea</option></select>
            <input aria-label="Default value" placeholder="இயல்புநிலை" value={item.defaultValue} onChange={(e) => updateVariable(index, { defaultValue: e.target.value })} />
            <label className="variable-required"><input type="checkbox" checked={item.required} onChange={(e) => updateVariable(index, { required: e.target.checked })} /> கட்டாயம்</label>
            <button type="button" className="danger-action" onClick={() => setTemplate({ ...template, variables: template.variables.filter((_, itemIndex) => itemIndex !== index) })}>நீக்கு</button>
          </div>
        ))}
      </section>
      <div className="form-actions"><button className="button button-primary" disabled={saving}>{saving ? "சேமிக்கிறது…" : "வார்ப்புருவைச் சேமி"}</button></div>
    </form>
  );
}
