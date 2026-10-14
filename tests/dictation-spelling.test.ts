import assert from "node:assert/strict";
import test from "node:test";
import { isSpellingOnlyCorrection } from "../src/lib/dictation/spelling.ts";

test("allows a small spelling correction within the same word", () => {
  assert.equal(
    isSpellingOnlyCorrection("அலுவலக பனி", "அலுவலக பணி"),
    true
  );
});

test("allows a closely recognized word to receive a two-letter correction", () => {
  assert.equal(
    isSpellingOnlyCorrection("அனிவுடன் கேட்டுக்கொள்கிறேன்", "பணிவுடன் கேட்டுக்கொள்கிறேன்"),
    true
  );
});

test("allows context correction from பணியுடன் to பணிவுடன்", () => {
  assert.equal(
    isSpellingOnlyCorrection(
      "பணியுடன் தெரிவித்துக்கொள்வது யாதெனில்",
      "பணிவுடன் தெரிவித்துக்கொள்வது யாதெனில்"
    ),
    true
  );
});

test("allows Tamil compound spacing and a small inflection correction", () => {
  assert.equal(
    isSpellingOnlyCorrection(
      "பணிவுடன் தெரிவித்துக் கொள்வதே யாதெனில்",
      "பணிவுடன் தெரிவித்துக்கொள்வது யாதெனில்"
    ),
    true
  );
});

test("rejects inserted or removed words", () => {
  assert.equal(
    isSpellingOnlyCorrection("விடுப்பு வேண்டும்", "எனக்கு விடுப்பு வேண்டும்"),
    false
  );
});

test("rejects lexical rewriting", () => {
  assert.equal(
    isSpellingOnlyCorrection("கடிதம் அனுப்பினேன்", "கடிதம் சமர்ப்பிக்கப்பட்டது"),
    false
  );
});
