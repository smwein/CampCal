"use client";

import {
  Kid,
  Assignment,
  CoverageOverride,
  getKidWeekCoverage,
  getCoveragePercentage,
} from "@/lib/coverage";

export default function CoverageBar({
  kids,
  assignments,
  overrides,
}: {
  kids: Kid[];
  assignments: Assignment[];
  overrides: CoverageOverride[];
}) {
  const kidCoverages = kids.map((kid) => {
    const coverage = getKidWeekCoverage(kid.id, assignments, overrides);
    const pct = getCoveragePercentage(coverage);
    const gaps = coverage.filter((w) => w.type === "gap");
    return { kid, coverage, pct, gaps };
  });

  const allGaps = kidCoverages.flatMap((kc) =>
    kc.gaps.map((g) => ({ kidName: kc.kid.name, week: g.weekLabel }))
  );

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4 mb-6">
      <div className="text-sm font-semibold mb-3">Summer Coverage</div>

      {kidCoverages.map(({ kid, coverage, pct }) => (
        <div key={kid.id} className="flex items-center gap-3 mb-2">
          <span
            className="text-xs font-semibold w-16 truncate"
            style={{ color: kid.color }}
          >
            {kid.name}
          </span>
          <div className="flex-1 h-5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded flex overflow-hidden">
            {coverage.map((week, i) => (
              <div
                key={i}
                className="h-full"
                style={{
                  width: `${100 / coverage.length}%`,
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
                    ? `${week.weekLabel}: ${week.campName}`
                    : week.type === "vacation"
                      ? `${week.weekLabel}: ${week.overrideLabel}`
                      : `${week.weekLabel}: No coverage`
                }
              />
            ))}
          </div>
          <span className="text-xs text-[var(--color-text-muted)] font-[var(--font-data)] w-10 text-right tabular-nums">
            {pct}%
          </span>
        </div>
      ))}

      {allGaps.length > 0 && (
        <p className="text-xs text-[var(--color-gap)] mt-2">
          {allGaps.map((g, i) => (
            <span key={i}>
              {i > 0 && " · "}
              {g.week}: No coverage for {g.kidName}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
