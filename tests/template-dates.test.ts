import assert from "node:assert/strict";
import test from "node:test";
import { inclusiveDateCount } from "../src/lib/templates/dates.ts";

test("counts a single leave date as one day", () => {
  assert.equal(inclusiveDateCount("2026-08-14", "2026-08-14"), "1");
});

test("counts leave start and end dates inclusively", () => {
  assert.equal(inclusiveDateCount("2026-08-14", "2026-08-18"), "5");
});

test("does not calculate an invalid reversed date range", () => {
  assert.equal(inclusiveDateCount("2026-08-18", "2026-08-14"), null);
});
