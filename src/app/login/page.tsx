"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <h1 className="font-[var(--font-display)] font-extrabold text-3xl mb-3">
            Check your email
          </h1>
          <p className="text-[var(--color-text-muted)] mb-6">
            We sent a magic link to <strong className="text-[var(--color-text)]">{email}</strong>.
            Click it to sign in.
          </p>
          <button
            onClick={() => setSent(false)}
            className="text-sm text-[var(--color-accent)] hover:underline"
          >
            Use a different email
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-sm w-full">
        <h1 className="font-[var(--font-display)] font-extrabold text-3xl mb-2 text-center">
          Sign in to CampCalendar
        </h1>
        <p className="text-[var(--color-text-muted)] text-center mb-8">
          Enter your email and we&apos;ll send you a magic link.
        </p>

        <form onSubmit={handleLogin}>
          <label className="block text-sm font-semibold mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
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
            {loading ? "Sending..." : "Send Magic Link"}
          </button>
        </form>

        <p className="text-xs text-[var(--color-text-muted)] text-center mt-6">
          By signing in, you confirm you are 18 years or older and agree to our{" "}
          <a href="#" className="text-[var(--color-accent)] hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </main>
  );
}
