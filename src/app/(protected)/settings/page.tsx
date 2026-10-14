import SettingsForm from "@/components/settings/SettingsForm";
import { createDefaultLetter } from "@/lib/defaultLetter";
import { createClient } from "@/lib/supabase/server";
import type { UserSettings } from "@/models/settings";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("settings").select("*").eq("user_id", user.id).maybeSingle();
  const defaults = createDefaultLetter();
  const initial: UserSettings = data ? {
    id: data.id,
    departmentHeading: data.department_heading,
    defaultSender: data.default_sender,
    defaultRecipient: data.default_recipient ?? defaults.recipient,
    defaultSignature: data.default_signature,
    defaultSalutation: data.default_salutation
  } : {
    departmentHeading: defaults.departmentHeading,
    defaultSender: defaults.sender,
    defaultRecipient: defaults.recipient,
    defaultSignature: defaults.signature,
    defaultSalutation: defaults.salutation
  };

  return (
    <main className="content-page narrow-page">
      <header className="page-header">
        <h1>அமைப்புகள்</h1>
        <p>புதிய கடிதங்களில் பயன்படுத்த வேண்டிய இயல்புநிலை விவரங்கள்.</p>
      </header>
      <SettingsForm initial={initial} userId={user.id} aiConfigured={Boolean(process.env.OPENAI_API_KEY)} />
    </main>
  );
}
