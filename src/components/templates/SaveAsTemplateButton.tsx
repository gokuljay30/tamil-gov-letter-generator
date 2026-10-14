"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LetterDocument } from "@/models/letter";

export default function SaveAsTemplateButton({ letter, compact = false }: { letter: LetterDocument; compact?: boolean }) {
  const [saving, setSaving] = useState(false);

  async function save() {
    const name = window.prompt("வார்ப்புரு பெயர் / Template Name");
    if (!name?.trim()) return;
    const category = window.prompt("வகை / Category (விருப்பம்)") ?? "";
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = user ? await supabase.from("templates").insert({
      user_id: user.id,
      name: name.trim(),
      category: category.trim() || null,
      department_heading: letter.departmentHeading,
      sender: letter.sender,
      recipient: letter.recipient,
      salutation: letter.salutation,
      subject: letter.subject,
      references: letter.references,
      body: letter.body,
      signature: letter.signature,
      variables: []
    }) : { error: new Error("Not authenticated") };
    setSaving(false);
    if (error) return window.alert("வார்ப்புருவைச் சேமிக்க முடியவில்லை.");
    window.alert("வார்ப்புரு சேமிக்கப்பட்டது ✓");
  }

  return <button type="button" className={compact ? "" : "button button-secondary"} onClick={save} disabled={saving}>{saving ? "சேமிக்கிறது…" : "வார்ப்புருவாக சேமி"}</button>;
}

