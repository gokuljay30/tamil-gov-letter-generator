import assert from "node:assert/strict";
import test from "node:test";
import { containsForeignIndicScript, extractIdentifiers, findIntroducedIdentifiers, findMissingIdentifiers, validateTransform } from "../src/lib/ai/validation.ts";

test("extracts government identifiers, dates, amounts, and placeholders", () => {
  const text = "4521/B/DEPT/2025 நாள் 30-12-2025 தொகை ₹12,500 invoice INV-8392 {{invoice_number}} {{amount}}";
  const identifiers = extractIdentifiers(text);
  for (const expected of ["4521/B/DEPT/2025", "30-12-2025", "₹12,500", "INV-8392", "{{invoice_number}}", "{{amount}}"] ) {
    assert.ok(identifiers.includes(expected), `missing ${expected}`);
  }
});

test("flags missing identifiers without blocking review", () => {
  const original = "குறிப்பு 23/2025 நாள் 30-12-2025";
  const result = validateTransform(original, { text: "குறிப்பு 23/2025", warnings: [] });
  assert.deepEqual(findMissingIdentifiers(original, result.text).includes("30-12-2025"), true);
  assert.ok(result.warnings.some((warning) => warning.includes("சரிபார்க்கவும்")));
});

test("accepts output when exact identifiers are retained", () => {
  const original = "INV-8392 ₹12,500 {{amount}}";
  assert.deepEqual(findMissingIdentifiers(original, `குறிப்பு ${original}`), []);
});

test("flags an invented mixed letter-number code", () => {
  const original = "மகனின் திருமண விழாவிற்காக விடுப்பு கோருகிறேன்.";
  const transformed = "மகனின் திருமண விழாவிற்காக 3RC விடுப்பு கோருகிறேன்.";
  assert.deepEqual(findIntroducedIdentifiers(original, transformed), ["3RC"]);
  const result = validateTransform(original, { text: transformed, warnings: [] });
  assert.ok(result.warnings.some((warning) => warning.includes("3RC")));
  assert.ok(result.warnings.some((warning) => warning.includes("சரிபார்க்கவும்")));
  assert.ok(result.warnings.every((warning) => !warning.includes("ஏற்க வேண்டாம்")));
});

test("flags Devanagari characters in Tamil output", () => {
  const output = "விடுப்பு வழங்குமாறு अनुरोधிக்கிறேன்.";
  assert.equal(containsForeignIndicScript(output), true);
  const result = validateTransform("விடுப்பு வழங்குமாறு கேட்டுக்கொள்கிறேன்.", { text: output, warnings: [] });
  assert.ok(result.warnings.some((warning) => warning.includes("தமிழ் அல்லாத")));
});

test("allows Tamil with source-preserved English", () => {
  assert.equal(containsForeignIndicScript("Invoice இணைக்கப்பட்டுள்ளது."), false);
});
