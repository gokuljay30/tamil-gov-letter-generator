import { notFound } from "next/navigation";
import TemplateForm from "@/components/templates/TemplateForm";
import { rowToTemplate, type TemplateRow } from "@/lib/templates/mappers";
import { createClient } from "@/lib/supabase/server";

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.from("templates").select("*").eq("id", id).single();
  if (error || !data) notFound();
  return <main className="content-page narrow-page"><header className="page-header"><h1>வார்ப்புருவைத் திருத்து</h1><p>Placeholder வடிவம்: {"{{variable_key}}"}</p></header><TemplateForm initial={rowToTemplate(data as TemplateRow)} /></main>;
}

