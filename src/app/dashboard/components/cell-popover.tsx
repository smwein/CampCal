"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import type { WeekCoverage } from "@/lib/coverage";
import { format } from "date-fns";

interface CellPopoverProps {
  week: WeekCoverage;
  kidId: string;
  kidName: string;
  anchorRect: DOMRect;
  onClose: () => void;
}

export default function CellPopover({
  week,
  kidId,
  kidName,
  anchorRect,
  onClose,
}: CellPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();
  const [vacationLabel, setVacationLabel] = useState("");
  const [saving, setSaving] = useState(false);

  // Position: below cell by default, above if near bottom
  const spaceBelow = window.innerHeight - anchorRect.bottom;
  const positionAbove = spaceBelow < 200;
  const top = positionAbove
    ? anchorRect.top + window.scrollY - 8
    : anchorRect.bottom + window.scrollY + 4;
  const left = anchorRect.left + window.scrollX + anchorRect.width / 2;

  // Dismiss on click-outside or Escape
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  async function handleMarkVacation() {
    setSaving(true);
    const weekStart = format(week.weekStart, "yyyy-MM-dd");
    const friday = new Date(week.weekStart);
    friday.setDate(friday.getDate() + 4);
    const weekEnd = format(friday, "yyyy-MM-dd");

    await supabase.from("coverage_overrides").insert({
      kid_id: kidId,
      start_date: weekStart,
      end_date: weekEnd,
      type: "vacation",
      label: vacationLabel.trim() || null,
    });
    router.refresh();
    onClose();
  }

  async function handleNoCoverageNeeded() {
    setSaving(true);
    const weekStart = format(week.weekStart, "yyyy-MM-dd");
    const friday = new Date(week.weekStart);
    friday.setDate(friday.getDate() + 4);
    const weekEnd = format(friday, "yyyy-MM-dd");

    await supabase.from("coverage_overrides").insert({
      kid_id: kidId,
      start_date: weekStart,
      end_date: weekEnd,
      type: "no_coverage_needed",
      label: null,
    });
    router.refresh();
    onClose();
  }

  async function handleRemoveOverride() {
    if (!week.overrideId) return;
    setSaving(true);
    await supabase.from("coverage_overrides").delete().eq("id", week.overrideId);
    router.refresh();
    onClose();
  }

  async function handleRemoveAssignment() {
    if (!week.assignmentId || !week.sessionId) return;
    if (!window.confirm(`Remove ${week.campName} for ${kidName} this week?`)) return;
    setSaving(true);
    await supabase.from("assignments").delete().eq("id", week.assignmentId);
    await supabase.from("camp_sessions").delete().eq("id", week.sessionId);
    router.refresh();
    onClose();
  }

  const weekLabel = week.weekLabel;

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] shadow-lg p-4 w-56"
      style={{
        top,
        left,
        transform: `translateX(-50%)${positionAbove ? " translateY(-100%)" : ""}`,
      }}
    >
      <div className="text-xs text-[var(--color-text-muted)] mb-2">
        {kidName} &middot; {weekLabel}
      </div>

      {week.type === "gap" && (
        <div className="space-y-2">
          <a
            href={`/dashboard/camps/new?kid=${kidId}&week=${format(week.weekStart, "yyyy-MM-dd")}`}
            className="block w-full text-left text-sm font-semibold text-[var(--color-accent)] hover:underline"
          >
            + Add Camp
          </a>
          <div>
            <input
              type="text"
              placeholder="Vacation label (optional)"
              value={vacationLabel}
              onChange={(e) => setVacationLabel(e.target.value)}
              className="w-full text-xs px-2 py-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-accent)] outline-none mb-1.5"
            />
            <button
              onClick={handleMarkVacation}
              disabled={saving}
              className="w-full text-xs font-semibold py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-vacation)] text-white disabled:opacity-50"
            >
              Mark Vacation
            </button>
          </div>
          <button
            onClick={handleNoCoverageNeeded}
            disabled={saving}
            className="w-full text-xs font-semibold py-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] disabled:opacity-50"
          >
            No Coverage Needed
          </button>
        </div>
      )}

      {week.type === "camp" && (
        <div className="space-y-2">
          <div className="text-sm font-semibold">{week.campName}</div>
          {week.campCategory && (
            <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)]">
              {week.campCategory}
            </span>
          )}
          <div className="flex gap-2">
            {week.campId && (
              <a
                href={`/dashboard/camps/${week.campId}/edit`}
                className="text-xs font-semibold text-[var(--color-accent)] hover:underline"
              >
                Edit
              </a>
            )}
            <button
              onClick={handleRemoveAssignment}
              disabled={saving}
              className="text-xs font-semibold text-[var(--color-gap)] hover:underline disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {(week.type === "vacation" || week.type === "no_coverage_needed") && (
        <div className="space-y-2">
          <div className="text-sm font-semibold">
            {week.type === "vacation" ? "Vacation" : "No Coverage Needed"}
          </div>
          {week.overrideLabel && week.overrideLabel !== week.type && (
            <div className="text-xs text-[var(--color-text-muted)]">{week.overrideLabel}</div>
          )}
          <button
            onClick={handleRemoveOverride}
            disabled={saving}
            className="text-xs font-semibold text-[var(--color-gap)] hover:underline disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
