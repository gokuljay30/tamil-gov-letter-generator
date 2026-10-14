import Link from "next/link";
import LettersList from "@/components/letters/LettersList";
import { createClient } from "@/lib/supabase/server";
import type { LetterRow } from "@/lib/letters/mappers";

export default async function LettersPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("letters").select("*").order("updated_at", { ascending: false });
  const { error } = await searchParams;

  return (
    <main className="content-page">
      <header className="page-header header-with-action">
        <div><h1>கடிதங்கள்</h1><p>சேமிக்கப்பட்ட கடிதங்களைத் திறக்கவும், நகலெடுக்கவும் அல்லது நீக்கவும்.</p></div>
        <Link className="button button-primary link-button" href="/letters/new">+ புதிய கடிதம்</Link>
      </header>
      {error === "create" ? <p className="form-error">புதிய கடிதத்தை உருவாக்க முடியவில்லை.</p> : null}
      <LettersList initialLetters={(data ?? []) as LetterRow[]} userId={user.id} aiConfigured={Boolean(process.env.OPENAI_API_KEY)} />
    </main>
  );
}
