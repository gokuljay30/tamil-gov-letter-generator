import { notFound } from "next/navigation";
import UseTemplateForm from "@/components/templates/UseTemplateForm";
import { rowToTemplate, type TemplateRow } from "@/lib/templates/mappers";
import { createClient } from "@/lib/supabase/server";

export default async function UseTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.from("templates").select("*").eq("id", id).single();
  if (error || !data) notFound();
  const template = rowToTemplate(data as TemplateRow);
  return <main className="content-page narrow-page"><header className="page-header"><h1>{template.name}</h1><p>{template.description || "தேவையான விவரங்களை நிரப்பி புதிய கடிதத்தை உருவாக்கவும்."}</p></header><UseTemplateForm template={template} userId={user.id} aiConfigured={Boolean(process.env.OPENAI_API_KEY)} /></main>;
}
