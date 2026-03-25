"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { value: "sports", label: "Sports" },
  { value: "arts", label: "Arts" },
  { value: "science", label: "Science" },
  { value: "outdoors", label: "Outdoors" },
  { value: "academic", label: "Academic" },
  { value: "mixed", label: "Mixed" },
];

const DURATION_TYPES = [
  { value: "full_day", label: "Full Day" },
  { value: "half_day", label: "Half Day" },
  { value: "extended", label: "Extended Day" },
];

interface Props {
  camp: {
    id: string;
    name: string;
    organization: string | null;
    address: string | null;
    zip_code: string | null;
    category: string;
    duration_type: string;
    age_min: number | null;
    age_max: number | null;
    cost_cents: number | null;
    url: string | null;
  };
  session: {
    id: string;
    start_date: string;
    end_date: string;
    days_of_week: number;
  } | null;
  assignments: { id: string; kid_id: string }[];
  kids: { id: string; name: string; color: string }[];
}

export default function CampEditForm({ camp, session, assignments, kids }: Props) {
  const [name, setName] = useState(camp.name);
  const [organization, setOrganization] = useState(camp.organization ?? "");
  const [address, setAddress] = useState(camp.address ?? "");
  const [zipCode, setZipCode] = useState(camp.zip_code ?? "");
  const [category, setCategory] = useState(camp.category);
  const [durationType, setDurationType] = useState(camp.duration_type);
  const [ageMin, setAgeMin] = useState(camp.age_min?.toString() ?? "");
  const [ageMax, setAgeMax] = useState(camp.age_max?.toString() ?? "");
  const [costPerWeek, setCostPerWeek] = useState(
    camp.cost_cents ? (camp.cost_cents / 100).toString() : ""
  );
  const [url, setUrl] = useState(camp.url ?? "");
  const [startDate, setStartDate] = useState(session?.start_date ?? "");
  const [endDate, setEndDate] = useState(session?.end_date ?? "");
  const [selectedKidId, setSelectedKidId] = useState(
    assignments.length > 0 ? assignments[0].kid_id : ""
  );
  const [saving, setSaving] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate) return;
    setSaving(true);

    await supabase
      .from("camps")
      .update({
        name: name.trim(),
        organization: organization.trim() || null,
        address: address.trim() || null,
        zip_code: zipCode.trim() || null,
        category,
        duration_type: durationType,
        age_min: ageMin ? parseInt(ageMin) : null,
        age_max: ageMax ? parseInt(ageMax) : null,
        cost_cents: costPerWeek ? Math.round(parseFloat(costPerWeek) * 100) : null,
        url: url.trim() || null,
      })
      .eq("id", camp.id);

    if (session) {
      await supabase
        .from("camp_sessions")
        .update({
          start_date: startDate,
          end_date: endDate,
        })
        .eq("id", session.id);
    }

    const currentKidIds = assignments.map((a) => a.kid_id);
    if (selectedKidId) {
      if (!currentKidIds.includes(selectedKidId) && session) {
        for (const a of assignments) {
          await supabase.from("assignments").delete().eq("id", a.id);
        }
        await supabase.from("assignments").insert({
          kid_id: selectedKidId,
          camp_session_id: session.id,
          status: "planned",
        });
      }
    } else {
      for (const a of assignments) {
        await supabase.from("assignments").delete().eq("id", a.id);
      }
    }

    setSaving(false);
    router.push("/dashboard");
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="font-[var(--font-display)] font-bold text-2xl mb-6">
        Edit Camp
      </h2>

      <form
        onSubmit={handleSave}
        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Camp Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-accent)] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Organization</label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g., YMCA, Parks & Rec"
              className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-accent)] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-accent)] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">End Date *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-accent)] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-accent)] outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Duration</label>
              <select
                value={durationType}
                onChange={(e) => setDurationType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-accent)] outline-none"
              >
                {DURATION_TYPES.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Age Min</label>
              <input
                type="number"
                value={ageMin}
                onChange={(e) => setAgeMin(e.target.value)}
                min="3"
                max="18"
                className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-accent)] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Age Max</label>
              <input
                type="number"
                value={ageMax}
                onChange={(e) => setAgeMax(e.target.value)}
                min="3"
                max="18"
                className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-accent)] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">$/week</label>
              <input
                type="number"
                value={costPerWeek}
                onChange={(e) => setCostPerWeek(e.target.value)}
                step="0.01"
                min="0"
                placeholder="385"
                className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-accent)] outline-none font-[var(--font-data)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Address / Location</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, Westfield, NJ 07090"
              className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-accent)] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Camp Website URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-accent)] outline-none"
            />
          </div>

          {kids.length > 0 && (
            <div>
              <label className="block text-sm font-semibold mb-2">Assign to Kid</label>
              <div className="flex gap-2">
                {kids.map((kid) => (
                  <button
                    key={kid.id}
                    type="button"
                    onClick={() => setSelectedKidId(kid.id)}
                    className={`text-white text-xs font-semibold px-4 py-2 rounded-full border-2 transition-all ${
                      selectedKidId === kid.id
                        ? "border-[var(--color-text)] scale-105"
                        : "border-transparent opacity-60"
                    }`}
                    style={{ backgroundColor: kid.color }}
                  >
                    {kid.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedKidId("")}
                  className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all ${
                    selectedKidId === ""
                      ? "border-[var(--color-text)] bg-[var(--color-bg)]"
                      : "border-[var(--color-border)] text-[var(--color-text-muted)]"
                  }`}
                >
                  None
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={saving || !name.trim() || !startDate || !endDate}
          className="w-full mt-6 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 text-white font-semibold py-2.5 rounded-[var(--radius-sm)] transition-colors"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
