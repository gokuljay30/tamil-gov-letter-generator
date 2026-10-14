import TemplatesList from "@/components/templates/TemplatesList";
import { ensureDefaultTemplates } from "@/lib/templates/ensureDefaults";
import { rowToTemplate, type TemplateRow } from "@/lib/templates/mappers";
import { createClient } from "@/lib/supabase/server";

export default async function TemplatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { error: seedError } = await ensureDefaultTemplates(supabase, user.id);
  const { data, error } = await supabase.from("templates").select("*").order("updated_at", { ascending: false });

  return (
    <main className="content-page">
      <header className="page-header"><h1>வார்ப்புருக்கள்</h1><p>அடிக்கடி பயன்படுத்தும் கடிதங்களை விரைவாக உருவாக்கவும்.</p></header>
      {seedError || error ? <div className="migration-notice"><strong>Templates database migration தேவை.</strong><span>Supabase SQL Editor-ல் `supabase/migrations/20260813_add_templates.sql` கோப்பை இயக்கவும்.</span></div> : <TemplatesList initialTemplates={((data ?? []) as TemplateRow[]).map(rowToTemplate)} userId={user.id} />}
    </main>
  );
}

