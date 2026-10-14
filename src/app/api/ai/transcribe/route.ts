import OpenAI from "openai";
import { NextResponse } from "next/server";
import { isAllowedAudioType } from "@/lib/dictation/audio";
import { isSpellingOnlyCorrection } from "@/lib/dictation/spelling";
import { createClient } from "@/lib/supabase/server";

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "AI not configured" }, { status: 503 });

  let audio: FormDataEntryValue | null;
  let context = "";
  try {
    const formData = await request.formData();
    audio = formData.get("audio");
    const submittedContext = formData.get("context");
    if (typeof submittedContext === "string") context = submittedContext.trim().slice(0, 3000);
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }
  if (!(audio instanceof File) || !audio.size || audio.size > MAX_AUDIO_BYTES || !isAllowedAudioType(audio.type)) {
    return NextResponse.json({ error: "Invalid audio" }, { status: 400 });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = await client.audio.transcriptions.create({
      file: audio,
      model: process.env.OPENAI_TRANSCRIPTION_MODEL || "gpt-4o-transcribe",
      language: "ta",
      prompt: `தமிழ்நாடு அரசு கடிதம். துறை, கோப்பு எண், பொருள், துறை சார்ந்த மற்றும் நிர்வாகச் சொற்களைத் துல்லியமாக எழுத்தாக்கவும். ந/ண/ன, ல/ள/ழ, ர/ற எழுத்துகளை சூழலுக்கேற்ப சரியாகப் பயன்படுத்தவும். அரசு கடிதத் தொடக்கத்தில் “பணிவுடன் தெரிவித்துக்கொள்வது யாதெனில்” என்று எழுதவும்; அங்கு “பணியுடன்” என்பது தவறு. “மேற்படி” என்பதை “மேல்படி” என்று எழுத வேண்டாம். “கேட்டுக்கொள்கிறேன்” என்ற கூட்டுச்சொல்லைச் சரியாக எழுதவும்.${context ? `\nகடிதச் சூழல் மற்றும் எதிர்பார்க்கப்படும் எழுத்துமுறை:\n${context}` : ""}`
    });
    const transcript = result.text.trim();
    if (!transcript) return NextResponse.json({ error: "Empty transcription" }, { status: 502 });

    try {
      const spellcheckModel = process.env.OPENAI_SPELLCHECK_MODEL || process.env.OPENAI_TEXT_MODEL || "gpt-4.1-mini";
      const corrected = await client.responses.create({
        model: spellcheckModel,
        store: false,
        max_output_tokens: 1500,
        ...(spellcheckModel.startsWith("gpt-5")
          ? { reasoning: { effort: "minimal" as const } }
          : {}),
        input: [
          {
            role: "system",
            content: `You are an accuracy-first Tamil ASR post-editor for Tamil Nadu government correspondence.

Goal: recover the speaker's intended Tamil wording from the transcript while changing as little as possible. Use the complete sentence, nearby words, government-letter conventions, supplied field context, Tamil grammar, and phonetic similarity to decide the intended spelling.

Correct Tamil spelling and speech-recognition errors only. You may correct Tamil letters such as ந/ண/ன, ல/ள/ழ, ர/ற, short/long vowels, an unmistakably missing/extra Tamil letter, compound-word spacing, sandhi, and an incorrect grammatical suffix when the intended phrase is unambiguous. You may replace a misrecognized Tamil word only when the replacement is phonetically close, fits the sentence context, has the same grammatical role, and is clearly what the speaker intended.

Mandatory restrictions:
- Preserve the intended meaning, facts, sentence structure, word order, and tone.
- Apart from a high-confidence speech-recognition correction, preserve the same lexical words.
- Do not replace a word with a synonym or a more formal word.
- Do not rewrite, formalize, translate, paraphrase, or improve grammar/style.
- Do not add or remove a word, phrase, fact, or sentence.
- You may join or split adjacent words only to correct standard Tamil compound-word or sandhi spelling.
- Preserve names, numbers, dates, amounts, codes, identifiers, and punctuation exactly.
- Use field context only to choose the spelling of an existing word. Never copy context into the result.
- Correct a grammatical ending only within the same lexical word; do not replace that word.
- If a suspected error would require guessing a different lexical word, leave it unchanged for the user to review.

High-confidence context rules for Tamil government correspondence:
- In an introductory phrase before “தெரிவித்துக்கொள்வது யாதெனில்”, use “பணிவுடன்”, never “பணியுடன்”. “பணியுடன்” means “with work” and is contextually incorrect there.
- Correct “மேல்படி” to the conventional administrative word “மேற்படி”.
- Write the compound forms “தெரிவித்துக்கொள்வது” and “கேட்டுக்கொள்கிறேன்” without incorrectly separating their parts.
- Apply these rules only when those same phrases are present in the transcript; never add them to unrelated text.

Before returning, compare source and output word-by-word and undo every change that is not a spelling-only correction to the same lexical word. Return only the corrected transcript without headings, quotes, or explanations.`
          },
          { role: "user", content: `${context ? `FIELD CONTEXT (reference only):\n${context}\n\n` : ""}TRANSCRIPT TO SPELL-CHECK:\n${transcript}` }
        ]
      });
      const correctedText = corrected.output_text.trim();
      if (!correctedText) throw new Error("Empty spell-check result");
      const safeText = isSpellingOnlyCorrection(transcript, correctedText)
        ? correctedText
        : transcript;
      return NextResponse.json({
        text: safeText,
        spellcheckApplied: true,
        correctionRestricted: safeText !== correctedText
      });
    } catch (correctionError) {
      const details = correctionError instanceof Error
        ? { category: correctionError.name, message: correctionError.message }
        : { category: "UnknownError" };
      console.error("Transcription spell check failed", details);
      return NextResponse.json({
        text: transcript,
        spellcheckApplied: false,
        warning: "Tamil spell check unavailable"
      });
    }
  } catch (error) {
    const category = error instanceof Error ? error.name : "UnknownError";
    console.error("Audio transcription failed", { category });
    return NextResponse.json({ error: "Transcription failed" }, { status: 502 });
  }
}
