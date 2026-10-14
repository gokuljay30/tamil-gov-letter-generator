const TERMINAL_FULL_STOP = /[.\u0964\u3002]+$/u;

export function withoutTerminalFullStop(text: string) {
  return text.trimEnd().replace(TERMINAL_FULL_STOP, "");
}

export function normalizeDictationPunctuation(text: string, fragment = false) {
  const wordCount = text.trim().split(/\s+/u).filter(Boolean).length;
  return fragment || wordCount <= 1 ? withoutTerminalFullStop(text) : text;
}
