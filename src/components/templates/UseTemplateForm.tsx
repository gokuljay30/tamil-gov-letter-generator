"use client";

import { FormEvent, Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { applyTemplateValues } from "@/lib/templates/placeholders";
import type { LetterTemplate } from "@/models/template";
import TextTransformActions from "@/components/ai/TextTransformActions";
import { inclusiveDateCount } from "@/lib/templates/dates";

export default function UseTemplateForm({ template, userId, aiConfigured }: { template: LetterTemplate; userId: string; aiConfigured: boolean }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(template.variables.map((item) => [item.key, item.defaultValue])));
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!template.variables.some((item) => item.key === "number_of_days")) return;
    const calculated = inclusiveDateCount(values.from_date ?? "", values.to_date ?? "");
    if (calculated === null) return;
    setValues((current) => current.number_of_days === calculated
      ? current
      : { ...current, number_of_days: calculated });
  }, [template.variables, values.from_date, values.to_date]);

  async function createLetter(event: FormEvent) {
    event.preventDefault();
    setCreating(true);
    const supabase = createClient();
    const today = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date()).replaceAll("/", "-");
    const content = applyTemplateValues(template, { ...values, date: values.date?.trim() || today });
    const { data, error } = await supabase.from("letters").insert({
      user_id: userId,
      status: "draft",
      file_number: "",
      letter_date: today,
      ...content
    }).select("id").single();
    if (!error && data) await supabase.from("templates").update({ last_used_at: new Date().toISOString() }).eq("id", template.id);
    setCreating(false);
    if (error || !data) return window.alert("கடிதத்தை உருவாக்க முடியவில்லை.");
    router.push(`/letters/${data.id}`);
  }

  return (
    <form className="settings-form variable-form" onSubmit={createLetter}>
      {template.variables.length === 0 ? <p>இந்த வார்ப்புருவிற்கு நிரப்ப வேண்டிய மாறிகள் இல்லை.</p> : template.variables.map((item) => {
        const inputId = `template-variable-${item.key}`;
        const supportsTextActions = item.type === "text" || item.type === "textarea";
        return <Fragment key={item.key}>
          <label className="field">
            <span className="field__label">{item.label}</span>
            {item.type === "textarea"
              ? <textarea id={inputId} rows={3} required={item.required} value={values[item.key] ?? ""} onChange={(e) => setValues({ ...values, [item.key]: e.target.value })} />
              : <input id={inputId} type={item.type === "date" ? "date" : item.type === "number" ? "number" : "text"} required={item.required} value={values[item.key] ?? ""} onChange={(e) => setValues({ ...values, [item.key]: e.target.value })} />}
          </label>
          {supportsTextActions ? <TextTransformActions
            field="body"
            currentText={values[item.key] ?? ""}
            supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil"]}
            onAccept={(text) => setValues((current) => ({ ...current, [item.key]: text }))}
            aiConfigured={aiConfigured}
            context={{ subject: template.subject, department: template.departmentHeading }}
            dictationTargetId={inputId}
          /> : null}
        </Fragment>;
      })}
      <p className="field__hint">காலியாக விடப்பட்ட மதிப்புகள் கடிதத்தில் திருத்தக்கூடிய placeholder ஆகவே இருக்கும்.</p>
      <button className="button button-primary" disabled={creating}>{creating ? "உருவாக்குகிறது…" : "கடிதம் உருவாக்கு"}</button>
    </form>
  );
}
