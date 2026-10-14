import type { LetterType } from "@/models/letter";

export const LETTER_TYPE_OPTIONS: ReadonlyArray<{ value: LetterType; label: string; description: string }> = [
  { value: "government_letter", label: "அரசு கடிதம்", description: "அனுப்புநர், பெறுநர், பொருள் மற்றும் பார்வையுடன் கூடிய அரசு கடிதம்" },
  { value: "financial_sanction", label: "நிதி இசைவாணை", description: "அலுவலகச் செலவின நிதி இசைவு / செயலாணை" },
  { value: "receipt", label: "இரசீது", description: "தொகை அல்லது பொருள் பெற்றுக்கொண்டதற்கான இரசீது" },
  { value: "proceedings", label: "செயல்முறை ஆணை", description: "அலுவலகத் தலைப்பு, பொருள், பார்வை மற்றும் ஆணை விவரங்களுடன் கூடிய செயல்முறை ஆணை" }
];

export function letterTypeLabel(type: LetterType) {
  return LETTER_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? "அரசு கடிதம்";
}
