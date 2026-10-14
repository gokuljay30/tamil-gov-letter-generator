import { NextResponse } from "next/server";
import { OpenAITextProvider } from "@/lib/ai/provider";
import type { AIAction, AITransformRequest, TransformField } from "@/lib/ai/types";
import { createClient } from "@/lib/supabase/server";

const actions = new Set<AIAction>(["formal_tamil", "translate_en_ta", "grammar_tamil", "shorten", "expand"]);
const fields = new Set<TransformField>(["department_heading", "sender", "recipient", "salutation", "signature", "subject", "reference", "body"]);

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "AI not configured" }, { status: 503 });

  let payload: AITransformRequest;
  try {
    payload = await request.json() as AITransformRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!actions.has(payload.action) || !fields.has(payload.field) || typeof payload.text !== "string" || !payload.text.trim() || payload.text.length > 20000) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if ((payload.context?.subject?.length ?? 0) > 2000 || (payload.context?.department?.length ?? 0) > 500) {
    return NextResponse.json({ error: "Context too large" }, { status: 400 });
  }

  try {
    const provider = new OpenAITextProvider();
    return NextResponse.json(await provider.transform(payload));
  } catch (error) {
    const category = error instanceof Error ? error.name : "UnknownError";
    console.error("AI transform failed", { action: payload.action, field: payload.field, category });
    return NextResponse.json({ error: "Transform failed" }, { status: 502 });
  }
}
