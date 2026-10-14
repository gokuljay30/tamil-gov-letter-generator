import type { AddressBlock, SignatureBlock } from "@/models/letter";

export type TemplateVariableType = "text" | "date" | "number" | "textarea";

export interface TemplateVariable {
  key: string;
  label: string;
  type: TemplateVariableType;
  required: boolean;
  defaultValue: string;
}

export interface LetterTemplate {
  id: string;
  userId: string;
  templateKey: string | null;
  name: string;
  category: string;
  description: string;
  departmentHeading: string;
  sender: AddressBlock;
  recipient: AddressBlock;
  salutation: string;
  subject: string;
  references: string[];
  body: string;
  signature: SignatureBlock;
  variables: TemplateVariable[];
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string | null;
}

