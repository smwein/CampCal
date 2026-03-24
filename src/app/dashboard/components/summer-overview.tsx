"use client";

import {
  Kid,
  Assignment,
  CoverageOverride,
  getKidWeekCoverage,
  getSummerWeeks,
} from "@/lib/coverage";
import { format } from "date-fns";

export default function SummerOverview({
  kids,
  assignments,
  overrides,
}: {
  kids: Kid[];
  assignments: Assignment[];
  overrides: CoverageOverride[];
}) {
  const weeks = getSummerWeeks();

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6 overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-[var(--font-display)] font-semibold text-lg">
          Summer Overview
        </h3>
      </div>

      <div
        className="grid gap-[2px]"
        style={{
          gridTemplateColumns: `80px repeat(${weeks.length}, minmax(64px, 1fr))`,
        }}
      >
        {/* Week headers */}
        <div />
        {weeks.map((week, i) => (
          <div
            key={i}
            className="text-center text-[10px] text-[var(--color-text-muted)] font-[var(--font-data)] py-1"
          >
            {format(week, "MMM d")}
          </div>
        ))}

        {/* Kid rows */}
        {kids.map((kid) => {
          const coverage = getKidWeekCoverage(kid.id, assignments, overrides);
          return (
            <div key={kid.id} className="contents">
              {/* Kid name */}
              <div
                className="flex items-center text-xs font-semibold pr-2 truncate"
                style={{ color: kid.color }}
              >
                {kid.name}
              </div>

              {/* Week cells */}
              {coverage.map((week, i) => (
                <div
                  key={i}
                  className={`h-9 rounded flex items-center justify-center text-[10px] font-semibold transition-colors ${
                    week.type === "gap"
                      ? "border border-dashed border-[var(--color-gap)]"
                      : "text-white"
                  }`}
                  style={{
                    backgroundColor:
                      week.type === "camp"
                        ? kid.color
                        : week.type === "vacation"
                          ? "var(--color-vacation)"
                          : undefined,
                    backgroundImage:
                      week.type === "gap"
                        ? "repeating-linear-gradient(45deg, transparent, transparent 3px, #FEE2E2 3px, #FEE2E2 6px)"
                        : undefined,
                  }}
                  title={
                    week.type === "camp"
                      ? week.campName ?? ""
                      : week.type === "vacation"
                        ? week.overrideLabel ?? "Vacation"
                        : "No coverage"
                  }
                >
                  {week.type === "camp"
                    ? (week.campName ?? "").split(" ")[0]
                    : week.type === "vacation"
                      ? (week.overrideLabel ?? "Vacation").split(" ")[0]
                      : ""}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {kids.length === 0 && (
        <p className="text-sm text-[var(--color-text-muted)] text-center py-8">
          Add kids to see your summer planning overview.
        </p>
      )}
    </div>
  );
}
