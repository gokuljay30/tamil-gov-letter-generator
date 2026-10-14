import assert from "node:assert/strict";
import test from "node:test";
import { appendTranscript, insertTranscript } from "../src/lib/dictation/text.ts";

test("uses the transcript for an empty field", () => {
  assert.equal(appendTranscript("", "  புதிய வாக்கியம்.  "), "புதிய வாக்கியம்.");
});

test("appends a sentence without changing existing content", () => {
  assert.equal(appendTranscript("முதல் வாக்கியம்.\n", "இரண்டாம் வாக்கியம்."), "முதல் வாக்கியம். இரண்டாம் வாக்கியம்.");
});

test("ignores an empty transcript", () => {
  assert.equal(appendTranscript("ஏற்கனவே உள்ளது", "   "), "ஏற்கனவே உள்ளது");
});

test("inserts dictation at the cursor", () => {
  const original = "முதல் மூன்றாம்";
  const cursor = original.indexOf("மூன்றாம்");
  assert.equal(insertTranscript(original, "இரண்டாம்", { start: cursor, end: cursor }), "முதல் இரண்டாம் மூன்றாம்");
});

test("replaces selected text with dictation", () => {
  const original = "தவறான சொல்";
  assert.equal(insertTranscript(original, "சரியான", { start: 0, end: original.indexOf(" சொல்") }), "சரியான சொல்");
});
