import assert from "node:assert/strict";
import test from "node:test";
import { normalizeDictationPunctuation, withoutTerminalFullStop } from "../src/lib/text/punctuation.ts";

test("removes a generated full stop from a table-cell value", () => {
  assert.equal(withoutTerminalFullStop("கால்நடை மருத்துவர்."), "கால்நடை மருத்துவர்");
});

test("removes a full stop from one-word dictation", () => {
  assert.equal(normalizeDictationPunctuation("அனுமதி."), "அனுமதி");
});

test("keeps a full stop for sentence dictation", () => {
  assert.equal(normalizeDictationPunctuation("விடுப்பு வழங்குமாறு கேட்டுக்கொள்கிறேன்."), "விடுப்பு வழங்குமாறு கேட்டுக்கொள்கிறேன்.");
});

test("removes a full stop from a phrase inserted inside a sentence", () => {
  assert.equal(normalizeDictationPunctuation("மீண்டும் பணிவுடன்.", true), "மீண்டும் பணிவுடன்");
});
