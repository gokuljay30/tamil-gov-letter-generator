import { notFound } from "next/navigation";
import LetterWorkspace from "@/components/letter-editor/LetterWorkspace";
import { rowToLetter, type LetterRow } from "@/lib/letters/mappers";
import { createClient } from "@/lib/supabase/server";

export default async function LetterEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.from("letters").select("*").eq("id", id).single();
  if (error || !data) notFound();
  return <LetterWorkspace initialLetter={rowToLetter(data as LetterRow)} aiConfigured={Boolean(process.env.OPENAI_API_KEY)} />;
}
