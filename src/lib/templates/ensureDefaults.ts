import { createDefaultLetter } from "@/lib/defaultLetter";
import { createStarterTemplates } from "@/lib/templates/defaults";
import type { createClient } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

export async function ensureDefaultTemplates(supabase: ServerClient, userId: string) {
  const fallback = createDefaultLetter();
  const { data: settings } = await supabase
    .from("settings")
    .select("department_heading, default_sender, default_recipient, default_signature, default_salutation")
    .eq("user_id", userId)
    .maybeSingle();

  const templates = createStarterTemplates(userId, {
    departmentHeading: settings?.department_heading ?? fallback.departmentHeading,
    sender: settings?.default_sender ?? fallback.sender,
    recipient: settings?.default_recipient ?? fallback.recipient,
    salutation: settings?.default_salutation ?? fallback.salutation,
    signature: settings?.default_signature ?? fallback.signature
  });

  return supabase.from("templates").upsert(templates, {
    onConflict: "user_id,template_key",
    ignoreDuplicates: true
  });
}
