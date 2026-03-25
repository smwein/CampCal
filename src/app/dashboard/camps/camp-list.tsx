"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CampWithDetails {
  id: string;
  name: string;
  organization: string | null;
  category: string;
  cost_cents: number | null;
  camp_sessions: {
    id: string;
    start_date: string;
    end_date: string;
    assignments: {
      id: string;
      kid_id: string;
      kids: { id: string; name: string; color: string } | { id: string; name: string; color: string }[];
    }[];
  }[];
}

export default function CampList({ camps }: { camps: CampWithDetails[] }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete(campId: string, campName: string) {
    if (!window.confirm(`Delete "${campName}"? This will remove all sessions and assignments.`)) return;
    await supabase.from("camps").delete().eq("id", campId);
    router.refresh();
  }

  if (camps.length === 0) {
    return (
      <p className="text-[var(--color-text-muted)] text-center py-12">
        No camps added yet. Add your first camp to start planning.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {camps.map((camp) => {
        // Get date range from sessions
        const dates = camp.camp_sessions.flatMap((s) => [s.start_date, s.end_date]).sort();
        const startDate = dates[0];
        const endDate = dates[dates.length - 1];

        // Collect assigned kids (flatten nested Supabase relations)
        const kidMap = new Map<string, { id: string; name: string; color: string }>();
        camp.camp_sessions.forEach((session) => {
          session.assignments.forEach((a) => {
            const kid = Array.isArray(a.kids) ? a.kids[0] : a.kids;
            if (kid) kidMap.set(kid.id, { id: kid.id, name: kid.name, color: kid.color });
          });
        });
        const assignedKids = Array.from(kidMap.values());

        const costDisplay = camp.cost_cents
          ? `$${(camp.cost_cents / 100).toFixed(0)}/week`
          : null;

        return (
          <div
            key={camp.id}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 flex items-center justify-between"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold truncate">{camp.name}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)]">
                  {camp.category}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                {camp.organization && <span>{camp.organization}</span>}
                {startDate && endDate && (
                  <span className="font-[var(--font-data)]">
                    {new Date(startDate + "T00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    {" - "}
                    {new Date(endDate + "T00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                )}
                {costDisplay && (
                  <span className="font-[var(--font-data)]">{costDisplay}</span>
                )}
              </div>
              {assignedKids.length > 0 && (
                <div className="flex gap-1.5 mt-2">
                  {assignedKids.map((kid) => (
                    <span
                      key={kid.id}
                      className="text-white text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: kid.color }}
                    >
                      {kid.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 ml-4">
              <Link
                href={`/dashboard/camps/${camp.id}/edit`}
                className="text-xs font-semibold text-[var(--color-accent)] hover:underline"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(camp.id, camp.name)}
                className="text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-gap)] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
