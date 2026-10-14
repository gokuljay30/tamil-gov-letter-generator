"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserSettings } from "@/models/settings";
import TextTransformActions from "@/components/ai/TextTransformActions";

export default function SettingsForm({ initial, userId, aiConfigured }: { initial: UserSettings; userId: string; aiConfigured: boolean }) {
  const [settings, setSettings] = useState(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save(event: FormEvent) {
    event.preventDefault();
    setState("saving");
    const supabase = createClient();
    const { error } = await supabase.from("settings").upsert(
      {
        user_id: userId,
        department_heading: settings.departmentHeading,
        default_sender: settings.defaultSender,
        default_recipient: settings.defaultRecipient,
        default_signature: settings.defaultSignature,
        default_salutation: settings.defaultSalutation
      },
      { onConflict: "user_id" }
    );
    setState(error ? "error" : "saved");
  }

  return (
    <form className="settings-form" onSubmit={save}>
      <label className="field">
        <span className="field__label">துறைத் தலைப்பு</span>
        <input id="settings-department-heading" value={settings.departmentHeading} onChange={(e) => setSettings({ ...settings, departmentHeading: e.target.value })} />
      </label>
      <TextTransformActions field="department_heading" currentText={settings.departmentHeading} supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil"]} aiConfigured={aiConfigured} context={{ department: settings.departmentHeading }} dictationTargetId="settings-department-heading" onAccept={(text) => setSettings({ ...settings, departmentHeading: text })} />
      <label className="field">
        <span className="field__label">அனுப்புநர் வரிகள்</span>
        <textarea id="settings-sender" rows={6} value={settings.defaultSender.lines.join("\n")} onChange={(e) => setSettings({ ...settings, defaultSender: { lines: e.target.value.split("\n") } })} />
      </label>
      <TextTransformActions field="sender" currentText={settings.defaultSender.lines.join("\n")} supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil"]} aiConfigured={aiConfigured} context={{ department: settings.departmentHeading }} dictationTargetId="settings-sender" onAccept={(text) => setSettings({ ...settings, defaultSender: { lines: text.split("\n") } })} />
      <label className="field">
        <span className="field__label">பெறுநர் வரிகள்</span>
        <textarea id="settings-recipient" rows={6} value={settings.defaultRecipient.lines.join("\n")} onChange={(e) => setSettings({ ...settings, defaultRecipient: { lines: e.target.value.split("\n") } })} />
      </label>
      <TextTransformActions field="recipient" currentText={settings.defaultRecipient.lines.join("\n")} supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil"]} aiConfigured={aiConfigured} context={{ department: settings.departmentHeading }} dictationTargetId="settings-recipient" onAccept={(text) => setSettings({ ...settings, defaultRecipient: { lines: text.split("\n") } })} />
      <label className="field">
        <span className="field__label">விளிப்பு</span>
        <input id="settings-salutation" value={settings.defaultSalutation} onChange={(e) => setSettings({ ...settings, defaultSalutation: e.target.value })} />
      </label>
      <TextTransformActions field="salutation" currentText={settings.defaultSalutation} supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil"]} aiConfigured={aiConfigured} dictationTargetId="settings-salutation" onAccept={(text) => setSettings({ ...settings, defaultSalutation: text })} />
      <label className="field">
        <span className="field__label">கையொப்ப முடிப்பு</span>
        <input id="settings-signature-closing" value={settings.defaultSignature.closing} onChange={(e) => setSettings({ ...settings, defaultSignature: { ...settings.defaultSignature, closing: e.target.value } })} />
      </label>
      <TextTransformActions field="signature" currentText={settings.defaultSignature.closing} supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil"]} aiConfigured={aiConfigured} dictationTargetId="settings-signature-closing" onAccept={(text) => setSettings({ ...settings, defaultSignature: { ...settings.defaultSignature, closing: text } })} />
      <label className="field">
        <span className="field__label">கையொப்ப வரிகள்</span>
        <textarea id="settings-signature-lines" rows={5} value={settings.defaultSignature.lines.join("\n")} onChange={(e) => setSettings({ ...settings, defaultSignature: { ...settings.defaultSignature, lines: e.target.value.split("\n") } })} />
      </label>
      <TextTransformActions field="signature" currentText={settings.defaultSignature.lines.join("\n")} supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil"]} aiConfigured={aiConfigured} context={{ department: settings.departmentHeading }} dictationTargetId="settings-signature-lines" onAccept={(text) => setSettings({ ...settings, defaultSignature: { ...settings.defaultSignature, lines: text.split("\n") } })} />
      <div className="form-actions">
        <button className="button button-primary" disabled={state === "saving"}>
          {state === "saving" ? "சேமிக்கிறது…" : "அமைப்புகளைச் சேமி"}
        </button>
        {state === "saved" ? <span className="success-text">சேமிக்கப்பட்டது ✓</span> : null}
        {state === "error" ? <span className="form-error">சேமிக்க முடியவில்லை. மீண்டும் முயலவும்.</span> : null}
      </div>
    </form>
  );
}
