export type LetterStatus = "draft" | "completed";
export type LetterFontSizeStep = -2 | -1 | 0 | 1 | 2;
export type LetterType = "government_letter" | "financial_sanction" | "receipt" | "proceedings";

export interface AddressBlock {
  lines: string[];
}

export interface SignatureBlock {
  closing: string;
  lines: string[];
}

export interface LetterTypeData {
  presidingOfficer?: string;
  accountHeadLines?: string[];
  copyToLines?: string[];
  submittedCopyToLines?: string[];
  receiptTitle?: string;
  receiptSignature?: string;
  receiptName?: string;
  receiptAddress?: string;
  contentByType?: Partial<Record<LetterType, LetterContentSnapshot>>;
  governmentContentBlocks?: GovernmentContentBlock[];
}

export interface GovernmentTextBlock {
  id: string;
  type: "text";
  text: string;
}

export interface GovernmentTableBlock {
  id: string;
  type: "table";
  headerRow: boolean;
  headerBold?: boolean;
  headerAlignments?: Array<"left" | "center" | "right">;
  columnAlignments?: Array<"left" | "center" | "right">;
  columnWidths?: number[];
  cellPadding?: "compact" | "normal" | "wide";
  cells: string[][];
}

export type GovernmentContentBlock = GovernmentTextBlock | GovernmentTableBlock;

export interface LetterContentSnapshot {
  departmentHeading: string;
  sender: AddressBlock;
  recipient: AddressBlock;
  fileNumber: string;
  date: string;
  salutation: string;
  subject: string;
  references: string[];
  body: string;
  signature: SignatureBlock;
}

export interface LetterDocument {
  id: string;
  status: LetterStatus;
  letterType: LetterType;
  typeData: LetterTypeData;
  boldHeaders: boolean;
  fontSizeStep: LetterFontSizeStep;
  departmentHeading: string;
  sender: AddressBlock;
  recipient: AddressBlock;
  fileNumber: string;
  date: string;
  salutation: string;
  subject: string;
  references: string[];
  body: string;
  signature: SignatureBlock;
  updatedAt: string;
}
