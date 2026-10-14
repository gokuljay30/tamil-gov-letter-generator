import assert from "node:assert/strict";
import test from "node:test";
import { bodyTextFromBlocks, contentBlocksOrLegacy, createTableBlock } from "../src/lib/letters/governmentContent.ts";

test("converts a legacy letter body into its first text block", () => {
  assert.deepEqual(contentBlocksOrLegacy(undefined, "Existing body"), [{ id: "legacy-body", type: "text", text: "Existing body" }]);
});

test("creates a default two by two table with a header", () => {
  assert.deepEqual(createTableBlock("table-1", 2, 2), {
    id: "table-1", type: "table", headerRow: true, cells: [["", ""], ["", ""]]
  });
});

test("keeps searchable body text from all text blocks", () => {
  assert.equal(bodyTextFromBlocks([
    { id: "a", type: "text", text: "First" },
    { id: "t", type: "table", headerRow: true, cells: [["Heading"]] },
    { id: "b", type: "text", text: "Second" }
  ]), "First\n\nSecond");
});
