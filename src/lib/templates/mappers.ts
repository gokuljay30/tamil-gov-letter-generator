import type { AddressBlock, SignatureBlock } from "@/models/letter";
import type { LetterTemplate, TemplateVariable } from "@/models/template";

export interface TemplateRow {
  id: string;
  user_id: string;
  template_key: string | null;
  name: string;
  category: string | null;
  description: string | null;
  department_heading: string | null;
  sender: AddressBlock | null;
  recipient: AddressBlock | null;
  salutation: string | null;
  subject: string | null;
  references: string[] | null;
  body: string | null;
  signature: SignatureBlock | null;
  variables: TemplateVariable[] | null;
  created_at: string;
  updated_at: string;
  last_used_at: string | null;
}

const emptyAddress = (): AddressBlock => ({ lines: [] });
const emptySignature = (): SignatureBlock => ({ closing: "", lines: [] });

export function rowToTemplate(row: TemplateRow): LetterTemplate {
  return {
    id: row.id,
    userId: row.user_id,
    templateKey: row.template_key ?? null,
    name: row.name,
    category: row.category ?? "",
    description: row.description ?? "",
    departmentHeading: row.department_heading ?? "",
    sender: row.sender?.lines ? row.sender : emptyAddress(),
    recipient: row.recipient?.lines ? row.recipient : emptyAddress(),
    salutation: row.salutation ?? "",
    subject: row.subject ?? "",
    references: Array.isArray(row.references) ? row.references : [],
    body: row.body ?? "",
    signature: row.signature?.lines ? row.signature : emptySignature(),
    variables: Array.isArray(row.variables) ? row.variables : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastUsedAt: row.last_used_at ?? null
  };
}

export function templateToRow(template: LetterTemplate) {
  return {
    name: template.name,
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
  };
}

