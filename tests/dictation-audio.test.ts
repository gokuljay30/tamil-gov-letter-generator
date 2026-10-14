import assert from "node:assert/strict";
import test from "node:test";
import { isAllowedAudioType } from "../src/lib/dictation/audio.ts";

test("accepts browser WebM MIME type with codec parameters", () => {
  assert.equal(isAllowedAudioType("audio/webm;codecs=opus"), true);
});

test("rejects non-audio uploads", () => {
  assert.equal(isAllowedAudioType("text/plain"), false);
});
