"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Field from "@/components/common/Field";
import LetterPreview from "@/components/letter-preview/LetterPreview";
import {
  clearLocalDraft,
  loadLocalDraft,
  saveLocalDraft
} from "@/lib/storage";
import type { GovernmentContentBlock, LetterContentSnapshot, LetterDocument, LetterType } from "@/models/letter";
import { createClient } from "@/lib/supabase/client";
import { letterToRow } from "@/lib/letters/mappers";
import SaveAsTemplateButton from "@/components/templates/SaveAsTemplateButton";
import TextTransformActions from "@/components/ai/TextTransformActions";
import SpecialLetterFields from "@/components/letter-editor/SpecialLetterFields";
import CopyFieldsEditor from "@/components/letter-editor/CopyFieldsEditor";
import { LETTER_TYPE_OPTIONS } from "@/lib/letters/types";
import GovernmentContentEditor from "@/components/letter-editor/GovernmentContentEditor";
import { bodyTextFromBlocks, contentBlocksOrLegacy } from "@/lib/letters/governmentContent";

function textareaLines(value: string): string[] {
  return value.split("\n");
}

function linesTextarea(lines: string[]): string {
  return lines.join("\n");
}

function contentSnapshot(letter: LetterDocument): LetterContentSnapshot {
  return {
    departmentHeading: letter.departmentHeading,
    sender: letter.sender,
    recipient: letter.recipient,
    fileNumber: letter.fileNumber,
    date: letter.date,
    salutation: letter.salutation,
    subject: letter.subject,
    references: letter.references,
    body: letter.body,
    signature: letter.signature
  };
}

export default function LetterWorkspace({ initialLetter, aiConfigured, newLetterUserId }: {
  initialLetter: LetterDocument;
  aiConfigured: boolean;
  newLetterUserId?: string;
}) {
  const [letter, setLetter] = useState<LetterDocument>(initialLetter);
  const [loaded, setLoaded] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "local-only">("saved");
  const persistedRef = useRef(!newLetterUserId);
  const revisionRef = useRef(0);

  useEffect(() => {
    const existing = loadLocalDraft(initialLetter.id);
    if (existing && new Date(existing.updatedAt).getTime() > new Date(initialLetter.updatedAt).getTime()) {
      setLetter(existing);
      revisionRef.current += 1;
      setHasChanges(true);
    }
    setLoaded(true);
  }, [initialLetter]);

  useEffect(() => {
    if (!loaded || !hasChanges) return;

    setSaveState("saving");
    const savingRevision = revisionRef.current;
    const timer = window.setTimeout(async () => {
      const updated = {
        ...letter,
        updatedAt: new Date().toISOString()
      };
      saveLocalDraft(updated);
      const supabase = createClient();
      const query = persistedRef.current
        ? supabase.from("letters").update(letterToRow(updated)).eq("id", updated.id)
        : supabase.from("letters").upsert({
            id: updated.id,
            user_id: newLetterUserId!,
            ...letterToRow(updated)
          }, { onConflict: "id" });
      const { data, error } = await query.select("updated_at").single();
      if (error) {
        setSaveState("local-only");
      } else {
        if (!persistedRef.current) {
          persistedRef.current = true;
          window.history.replaceState(window.history.state, "", `/letters/${updated.id}`);
        }
        saveLocalDraft({ ...updated, updatedAt: data.updated_at });
        setSaveState("saved");
        if (revisionRef.current === savingRevision) setHasChanges(false);
      }
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [letter, loaded, hasChanges, newLetterUserId]);

  const update = <K extends keyof LetterDocument>(
    key: K,
    value: LetterDocument[K]
  ) => {
    revisionRef.current += 1;
    setHasChanges(true);
    setLetter((current) => ({ ...current, [key]: value }));
  };

  const changeLetterType = (nextType: LetterType) => {
    revisionRef.current += 1;
    setHasChanges(true);
    setLetter((current) => {
      if (nextType === current.letterType) return current;
      const currentTypeData = current.typeData ?? {};
      const contentByType = {
        ...(currentTypeData.contentByType ?? {}),
        [current.letterType]: contentSnapshot(current)
      };
      const stored = contentByType[nextType];
      const emptyForType: LetterContentSnapshot = {
        departmentHeading: nextType === "receipt" ? "" : initialLetter.departmentHeading,
        sender: nextType === "government_letter" ? initialLetter.sender : { lines: [] },
        recipient: nextType === "government_letter" ? initialLetter.recipient : { lines: [] },
        fileNumber: "",
        date: initialLetter.date,
        salutation: nextType === "government_letter" ? initialLetter.salutation : "",
        subject: "",
        references: [],
        body: "",
        signature: nextType === "receipt" ? { closing: "", lines: [] } : initialLetter.signature
      };

      return {
        ...current,
        ...(stored ?? emptyForType),
        letterType: nextType,
        typeData: {
          ...currentTypeData,
          presidingOfficer: currentTypeData.presidingOfficer || initialLetter.sender.lines[0] || "",
          receiptTitle: currentTypeData.receiptTitle || "இரசீது",
          contentByType
        }
      };
    });
  };

  const updateGovernmentContent = (blocks: GovernmentContentBlock[]) => {
    revisionRef.current += 1;
    setHasChanges(true);
    setLetter((current) => ({
      ...current,
      body: bodyTextFromBlocks(blocks),
      typeData: { ...current.typeData, governmentContentBlocks: blocks }
    }));
  };

  const updateReference = (index: number, value: string) => {
    revisionRef.current += 1;
    setHasChanges(true);
    setLetter((current) => {
      const references = [...current.references];
      references[index] = value;
      return { ...current, references };
    });
  };

  const addReference = () => {
    revisionRef.current += 1;
    setHasChanges(true);
    setLetter((current) => ({
      ...current,
      references: [...current.references, ""]
    }));
  };

  const removeReference = (index: number) => {
    revisionRef.current += 1;
    setHasChanges(true);
    setLetter((current) => ({
      ...current,
      references: current.references.filter((_, itemIndex) => itemIndex !== index)
    }));
  };

  const moveReference = (index: number, direction: -1 | 1) => {
    revisionRef.current += 1;
    setHasChanges(true);
    setLetter((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.references.length) {
        return current;
      }

      const references = [...current.references];
      [references[index], references[nextIndex]] = [
        references[nextIndex],
        references[index]
      ];

      return { ...current, references };
    });
  };

  const resetLetter = () => {
    const ok = window.confirm(
      "தற்போதைய வரைவு அழிக்கப்பட்டு புதிய கடிதம் தொடங்கப்படும். தொடரவா?"
    );

    if (!ok) return;

    clearLocalDraft(letter.id);
    window.location.href = "/letters/new";
  };

  const updatedLabel = useMemo(() => {
    if (!persistedRef.current && !hasChanges) return "மாற்றம் செய்ததும் சேமிக்கப்படும்";
    if (saveState === "saving") return "சேமிக்கிறது…";
    if (saveState === "local-only") return "உள்ளூரில் சேமிக்கப்பட்டது — கிளவுட் கிடைக்கவில்லை";
    return "கிளவுடில் சேமிக்கப்பட்டது ✓";
  }, [saveState, hasChanges]);

  return (
    <main className="app">
      <header className="topbar no-print">
        <div>
          <div className="brand">தமிழ் அரசு கடிதம்</div>
          <div className="brand-subtitle">Government Letter Tool</div>
        </div>

        <div className="topbar-actions">
          <span className="autosave-state">{updatedLabel}</span>
          <button className="button button-secondary" onClick={resetLetter}>
            + புதிய கடிதம்
          </button>
          {letter.letterType === "government_letter" ? <SaveAsTemplateButton letter={letter} /> : null}
          <button className="button button-primary" onClick={() => window.print()}>
            அச்சிடு / PDF
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className="editor-panel no-print">
          <div className="editor-intro">
            <h1>கடித விவரங்கள்</h1>
            <p>
              இடப்பக்கத்தில் மாற்றும் தகவல் வலப்பக்க A4 கடிதத்தில் உடனடியாக
              தோன்றும்.
            </p>
          </div>

          <div className="section-card letter-type-selector">
            <Field label="ஆவண வகை">
              <select value={letter.letterType} onChange={(event) => changeLetterType(event.target.value as LetterType)}>
                {LETTER_TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
            <p>{LETTER_TYPE_OPTIONS.find((option) => option.value === letter.letterType)?.description}</p>
          </div>

          {letter.letterType === "government_letter" ? <>

          <div className="section-card">
            <h2>தலைப்பு மற்றும் அனுப்புநர்</h2>

            <Field label="துறை தலைப்பு">
              <input
                id="letter-department-heading"
                value={letter.departmentHeading}
                onChange={(event) =>
                  update("departmentHeading", event.target.value)
                }
              />
            </Field>
            <TextTransformActions
              field="department_heading"
              currentText={letter.departmentHeading}
              supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil"]}
              aiConfigured={aiConfigured}
              context={{ department: letter.departmentHeading }}
              dictationTargetId="letter-department-heading"
              onAccept={(text) => update("departmentHeading", text)}
            />

            <Field
              label="அனுப்புநர்"
              hint="ஒவ்வொரு வரியையும் தனி வரியில் உள்ளிடவும்"
            >
              <textarea
                id="letter-sender"
                rows={5}
                value={linesTextarea(letter.sender.lines)}
                onChange={(event) =>
                  update("sender", { lines: textareaLines(event.target.value) })
                }
              />
            </Field>
            <TextTransformActions
              field="sender"
              currentText={linesTextarea(letter.sender.lines)}
              supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil"]}
              aiConfigured={aiConfigured}
              context={{ department: letter.departmentHeading }}
              dictationTargetId="letter-sender"
              onAccept={(text) => update("sender", { lines: textareaLines(text) })}
            />
          </div>

          <div className="section-card">
            <h2>பெறுநர்</h2>
            <Field
              label="பெறுநர்"
              hint="ஒவ்வொரு வரியையும் தனி வரியில் உள்ளிடவும்"
            >
              <textarea
                id="letter-recipient"
                rows={4}
                value={linesTextarea(letter.recipient.lines)}
                onChange={(event) =>
                  update("recipient", { lines: textareaLines(event.target.value) })
                }
              />
            </Field>
            <TextTransformActions
              field="recipient"
              currentText={linesTextarea(letter.recipient.lines)}
              supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil"]}
              aiConfigured={aiConfigured}
              context={{ department: letter.departmentHeading }}
              dictationTargetId="letter-recipient"
              onAccept={(text) => update("recipient", { lines: textareaLines(text) })}
            />
          </div>

          <div className="section-card two-field-grid">
            <Field label="ந.க.எண்">
              <input
                value={letter.fileNumber}
                onChange={(event) => update("fileNumber", event.target.value)}
              />
            </Field>

            <Field label="நாள்">
              <input
                value={letter.date}
                onChange={(event) => update("date", event.target.value)}
                placeholder="DD-MM-YYYY"
              />
            </Field>
          </div>

          <div className="section-card">
            <Field label="கடித நிலை">
              <select value={letter.status} onChange={(event) => update("status", event.target.value as LetterDocument["status"])}>
                <option value="draft">வரைவு</option>
                <option value="completed">முடிந்தது</option>
              </select>
            </Field>
          </div>

          <div className="section-card">
            <h2>கடித உள்ளடக்கம்</h2>

            <Field label="விளிப்பு">
              <input
                id="letter-salutation"
                value={letter.salutation}
                onChange={(event) => update("salutation", event.target.value)}
              />
            </Field>
            <TextTransformActions
              field="salutation"
              currentText={letter.salutation}
              supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil"]}
              aiConfigured={aiConfigured}
              dictationTargetId="letter-salutation"
              onAccept={(text) => update("salutation", text)}
            />

            <Field label="பொருள்">
              <textarea
                id="letter-subject"
                rows={3}
                value={letter.subject}
                onChange={(event) => update("subject", event.target.value)}
              />
            </Field>
            <TextTransformActions
              field="subject"
              currentText={letter.subject}
              supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil"]}
              aiConfigured={aiConfigured}
              dictationTargetId="letter-subject"
              onAccept={(text) => update("subject", text)}
            />

            <div className="reference-editor">
              <div className="reference-header">
                <div>
                  <div className="field__label">பார்வை</div>
                  <div className="field__hint">
                    பல குறிப்புகளை சேர்த்து வரிசை மாற்றலாம்
                  </div>
                </div>
                <button
                  type="button"
                  className="mini-button"
                  onClick={addReference}
                >
                  + சேர்க்க
                </button>
              </div>

              {letter.references.map((reference, index) => (
                <div className="reference-editor-row" key={index}>
                  <div className="reference-number">{index + 1}</div>
                  <div className="reference-input">
                    <textarea
                      id={`letter-reference-${index}`}
                      rows={2}
                      value={reference}
                      onChange={(event) =>
                        updateReference(index, event.target.value)
                      }
                    />
                    <TextTransformActions
                      field="reference"
                      currentText={reference}
                      supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil"]}
                      aiConfigured={aiConfigured}
                      dictationTargetId={`letter-reference-${index}`}
                      onAccept={(text) => updateReference(index, text)}
                    />
                  </div>
                  <div className="reference-actions">
                    <button
                      type="button"
                      title="மேலே"
                      onClick={() => moveReference(index, -1)}
                      disabled={index === 0}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      title="கீழே"
                      onClick={() => moveReference(index, 1)}
                      disabled={index === letter.references.length - 1}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      title="நீக்கு"
                      onClick={() => removeReference(index)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <GovernmentContentEditor
              blocks={contentBlocksOrLegacy(letter.typeData.governmentContentBlocks, letter.body)}
              onChange={updateGovernmentContent}
              aiConfigured={aiConfigured}
              subject={letter.subject}
              department={letter.departmentHeading}
            />
          </div>

          <div className="section-card">
            <h2>கையொப்ப பகுதி</h2>

            <Field label="முடிப்பு">
              <input
                id="letter-signature-closing"
                value={letter.signature.closing}
                onChange={(event) =>
                  update("signature", {
                    ...letter.signature,
                    closing: event.target.value
                  })
                }
              />
            </Field>
            <TextTransformActions
              field="signature"
              currentText={letter.signature.closing}
              supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil"]}
              aiConfigured={aiConfigured}
              dictationTargetId="letter-signature-closing"
              onAccept={(text) => update("signature", { ...letter.signature, closing: text })}
            />

            <Field
              label="பதவி / அலுவலகம்"
              hint="ஒவ்வொரு வரியையும் தனி வரியில் உள்ளிடவும்"
            >
              <textarea
                id="letter-signature-lines"
                rows={4}
                value={linesTextarea(letter.signature.lines)}
                onChange={(event) =>
                  update("signature", {
                    ...letter.signature,
                    lines: textareaLines(event.target.value)
                  })
                }
              />
            </Field>
            <TextTransformActions
              field="signature"
              currentText={linesTextarea(letter.signature.lines)}
              supportedActions={["transliterate_tanglish", "translate_en_ta", "formal_tamil"]}
              aiConfigured={aiConfigured}
              context={{ department: letter.departmentHeading }}
              dictationTargetId="letter-signature-lines"
              onAccept={(text) => update("signature", { ...letter.signature, lines: textareaLines(text) })}
            />
          </div>

          </> : <SpecialLetterFields letter={letter} update={update} aiConfigured={aiConfigured} />}

          <CopyFieldsEditor letter={letter} update={update} aiConfigured={aiConfigured} />

        </aside>

        <section className="preview-column">
          <div className="preview-toolbar no-print">
            <label className="format-checkbox preview-bold-control">
              <input
                type="checkbox"
                checked={letter.boldHeaders}
                onChange={(event) => update("boldHeaders", event.target.checked)}
              />
              <span>தடித்த தலைப்புகள்</span>
            </label>
            <label className="font-size-control">
              <span>எழுத்தளவு</span>
              <span aria-hidden="true">A−</span>
              <input
                type="range"
                min="-2"
                max="2"
                step="1"
                value={letter.fontSizeStep}
                onChange={(event) => update("fontSizeStep", Number(event.target.value) as LetterDocument["fontSizeStep"])}
                aria-label="கடித எழுத்தளவு"
              />
              <span aria-hidden="true">A+</span>
              <output>{letter.fontSizeStep > 0 ? `+${letter.fontSizeStep}` : letter.fontSizeStep}</output>
            </label>
          </div>

          <div className="preview-title no-print">
            <strong>A4 முன்னோட்டம்</strong>
            <span>210 × 297 mm</span>
          </div>

          <LetterPreview letter={letter} />
        </section>
      </div>
    </main>
  );
}
