"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import type { Kid } from "@/lib/coverage";

interface TimeOffModalProps {
  kids: Kid[];
  onClose: () => void;
}

export default function TimeOffModal({ kids, onClose }: TimeOffModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const [selectedKidIds, setSelectedKidIds] = useState<string[]>(kids.map((k) => k.id));
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState<"vacation" | "no_coverage_needed">("vacation");
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);

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

  function toggleKid(kidId: string) {
    setSelectedKidIds((prev) =>
      prev.includes(kidId) ? prev.filter((id) => id !== kidId) : [...prev, kidId]
    );
  }

  function toggleAll() {
    if (selectedKidIds.length === kids.length) {
      setSelectedKidIds([]);
    } else {
      setSelectedKidIds(kids.map((k) => k.id));
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!startDate || !endDate || selectedKidIds.length === 0) return;
    setSaving(true);

    const rows = selectedKidIds.map((kid_id) => ({
      kid_id,
      start_date: startDate,
      end_date: endDate,
      type,
      label: label.trim() || null,
    }));

    await supabase.from("coverage_overrides").insert(rows);
    router.refresh();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div
        ref={ref}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-xl p-6 w-full max-w-md animate-[fadeIn_250ms_ease-out]"
      >
        <h3 className="font-[var(--font-display)] font-bold text-lg mb-4">
          Mark Time Off
        </h3>

        <form onSubmit={handleSave}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Kids</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={toggleAll}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                    selectedKidIds.length === kids.length
                      ? "border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-surface)]"
                      : "border-[var(--color-border)] text-[var(--color-text-muted)]"
                  }`}
                >
                  All Kids
                </button>
                {kids.map((kid) => (
                  <button
                    key={kid.id}
                    type="button"
                    onClick={() => toggleKid(kid.id)}
                    className={`text-white text-xs font-semibold px-3 py-1.5 rounded-full border-2 transition-all ${
                      selectedKidIds.includes(kid.id)
                        ? "border-[var(--color-text)] scale-105"
                        : "border-transparent opacity-40"
                    }`}
                    style={{ backgroundColor: kid.color }}
                  >
                    {kid.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-accent)] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-accent)] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "vacation" | "no_coverage_needed")}
                className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-accent)] outline-none"
              >
                <option value="vacation">Vacation</option>
                <option value="no_coverage_needed">No Coverage Needed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Label (optional)</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., Family trip to Maine"
                className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-accent)] outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !startDate || !endDate || selectedKidIds.length === 0}
              className="flex-1 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 text-white font-semibold py-2.5 rounded-[var(--radius-sm)] transition-colors"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
