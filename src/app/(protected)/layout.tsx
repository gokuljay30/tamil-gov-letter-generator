import { redirect } from "next/navigation";
import AppNav from "@/components/common/AppNav";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <>
      <AppNav />
      {children}
    </>
  );
}

