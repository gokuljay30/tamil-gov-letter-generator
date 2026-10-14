import type { AddressBlock, SignatureBlock } from "@/models/letter";
import type { LetterTemplate } from "@/models/template";

export type TemplateValues = Record<string, string>;

export function replacePlaceholders(value: string, values: TemplateValues) {
  return value.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (placeholder, key: string) => {
    const replacement = values[key]?.trim();
    return replacement ? replacement : placeholder;
  });
}

function replaceAddress(block: AddressBlock, values: TemplateValues): AddressBlock {
  return { lines: block.lines.map((line) => replacePlaceholders(line, values)) };
}

function replaceSignature(block: SignatureBlock, values: TemplateValues): SignatureBlock {
  return {
    closing: replacePlaceholders(block.closing, values),
    lines: block.lines.map((line) => replacePlaceholders(line, values))
  };
}

export function applyTemplateValues(template: LetterTemplate, values: TemplateValues) {
  return {
    department_heading: replacePlaceholders(template.departmentHeading, values),
    sender: replaceAddress(template.sender, values),
    recipient: replaceAddress(template.recipient, values),
    salutation: replacePlaceholders(template.salutation, values),
    subject: replacePlaceholders(template.subject, values),
    references: template.references.map((item) => replacePlaceholders(item, values)),
    body: replacePlaceholders(template.body, values),
    signature: replaceSignature(template.signature, values)
  };
}

