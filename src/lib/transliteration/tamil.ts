import { transliterate } from "@piraisoodan/tanglish";
import type { TransliterationProvider } from "@/lib/transliteration/provider";

const OFFICE_TERMS: Record<string, string> = {
  kaalnadai: "கால்நடை",
  maruthuva: "மருத்துவ",
  maruthuvamanai: "மருத்துவமனை",
  udhavi: "உதவி",
  uthavi: "உதவி",
  iyakkunar: "இயக்குநர்",
  kaditham: "கடிதம்",
  anuppunar: "அனுப்புநர்",
  perunar: "பெறுநர்",
  viduppu: "விடுப்பு",
  vinnappam: "விண்ணப்பம்",
  naan: "நான்",
  edukka: "எடுக்க",
  irupadhal: "இருப்பதால்",
  iruppadhal: "இருப்பதால்",
  thangal: "தாங்கள்",
  thaangal: "தாங்கள்",
  anumadhikka: "அனுமதிக்க",
  anumathikka: "அனுமதிக்க",
  vendum: "வேண்டும்"
};

export class LocalTamilTransliterationProvider implements TransliterationProvider {
  async transliterate(text: string) {
    return text.split(/(\s+|{{\s*[a-zA-Z0-9_]+\s*}}|\b(?=[A-Za-z0-9/-]*\d)[A-Za-z0-9]+(?:[/-][A-Za-z0-9]+)+\b|\b[A-Z]{2,}\b)/g)
      .map((part) => {
        if (!part || /^\s+$/.test(part) || /^{{/.test(part) || /\d/.test(part) || /^[A-Z]{2,}$/.test(part)) return part;
        const match = part.match(/^([^A-Za-z]*)([A-Za-z]+)([^A-Za-z]*)$/);
        if (!match) return part;
        const [, prefix, word, suffix] = match;
        const converted = OFFICE_TERMS[word.toLowerCase()] ?? transliterate(word);
        // Explicit dental-na convention: nh/nh+a vowel -> ந்/ந-series.
        return `${prefix}${converted.replaceAll("ன்ஹ்", "ந்").replaceAll("ன்ஹ", "ந")}${suffix}`;
      }).join("");
  }
}
