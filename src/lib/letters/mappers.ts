import type { AddressBlock, LetterDocument, LetterFontSizeStep, LetterType, LetterTypeData, SignatureBlock } from "@/models/letter";

export interface LetterRow {
  id: string;
  status: "draft" | "completed";
  letter_type: LetterType;
  type_data: LetterTypeData;
  bold_headers: boolean;
  font_size_step: number;
  file_number: string;
  letter_date: string;
  department_heading: string;
  sender: AddressBlock;
  recipient: AddressBlock;
  salutation: string;
  subject: string;
  references: string[];
  body: string;
  signature: SignatureBlock;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export function rowToLetter(row: LetterRow): LetterDocument {
  return {
    id: row.id,
    status: row.status === "completed" ? "completed" : "draft",
    letterType: (["government_letter", "financial_sanction", "receipt", "proceedings"] as string[]).includes(row.letter_type)
      ? row.letter_type
      : "government_letter",
    typeData: row.type_data ?? {},
    boldHeaders: row.bold_headers ?? true,
    fontSizeStep: ([-2, -1, 0, 1, 2].includes(row.font_size_step) ? row.font_size_step : 0) as LetterFontSizeStep,
    fileNumber: row.file_number ?? "",
    date: row.letter_date ?? "",
    departmentHeading: row.department_heading ?? "",
    sender: row.sender?.lines ? row.sender : { lines: [] },
    recipient: row.recipient?.lines ? row.recipient : { lines: [] },
    salutation: row.salutation ?? "",
    subject: row.subject ?? "",
    references: Array.isArray(row.references) ? row.references : [],
    body: row.body ?? "",
    signature: row.signature?.lines ? row.signature : { closing: "", lines: [] },
    updatedAt: row.updated_at ?? new Date(0).toISOString()
  };
}

export function letterToRow(letter: LetterDocument) {
  return {
    status: letter.status,
    letter_type: letter.letterType,
    type_data: letter.typeData,
    bold_headers: letter.boldHeaders,
    font_size_step: letter.fontSizeStep,
    file_number: letter.fileNumber,
    letter_date: letter.date,
    department_heading: letter.departmentHeading,
    sender: letter.sender,
    recipient: letter.recipient,
    salutation: letter.salutation,
    subject: letter.subject,
    references: letter.references,
    body: letter.body,
    signature: letter.signature,
    completed_at: letter.status === "completed" ? new Date().toISOString() : null
  };
}
