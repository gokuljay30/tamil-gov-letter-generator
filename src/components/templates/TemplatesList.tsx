"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LetterTemplate } from "@/models/template";

export default function TemplatesList({ initialTemplates, userId }: { initialTemplates: LetterTemplate[]; userId: string }) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function duplicate(template: LetterTemplate) {
    setBusyId(template.id);
    const supabase = createClient();
    const { data, error } = await supabase.from("templates").insert({
      user_id: userId,
      name: `${template.name} - நகல்`,
      category: template.category || null,
      description: template.description || null,
      department_heading: template.departmentHeading || null,
      sender: template.sender,
      recipient: template.recipient,
      salutation: template.salutation || null,
      subject: template.subject || null,
      references: template.references,
      body: template.body || null,
      signature: template.signature,
      variables: template.variables
    }).select("*").single();
    setBusyId(null);
    if (error || !data) return window.alert("வார்ப்புருவை நகலெடுக்க முடியவில்லை.");
    window.location.reload();
  }

  async function remove(template: LetterTemplate) {
    if (!window.confirm(`“${template.name}” வார்ப்புருவை நீக்கவா?`)) return;
    setBusyId(template.id);
    const supabase = createClient();
    const { error } = await supabase.from("templates").delete().eq("id", template.id);
    setBusyId(null);
    if (error) return window.alert("வார்ப்புருவை நீக்க முடியவில்லை.");
    setTemplates((current) => current.filter((item) => item.id !== template.id));
  }

  return (
    <div className="template-grid">
      {templates.map((template) => (
        <article className="template-card" key={template.id}>
          <div className="template-card-heading">
            <div>
              <h2>{template.name}</h2>
              <span>{template.category || "பொது"}</span>
            </div>
          </div>
          {template.description ? <p>{template.description}</p> : null}
          <dl>
            <dt>பொருள்</dt><dd>{template.subject || "—"}</dd>
            <dt>கடைசியாக பயன்படுத்தியது</dt>
            <dd>{template.lastUsedAt ? new Date(template.lastUsedAt).toLocaleString("ta-IN") : "இன்னும் பயன்படுத்தப்படவில்லை"}</dd>
          </dl>
          <div className="template-actions">
            <Link className="button button-primary link-button" href={`/templates/${template.id}/use`}>பயன்படுத்தவும்</Link>
            <Link className="text-action" href={`/templates/${template.id}/edit`}>திருத்து</Link>
            <button onClick={() => duplicate(template)} disabled={busyId === template.id}>நகலெடு</button>
            <button className="danger-action" onClick={() => remove(template)} disabled={busyId === template.id}>நீக்கு</button>
          </div>
        </article>
      ))}
    </div>
  );
}

