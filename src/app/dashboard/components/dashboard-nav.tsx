"use client";

import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter, usePathname } from "next/navigation";

interface Kid {
  id: string;
  name: string;
  birth_date: string | null;
  color: string;
}

export default function DashboardNav({
  userName,
  kids,
  familyId,
}: {
  userName: string;
  kids: Kid[];
  familyId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 py-3">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="font-[var(--font-display)] font-extrabold text-xl tracking-tight"
          >
            CampCalendar
          </Link>

          <div className="flex items-center gap-2">
            {kids.map((kid) => (
              <span
                key={kid.id}
                className="text-white text-xs font-semibold px-3 py-1 rounded-full"
                style={{ backgroundColor: kid.color }}
              >
                {kid.name}
              </span>
            ))}
            <Link
              href="/dashboard/kids"
              className="text-xs text-[var(--color-text-muted)] border border-dashed border-[var(--color-border)] px-3 py-1 rounded-full hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
            >
              + Add Kid
            </Link>
          </div>
          <Link
            href="/dashboard/camps"
            className={`text-sm font-semibold transition-colors ${
              pathname.startsWith("/dashboard/camps")
                ? "text-[var(--color-text)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            Camps
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--color-text-muted)]">
            {userName}
          </span>
          <button
            onClick={handleSignOut}
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
