"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: name.trim() || "Parent" },
      },
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    // Create profile/family for the new user
    if (data.user) {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .single();

      if (!existingProfile) {
        const { data: family } = await supabase
          .from("families")
          .insert({})
          .select("id")
          .single();

        if (family) {
          await supabase.from("profiles").insert({
            id: data.user.id,
            family_id: family.id,
            name: name.trim() || "Parent",
          });

          await supabase.from("family_members").insert({
            family_id: family.id,
            user_id: data.user.id,
            role: "owner",
          });
        }
      }
    }

    setLoading(false);
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-sm w-full">
        <h1 className="font-[var(--font-display)] font-extrabold text-3xl mb-2 text-center">
          Create your account
        </h1>
        <p className="text-[var(--color-text-muted)] text-center mb-8">
          Start planning your kids&apos; summer in minutes.
        </p>

        <form onSubmit={handleSignup}>
          <label className="block text-sm font-semibold mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 outline-none transition-colors mb-4"
          />

          <label className="block text-sm font-semibold mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 outline-none transition-colors mb-4"
          />

          <label className="block text-sm font-semibold mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            minLength={6}
            className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 outline-none transition-colors mb-4"
          />

          <label className="block text-sm font-semibold mb-1">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
            minLength={6}
            className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 outline-none transition-colors mb-4"
          />

          {error && (
            <p className="text-sm text-[var(--color-gap)] mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 text-white font-semibold py-2.5 rounded-[var(--radius-sm)] transition-colors duration-150"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-sm text-[var(--color-text-muted)] text-center mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--color-accent)] hover:underline font-semibold">
            Sign in
          </Link>
        </p>

        <p className="text-xs text-[var(--color-text-muted)] text-center mt-6">
          By creating an account, you confirm you are 18 years or older and agree to our{" "}
          <a href="#" className="text-[var(--color-accent)] hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </main>
  );
}
