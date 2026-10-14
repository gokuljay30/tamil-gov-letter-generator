import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import LetterWorkspace from "@/components/letter-editor/LetterWorkspace";
import { createDefaultLetter } from "@/lib/defaultLetter";
import { createClient } from "@/lib/supabase/server";

export default async function NewLetterPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/letters/new");

  const { data: settings } = await supabase
    .from("settings")
    .select("department_heading, default_sender, default_recipient, default_signature, default_salutation")
    .eq("user_id", user.id)
    .maybeSingle();

  const fallback = createDefaultLetter();
  const today = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Kolkata"
  }).format(new Date()).replaceAll("/", "-");

  const initialLetter = {
    ...fallback,
    id: randomUUID(),
    status: "draft" as const,
    fileNumber: "",
    date: today,
    departmentHeading: settings?.department_heading ?? fallback.departmentHeading,
    sender: settings?.default_sender ?? fallback.sender,
    recipient: settings?.default_recipient ?? fallback.recipient,
    salutation: settings?.default_salutation ?? fallback.salutation,
    subject: "",
    references: [],
    body: "",
    signature: settings?.default_signature ?? fallback.signature,
    updatedAt: new Date().toISOString()
  };

  return <LetterWorkspace
    initialLetter={initialLetter}
    aiConfigured={Boolean(process.env.OPENAI_API_KEY)}
    newLetterUserId={user.id}
  />;
}
