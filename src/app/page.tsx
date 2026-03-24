import Link from "next/link";

const KID_COLORS = [
  { name: "Emma, 8", color: "bg-[var(--color-kid-1)]" },
  { name: "Jake, 6", color: "bg-[var(--color-kid-2)]" },
  { name: "Lily, 11", color: "bg-[var(--color-kid-3)]" },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <h1 className="font-[var(--font-display)] font-extrabold text-5xl tracking-tight mb-4">
          CampCalendar
        </h1>
        <p className="text-xl text-[var(--color-text-muted)] mb-8">
          Plan your kids&apos; summer. See every week, every kid, every camp —
          at a glance.
        </p>

        <div className="flex gap-2 justify-center mb-10">
          {KID_COLORS.map((kid) => (
            <span
              key={kid.name}
              className={`${kid.color} text-white text-sm font-semibold px-4 py-1.5 rounded-full`}
            >
              {kid.name}
            </span>
          ))}
        </div>

        <Link
          href="/login"
          className="inline-block bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-semibold px-8 py-3 rounded-[var(--radius-sm)] transition-colors duration-150"
        >
          Get Started — It&apos;s Free
        </Link>

        <p className="text-sm text-[var(--color-text-muted)] mt-4">
          No credit card required. Free for parents, forever.
        </p>
      </div>
    </main>
  );
}
