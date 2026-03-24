import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import DashboardNav from "./components/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile and kids for the nav bar
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, family_id")
    .eq("id", user.id)
    .single();

  const { data: kids } = await supabase
    .from("kids")
    .select("id, name, birth_date, color")
    .eq("family_id", profile?.family_id)
    .order("created_at");

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <DashboardNav
        userName={profile?.name ?? "Parent"}
        kids={kids ?? []}
        familyId={profile?.family_id}
      />
      <main className="max-w-[1280px] mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
