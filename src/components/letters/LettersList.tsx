"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { LetterRow } from "@/lib/letters/mappers";
import { rowToLetter } from "@/lib/letters/mappers";
import SaveAsTemplateButton from "@/components/templates/SaveAsTemplateButton";
import TextTransformActions from "@/components/ai/TextTransformActions";
import { letterTypeLabel } from "@/lib/letters/types";

function recipientText(row: LetterRow) {
  return row.recipient?.lines?.filter(Boolean).join(", ") ?? "";
}

export default function LettersList({ initialLetters, userId, aiConfigured }: { initialLetters: LetterRow[]; userId: string; aiConfigured: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [letters, setLetters] = useState(initialLetters);
  const [busyId, setBusyId] = useState<string | null>(null);
  const filtered = useMemo(() => {
    const value = query.trim().toLocaleLowerCase();
    if (!value) return letters;
    return letters.filter((letter) =>
      [letter.file_number, recipientText(letter), letter.subject, letterTypeLabel(letter.letter_type ?? "government_letter")]
        .some((field) => field.toLocaleLowerCase().includes(value))
    );
  }, [letters, query]);

  async function duplicate(letter: LetterRow) {
    setBusyId(letter.id);
    const supabase = createClient();
    const { data, error } = await supabase.from("letters").insert({
      user_id: userId,
      status: "draft",
      letter_type: letter.letter_type ?? "government_letter",
      type_data: letter.type_data ?? {},
      bold_headers: letter.bold_headers ?? true,
      font_size_step: letter.font_size_step ?? 0,
      file_number: letter.file_number,
      letter_date: letter.letter_date,
      department_heading: letter.department_heading,
      sender: letter.sender,
      recipient: letter.recipient,
      salutation: letter.salutation,
      subject: letter.subject,
      references: letter.references,
      body: letter.body,
      signature: letter.signature
    }).select("id").single();
    setBusyId(null);
    if (error || !data) {
      window.alert("கடிதத்தை நகலெடுக்க முடியவில்லை.");
      return;
    }
    router.push(`/letters/${data.id}`);
  }

  async function remove(letter: LetterRow) {
    if (!window.confirm("இந்தக் கடிதத்தை நிரந்தரமாக நீக்கவா?")) return;
    setBusyId(letter.id);
    const supabase = createClient();
    const { error } = await supabase.from("letters").delete().eq("id", letter.id);
    setBusyId(null);
    if (error) {
      window.alert("கடிதத்தை நீக்க முடியவில்லை.");
      return;
    }
    localStorage.removeItem(`tamil-government-letter-tool:draft:v1:${letter.id}`);
    setLetters((current) => current.filter((item) => item.id !== letter.id));
  }

  return (
    <>
      <div className="letter-search-tools">
        <input id="letters-history-search" className="letter-search" type="search" placeholder="கோப்பு எண், பெறுநர் அல்லது பொருள் மூலம் தேடவும்" value={query} onChange={(e) => setQuery(e.target.value)} />
        <TextTransformActions
          field="subject"
          currentText={query}
          supportedActions={["transliterate_tanglish", "translate_en_ta"]}
          onAccept={setQuery}
          aiConfigured={aiConfigured}
          dictationTargetId="letters-history-search"
        />
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state">கடிதங்கள் எதுவும் இல்லை.</div>
      ) : (
        <div className="table-wrap">
          <table className="letters-table">
            <thead><tr><th>வகை</th><th>நாள்</th><th>கோப்பு எண்</th><th>பெறுநர்</th><th>பொருள் / விவரம்</th><th>நிலை</th><th>புதுப்பிப்பு</th><th>செயல்கள்</th></tr></thead>
            <tbody>
              {filtered.map((letter) => (
                <tr key={letter.id}>
                  <td>{letterTypeLabel(letter.letter_type ?? "government_letter")}</td>
                  <td>{letter.letter_date || "—"}</td>
                  <td>{letter.file_number || "—"}</td>
                  <td>{recipientText(letter) || "—"}</td>
                  <td>{letter.subject || letter.body?.slice(0, 80) || "—"}</td>
                  <td><span className={`status-badge status-${letter.status}`}>{letter.status === "completed" ? "முடிந்தது" : "வரைவு"}</span></td>
                  <td>{new Date(letter.updated_at).toLocaleString("ta-IN")}</td>
                  <td className="actions-cell">
                    <div className="row-actions">
                      <Link className="text-action" href={`/letters/${letter.id}`}>திற</Link>
                      <button onClick={() => duplicate(letter)} disabled={busyId === letter.id}>நகலெடு</button>
                      {(letter.letter_type ?? "government_letter") === "government_letter" ? <SaveAsTemplateButton letter={rowToLetter(letter)} compact /> : null}
                      <button className="danger-action" onClick={() => remove(letter)} disabled={busyId === letter.id}>நீக்கு</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
