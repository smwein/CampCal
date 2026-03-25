import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import CampList from "./camp-list";

export default async function CampsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: camps } = await supabase
    .from("camps")
    .select(`
      id,
      name,
      organization,
      category,
      cost_cents,
      camp_sessions(
        id,
        start_date,
        end_date,
        assignments(
          id,
          kid_id,
          kids(id, name, color)
        )
      )
    `)
    .eq("created_by_user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-[var(--font-display)] font-bold text-2xl">
          Your Camps
        </h2>
        <Link
          href="/dashboard/camps/new"
          className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-semibold px-4 py-2 rounded-[var(--radius-sm)] transition-colors"
        >
          + Add Camp
        </Link>
      </div>

      <CampList camps={camps ?? []} />
    </div>
  );
}
