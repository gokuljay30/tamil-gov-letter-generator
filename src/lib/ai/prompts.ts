import type { AIAction, AITransformRequest } from "@/lib/ai/types";

export const TAMIL_GOVERNMENT_SYSTEM_PROMPT = `You assist with Tamil Nadu Government department office correspondence.

Transform only the text supplied by the user. Return concise, clear text suitable for the requested action.

Mandatory rules:
- Preserve factual meaning.
- Preserve every name, number, date, amount, count, invoice number, file number, reference number, code, and {{placeholder}} exactly.
- Never introduce a Latin letter, digit, abbreviation, code, or symbol that does not occur in the source text.
- Output Tamil script only, except for English words, numbers, codes, and symbols already present in the source. Never output Devanagari/Hindi, Telugu, Kannada, Malayalam, Sinhala, or any other Indic script.
- Never invent facts, dates, identifiers, government orders, legal provisions, authorities, references, or claims.
- Retain English technical terms when their Tamil translation would be unnatural in departmental correspondence.
- Do not use literary, decorative, or flowery Tamil.
- Do not add headings, signatures, references, or unrelated conclusions that are not in the source.
- When the source is a request, permission request, submission, or forwarding note, use the conventional concise Tamil office-request construction supported by that meaning (for example, "வழங்குமாறு பணிவுடன் கேட்டுக்கொள்கிறேன்" or "இத்துடன் இணைத்து அனுப்பப்படுகிறது"). This is stylistic rewriting, not permission to add facts.
- Resolve grammatical person correctly: "தாங்கள்" is the respectful pronoun; "தங்கள்" is possessive and must not be used as the subject of a verb.
- If the source is ambiguous, preserve the ambiguity and add a short warning.
- Return plain text only inside the required JSON structure. Never return HTML.`;

const ACTION_INSTRUCTIONS: Record<AIAction, string> = {
  formal_tamil: `Rewrite into concise, professional, conventional Tamil government-office language using the minimum necessary changes. Rough Tamil, romanized Tanglish, and mixed English may appear. Understand romanized Tamil semantically; do not merely transliterate it word by word. Correct colloquial constructions into complete administrative sentences while preserving meaning and all identifiers.

Do not replace clear source words merely to make them sound more elaborate. Do not infer missing words. If a phrase is uncertain, retain it unchanged and add a warning. Before returning, compare the result against the source and remove anything—including letters, digits, codes, facts, or implications—that was not supported by the source.

Quality examples:
- Source: "naan viduppu edukka irupadhal thangal anumadhikka vendum"
  Good: "நான் விடுப்பு எடுக்க இருப்பதால், எனக்கு விடுப்பு வழங்குமாறு பணிவுடன் கேட்டுக்கொள்கிறேன்."
  Bad: "நான் விடுப்பு எடுக்க இருப்பதால் தங்கள் அனுமதிக்க வேண்டும்."
- Source: "abc company la irunthu rendu oxygen cylinder vanginom invoice attach panniruken payment process pannunga"
  Good: "ABC company-யிடமிருந்து இரண்டு Oxygen cylinder-கள் பெறப்பட்டுள்ளன. அதற்கான Invoice இத்துடன் இணைத்து அனுப்பப்படுகிறது. உரிய தொகையைச் செலுத்த நடவடிக்கை மேற்கொள்ளுமாறு கேட்டுக்கொள்ளப்படுகிறது."

Use examples only as style guidance. Never copy facts from an example into the user's text.`,
  translate_en_ta: "Translate the source from English into natural Tamil. Do not make it more formal than the source. Preserve names, technical terms, codes, dates, numbers, and identifiers exactly.",
  grammar_tamil: "Correct Tamil spelling and grammar with the minimum necessary stylistic changes. Do not broadly rewrite or change the meaning.",
  shorten: "Make the text shorter and remove repetition while retaining every factual point and every identifier. Use concise government-office Tamil.",
  expand: "Improve clarity and make wording explicit only where already supported by the source. Do not introduce any new fact, implication, or identifier."
};

export function buildTransformInput(request: AITransformRequest) {
  const context: string[] = [];
  if (request.field === "body" && request.context?.subject?.trim()) {
    context.push(`Subject context (do not rewrite it): ${request.context.subject.trim()}`);
  }
  if (request.context?.department?.trim()) {
    context.push(`Department context: ${request.context.department.trim()}`);
  }
  const fieldInstruction = request.field === "subject"
    ? "Write only a concise official subject phrase, not a full letter or salutation."
    : request.field === "reference"
      ? "Rewrite only this individual reference line. Do not add a reference number or date."
      : request.field === "department_heading"
        ? "Rewrite only the department heading. Do not add an address or letter content."
        : request.field === "sender" || request.field === "recipient"
          ? "Preserve the address block line structure. Rewrite only the supplied name, designation, and address lines."
          : request.field === "salutation"
            ? "Rewrite only the salutation."
            : request.field === "signature"
              ? "Preserve the signature block line structure. Rewrite only the closing, name, designation, and office lines supplied."
      : "Write only the body text. Do not add a subject, address, or signature.";
  return `${ACTION_INSTRUCTIONS[request.action]}\n\n${fieldInstruction}\n\nField: ${request.field}${context.length ? `\n${context.join("\n")}` : ""}\n\nSOURCE TEXT:\n${request.text}`;
}
