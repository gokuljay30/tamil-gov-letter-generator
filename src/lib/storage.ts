import type { LetterDocument } from "@/models/letter";
import { createDefaultLetter } from "@/lib/defaultLetter";

const STORAGE_KEY = "tamil-government-letter-tool:draft:v1";

function keyFor(letterId?: string) {
  return letterId ? `${STORAGE_KEY}:${letterId}` : STORAGE_KEY;
}

export function saveLocalDraft(letter: LetterDocument) {
  if (typeof window === "undefined") return;
  localStorage.setItem(keyFor(letter.id), JSON.stringify(letter));
}

export function loadLocalDraft(letterId?: string): LetterDocument | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(keyFor(letterId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LetterDocument>;
    const fallback = createDefaultLetter();
    return {
      ...fallback,
      ...parsed,
      typeData: { ...fallback.typeData, ...(parsed.typeData ?? {}) }
    };
  } catch {
    return null;
  }
}

export function clearLocalDraft(letterId?: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(keyFor(letterId));
}
