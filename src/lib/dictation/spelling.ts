function editDistance(source: string, candidate: string) {
  const left = Array.from(source);
  const right = Array.from(candidate);
  let previous = [0, ...right.map((_, index) => index + 1)];

  for (let leftIndex = 0; leftIndex < left.length; leftIndex += 1) {
    const current = [leftIndex + 1];
    for (let rightIndex = 0; rightIndex < right.length; rightIndex += 1) {
      current.push(Math.min(
        current[rightIndex] + 1,
        previous[rightIndex + 1] + 1,
        previous[rightIndex] + (left[leftIndex] === right[rightIndex] ? 0 : 1)
      ));
    }
    previous = current;
  }

  return previous[right.length] ?? left.length;
}

export function isSpellingOnlyCorrection(source: string, candidate: string) {
  const sourceWords = source.trim().split(/\s+/u);
  const candidateWords = candidate.trim().split(/\s+/u);
  if (Math.abs(sourceWords.length - candidateWords.length) > 2) return false;

  if (sourceWords.length === candidateWords.length) {
    const wordSafe = sourceWords.every((word, index) => {
      const replacement = candidateWords[index];
      if (word === replacement) return true;
      return editDistance(word, replacement) <= 2;
    });
    if (wordSafe) return true;
  }

  // Tamil compounds and sandhi may legitimately join/split adjacent words.
  // Compare the same phrase without whitespace, while allowing only a very
  // small number of letter/suffix edits so broader rewriting is rejected.
  const compactSource = source.replace(/\s+/gu, "");
  const compactCandidate = candidate.replace(/\s+/gu, "");
  const maximumPhraseEdits = Math.max(2, Math.ceil(Array.from(compactSource).length * 0.035));
  return editDistance(compactSource, compactCandidate) <= maximumPhraseEdits;
}
