"use client";

import { useState } from "react";
import TimeOffModal from "./time-off-modal";
import type { Kid } from "@/lib/coverage";

export default function TimeOffButton({ kids }: { kids: Kid[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] text-sm font-semibold px-4 py-2 rounded-[var(--radius-sm)] transition-colors"
      >
        Mark Time Off
      </button>
      {open && <TimeOffModal kids={kids} onClose={() => setOpen(false)} />}
    </>
  );
}
