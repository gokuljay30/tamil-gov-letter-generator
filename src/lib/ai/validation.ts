import type { AITransformResult } from "@/lib/ai/types";

const IDENTIFIER_PATTERNS = [
  /{{\s*[a-zA-Z0-9_]+\s*}}/g,
  /₹\s?\d[\d,]*(?:\.\d+)?/g,
  /\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/g,
  /\b(?=[A-Za-z0-9/-]*\d)(?=[A-Za-z0-9/-]*[A-Za-z])[A-Za-z0-9]+(?:[/-][A-Za-z0-9]+)+\b/g,
  /\b(?=[A-Za-z0-9-]*\d)(?=[A-Za-z0-9-]*[A-Za-z])[A-Za-z]+-?\d[A-Za-z0-9-]*\b/g,
  /\b(?=[A-Za-z0-9]*\d)(?=[A-Za-z0-9]*[A-Za-z])[A-Za-z0-9]+\b/g,
  /\b\d+(?:\.\d+)?\b/g
];

const FOREIGN_INDIC_SCRIPT = /[\u0900-\u0B7F\u0C00-\u0DFF\u0E80-\u0FFF]/u;

export function containsForeignIndicScript(text: string): boolean {
  return FOREIGN_INDIC_SCRIPT.test(text);
}

export function extractIdentifiers(text: string): string[] {
  const identifiers = new Set<string>();
  for (const pattern of IDENTIFIER_PATTERNS) {
    for (const match of text.matchAll(pattern)) identifiers.add(match[0]);
  }
  return [...identifiers].sort((a, b) => b.length - a.length);
}

export function findMissingIdentifiers(original: string, transformed: string) {
  return extractIdentifiers(original).filter((identifier) => !transformed.includes(identifier));
}

export function findIntroducedIdentifiers(original: string, transformed: string) {
  return extractIdentifiers(transformed).filter((identifier) => !original.includes(identifier));
}

export function validateTransform(original: string, result: AITransformResult): AITransformResult {
  const missingIdentifiers = findMissingIdentifiers(original, result.text);
  const introducedIdentifiers = findIntroducedIdentifiers(original, result.text);
  const warnings = [...result.warnings];
  if (missingIdentifiers.length) {
    warnings.push("முக்கிய எண் அல்லது குறிப்பு மாற்றப்பட்டிருக்கலாம். சரிபார்க்கவும்.");
  }
  if (introducedIdentifiers.length) {
    warnings.push(`மாற்றப்பட்ட உரையில் புதிதாக இடம்பெற்ற எண் அல்லது குறியீடு: ${introducedIdentifiers.join(", ")}. இது சரியானதா என்பதைச் சரிபார்க்கவும்.`);
  }
  if (containsForeignIndicScript(result.text)) {
    warnings.push("தமிழ் அல்லாத இந்திய மொழி எழுத்துகள் சேர்க்கப்பட்டுள்ளன. இந்த மாற்றத்தை ஏற்க வேண்டாம்; மீண்டும் முயற்சிக்கவும்.");
  }
  if (/{{\s*[a-zA-Z0-9_]+\s*}}/.test(result.text)) {
    warnings.push("Placeholder retained");
  }
  return { ...result, warnings: [...new Set(warnings)], missingIdentifiers };
}
