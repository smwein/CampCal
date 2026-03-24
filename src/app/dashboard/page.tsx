import { createClient } from "@/utils/supabase/server";
import SummerOverview from "./components/summer-overview";
import CoverageBar from "./components/coverage-bar";
import Link from "next/link";
import type { Assignment } from "@/lib/coverage";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("family_id")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  // Fetch kids
  const { data: kids } = await supabase
    .from("kids")
    .select("id, name, birth_date, color")
    .eq("family_id", profile.family_id)
    .order("created_at");

  // Fetch assignments with camp session and camp details
  const { data: rawAssignments } = await supabase
    .from("assignments")
    .select(
      `
      id,
      kid_id,
      status,
      camp_session:camp_sessions!inner(
        id,
        start_date,
        end_date,
        days_of_week,
        camp:camps!inner(id, name, category)
      )
    `
    )
    .in("kid_id", (kids ?? []).map((k) => k.id));

  // Normalize Supabase nested relations (arrays → single objects)
  const assignments: Assignment[] = (rawAssignments ?? []).map((a: Record<string, unknown>) => ({
    id: a.id as string,
    kid_id: a.kid_id as string,
    status: a.status as string,
    camp_session: Array.isArray(a.camp_session) ? {
      ...(a.camp_session[0] as Record<string, unknown>),
      camp: Array.isArray((a.camp_session[0] as Record<string, unknown>)?.camp)
        ? ((a.camp_session[0] as Record<string, unknown>).camp as unknown[])[0]
        : (a.camp_session[0] as Record<string, unknown>)?.camp,
    } : {
      ...(a.camp_session as Record<string, unknown>),
      camp: Array.isArray((a.camp_session as Record<string, unknown>)?.camp)
        ? ((a.camp_session as Record<string, unknown>).camp as unknown[])[0]
        : (a.camp_session as Record<string, unknown>)?.camp,
    },
  })) as Assignment[];

  // Fetch coverage overrides
  const { data: overrides } = await supabase
    .from("coverage_overrides")
    .select("id, kid_id, start_date, end_date, type, label")
    .in("kid_id", (kids ?? []).map((k) => k.id));

  const hasKids = kids && kids.length > 0;

  if (!hasKids) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <h2 className="font-[var(--font-display)] font-bold text-2xl mb-2">
          Welcome to CampCalendar
        </h2>
        <p className="text-[var(--color-text-muted)] mb-6">
          Start by adding your kids to see the summer planning view.
        </p>
        <Link
          href="/dashboard/kids"
          className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold px-6 py-2.5 rounded-[var(--radius-sm)] transition-colors"
        >
          Add Your First Kid
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-[var(--font-display)] font-bold text-2xl">
          Summer 2026
        </h2>
        <div className="flex gap-2">
          <Link
            href="/dashboard/camps/new"
            className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-semibold px-4 py-2 rounded-[var(--radius-sm)] transition-colors"
          >
            + Add Camp
          </Link>
        </div>
      </div>

      <CoverageBar
        kids={kids}
        assignments={assignments ?? []}
        overrides={overrides ?? []}
      />

      <SummerOverview
        kids={kids}
        assignments={assignments ?? []}
        overrides={overrides ?? []}
      />
    </div>
  );
}
