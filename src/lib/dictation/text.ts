export function appendTranscript(currentText: string, transcript: string): string {
  const cleanedTranscript = transcript.trim();
  if (!cleanedTranscript) return currentText;
  if (!currentText.trim()) return cleanedTranscript;
  return `${currentText.trimEnd()} ${cleanedTranscript}`;
}

export function insertTranscript(currentText: string, transcript: string, selection?: { start: number; end: number }): string {
  const cleanedTranscript = transcript.trim();
  if (!cleanedTranscript) return currentText;
  if (!selection) return appendTranscript(currentText, cleanedTranscript);

  const start = Math.max(0, Math.min(selection.start, currentText.length));
  const end = Math.max(start, Math.min(selection.end, currentText.length));
  const before = currentText.slice(0, start);
  const after = currentText.slice(end);
  const beforeSpace = before && !/\s$/.test(before) ? " " : "";
  const afterSpace = after && !/^\s/.test(after) ? " " : "";
  return `${before}${beforeSpace}${cleanedTranscript}${afterSpace}${after}`;
}
