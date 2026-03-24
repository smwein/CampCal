"use client";

import { useState, useEffect } from "react";
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

export default function NewCampPage() {
  const [mode, setMode] = useState<"paste" | "manual">("paste");
  const [pasteText, setPasteText] = useState("");
  const [parsing, setParsing] = useState(false);

  // Camp form fields
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [category, setCategory] = useState("mixed");
  const [durationType, setDurationType] = useState("full_day");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [costPerWeek, setCostPerWeek] = useState("");
  const [url, setUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [saving, setSaving] = useState(false);
  const [kids, setKids] = useState<{ id: string; name: string; color: string }[]>([]);
  const [selectedKidId, setSelectedKidId] = useState("");

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadKids() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("family_id")
        .eq("id", user.id)
        .single();
      if (!profile) return;
      const { data } = await supabase
        .from("kids")
        .select("id, name, color")
        .eq("family_id", profile.family_id)
        .order("created_at");
      setKids(data ?? []);
      if (data && data.length > 0) setSelectedKidId(data[0].id);
    }
    loadKids();
  }, []);

  async function handleParse() {
    if (!pasteText.trim()) return;
    setParsing(true);

    try {
      const res = await fetch("/api/camps/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pasteText }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.name) setName(data.name);
        if (data.organization) setOrganization(data.organization);
        if (data.address) setAddress(data.address);
        if (data.zip_code) setZipCode(data.zip_code);
        if (data.category) setCategory(data.category);
        if (data.duration_type) setDurationType(data.duration_type);
        if (data.age_min) setAgeMin(String(data.age_min));
        if (data.age_max) setAgeMax(String(data.age_max));
        if (data.cost_per_week) setCostPerWeek(String(data.cost_per_week));
        if (data.url) setUrl(data.url);
        if (data.start_date) setStartDate(data.start_date);
        if (data.end_date) setEndDate(data.end_date);
        setMode("manual"); // Switch to form view to confirm/edit
      }
    } catch {
      // Fall through to manual mode
    }

    setParsing(false);
    setMode("manual");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();

    // Create the camp
    const { data: camp, error: campError } = await supabase
      .from("camps")
      .insert({
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
        created_by_user_id: user?.id,
      })
      .select("id")
      .single();

    if (campError || !camp) {
      setSaving(false);
      return;
    }

    // Create the camp session
    const { data: session } = await supabase
      .from("camp_sessions")
      .insert({
        camp_id: camp.id,
        start_date: startDate,
        end_date: endDate,
        days_of_week: 31, // Mon-Fri default
      })
      .select("id")
      .single();

    // If a kid is selected, create the assignment
    if (selectedKidId && session) {
      await supabase.from("assignments").insert({
        kid_id: selectedKidId,
        camp_session_id: session.id,
        status: "planned",
      });
    }

    setSaving(false);
    router.push("/dashboard");
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="font-[var(--font-display)] font-bold text-2xl mb-6">
        Add a Camp
      </h2>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode("paste")}
          className={`text-sm font-semibold px-4 py-2 rounded-[var(--radius-sm)] border transition-colors ${
            mode === "paste"
              ? "bg-[var(--color-text)] text-[var(--color-surface)] border-[var(--color-text)]"
              : "border-[var(--color-border)] text-[var(--color-text-muted)]"
          }`}
        >
          Paste Camp Info
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`text-sm font-semibold px-4 py-2 rounded-[var(--radius-sm)] border transition-colors ${
            mode === "manual"
              ? "bg-[var(--color-text)] text-[var(--color-surface)] border-[var(--color-text)]"
              : "border-[var(--color-border)] text-[var(--color-text-muted)]"
          }`}
        >
          Enter Manually
        </button>
      </div>

      {/* Paste mode */}
      {mode === "paste" && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6 mb-6">
          <p className="text-sm text-[var(--color-text-muted)] mb-3">
            Paste camp details from an email, website, or flyer. We&apos;ll
            extract the info automatically.
          </p>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="e.g., Westfield Soccer Academy, June 15-19, Full Day 9am-3pm, Ages 6-10, $385/week, 123 Main St, Westfield NJ 07090"
            rows={5}
            className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 outline-none transition-colors resize-none mb-4"
          />
          <button
            onClick={handleParse}
            disabled={parsing || !pasteText.trim()}
            className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 text-white font-semibold py-2.5 rounded-[var(--radius-sm)] transition-colors"
          >
            {parsing ? "Extracting details..." : "Extract Camp Details"}
          </button>
        </div>
      )}

      {/* Manual form */}
      {mode === "manual" && (
        <form
          onSubmit={handleSave}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] p-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Camp Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-accent)] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Organization
              </label>
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
                <label className="block text-sm font-semibold mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-accent)] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  End Date *
                </label>
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
                <label className="block text-sm font-semibold mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-accent)] outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Duration
                </label>
                <select
                  value={durationType}
                  onChange={(e) => setDurationType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-accent)] outline-none"
                >
                  {DURATION_TYPES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Age Min
                </label>
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
                <label className="block text-sm font-semibold mb-1">
                  Age Max
                </label>
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
                <label className="block text-sm font-semibold mb-1">
                  $/week
                </label>
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
              <label className="block text-sm font-semibold mb-1">
                Address / Location
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, Westfield, NJ 07090"
                className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-accent)] outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                Camp Website URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] focus:border-[var(--color-accent)] outline-none"
              />
            </div>

            {/* Assign to kid */}
            {kids.length > 0 && (
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Assign to Kid
                </label>
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
            {saving ? "Saving..." : "Save Camp"}
          </button>
        </form>
      )}
    </div>
  );
}
