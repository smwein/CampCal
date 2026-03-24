"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const KID_COLORS = [
  "#E74C3C",
  "#3498DB",
  "#2ECC71",
  "#9B59B6",
  "#F39C12",
  "#1ABC9C",
  "#E67E22",
  "#E84393",
];

interface Kid {
  id: string;
  name: string;
  birth_date: string | null;
  color: string;
}

export default function KidsPage() {
  const [kids, setKids] = useState<Kid[]>([]);
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [color, setColor] = useState(KID_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [familyId, setFamilyId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("family_id")
        .eq("id", user.id)
        .single();

      if (!profile) return;
      setFamilyId(profile.family_id);

      const { data } = await supabase
        .from("kids")
        .select("*")
        .eq("family_id", profile.family_id)
        .order("created_at");

      setKids(data ?? []);

      // Pre-select next available color
      const usedColors = (data ?? []).map((k: Kid) => k.color);
      const nextColor = KID_COLORS.find((c) => !usedColors.includes(c));
      if (nextColor) setColor(nextColor);
    }
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!familyId || !name.trim()) return;
    setLoading(true);

    const { error } = await supabase.from("kids").insert({
      family_id: familyId,
      name: name.trim(),
      birth_date: birthDate || null,
      color,
    });

    if (!error) {
      setName("");
      setBirthDate("");
      // Refresh kids list
      const { data } = await supabase
        .from("kids")
        .select("*")
        .eq("family_id", familyId)
        .order("created_at");
      setKids(data ?? []);

      const usedColors = (data ?? []).map((k: Kid) => k.color);
      const nextColor = KID_COLORS.find((c) => !usedColors.includes(c));
      if (nextColor) setColor(nextColor);
    }
    setLoading(false);
  }

  async function handleDelete(kidId: string) {
    if (!confirm("Remove this kid? This will delete all their camp assignments."))
      return;

    await supabase.from("kids").delete().eq("id", kidId);
    setKids(kids.filter((k) => k.id !== kidId));
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="font-[var(--font-display)] font-bold text-2xl mb-6">
        Your Kids
      </h2>

      {/* Existing kids */}
      {kids.length > 0 && (
        <div className="space-y-3 mb-8">
          {kids.map((kid) => (
            <div
              key={kid.id}
              className="flex items-center justify-between bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: kid.color }}
                />
                <div>
                  <div className="font-semibold">{kid.name}</div>
                  {kid.birth_date && (
                    <div className="text-xs text-[var(--color-text-muted)] font-[var(--font-data)]">
                      Born: {kid.birth_date}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(kid.id)}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-gap)] transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add kid form */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6">
        <h3 className="font-semibold mb-4">Add a Kid</h3>
        <form onSubmit={handleAdd}>
          <label className="block text-sm font-semibold mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Emma"
            required
            className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 outline-none transition-colors mb-4"
          />

          <label className="block text-sm font-semibold mb-1">
            Date of Birth (optional)
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 outline-none transition-colors mb-4"
          />

          <label className="block text-sm font-semibold mb-2">Color</label>
          <div className="flex gap-2 mb-6">
            {KID_COLORS.map((c) => {
              const used = kids.some((k) => k.color === c);
              return (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c
                      ? "border-[var(--color-text)] scale-110"
                      : "border-transparent"
                  } ${used ? "opacity-30" : ""}`}
                  style={{ backgroundColor: c }}
                  disabled={used}
                />
              );
            })}
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 text-white font-semibold py-2.5 rounded-[var(--radius-sm)] transition-colors"
          >
            {loading ? "Adding..." : "Add Kid"}
          </button>
        </form>
      </div>

      {kids.length > 0 && (
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full mt-4 text-sm text-[var(--color-accent)] hover:underline text-center py-2"
        >
          Back to Summer Overview
        </button>
      )}
    </div>
  );
}
