import assert from "node:assert/strict";
import test from "node:test";
import { LocalTamilTransliterationProvider } from "../src/lib/transliteration/tamil.ts";

test("transliterates common veterinary-office Tanglish locally", async () => {
  const provider = new LocalTamilTransliterationProvider();
  assert.equal(await provider.transliterate("kaalnadai maruthuvamanai"), "கால்நடை மருத்துவமனை");
  assert.equal(await provider.transliterate("kaalnadai maruthuva udhavi iyakkunar"), "கால்நடை மருத்துவ உதவி இயக்குநர்");
  assert.equal(
    await provider.transliterate("naan viduppu edukka irupadhal thangal anumadhikka vendum"),
    "நான் விடுப்பு எடுக்க இருப்பதால் தாங்கள் அனுமதிக்க வேண்டும்"
  );
});

test("transliteration preserves identifiers and template variables", async () => {
  const provider = new LocalTamilTransliterationProvider();
  const identifiers = "4521/B/DEPT/2025 30-12-2025 ₹12,500 INV-8392 {{invoice_number}} {{amount}}";
  const result = await provider.transliterate(`kaalnadai ${identifiers}`);
  for (const identifier of identifiers.split(" ")) assert.ok(result.includes(identifier), `changed ${identifier}`);
});

test("uses capital N for the Tamil three-loop letter", async () => {
  const provider = new LocalTamilTransliterationProvider();
  assert.equal(await provider.transliterate("peN"), "பெண்");
});

test("uses nh for the Tamil dental na letter", async () => {
  const provider = new LocalTamilTransliterationProvider();
  assert.equal(await provider.transliterate("nha"), "ந");
  assert.equal(await provider.transliterate("nhaa"), "நா");
  assert.equal(await provider.transliterate("nhii"), "நீ");
});
