import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, country, role, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <DashboardShell profile={profile} variant="user">
      {children}
    </DashboardShell>
  );
}
