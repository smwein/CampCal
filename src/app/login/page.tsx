"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

type AuthMode = "magic-link" | "password";

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleMagicLink(e: React.FormEvent) {
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

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
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
        <p className="text-[var(--color-text-muted)] text-center mb-6">
          {mode === "password"
            ? "Enter your email and password."
            : "Enter your email and we\u2019ll send you a magic link."}
        </p>

        {/* Mode tabs */}
        <div className="flex gap-1 mb-6 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-sm)] p-1">
          <button
            type="button"
            onClick={() => { setMode("password"); setError(""); }}
            className={`flex-1 text-sm font-semibold py-2 rounded-[4px] transition-colors ${
              mode === "password"
                ? "bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => { setMode("magic-link"); setError(""); }}
            className={`flex-1 text-sm font-semibold py-2 rounded-[4px] transition-colors ${
              mode === "magic-link"
                ? "bg-[var(--color-surface)] text-[var(--color-text)] shadow-sm"
                : "text-[var(--color-text-muted)]"
            }`}
          >
            Magic Link
          </button>
        </div>

        <form onSubmit={mode === "password" ? handlePasswordLogin : handleMagicLink}>
          <label className="block text-sm font-semibold mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 outline-none transition-colors mb-4"
          />

          {mode === "password" && (
            <>
              <label className="block text-sm font-semibold mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
                minLength={6}
                className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 outline-none transition-colors mb-4"
              />
            </>
          )}

          {error && (
            <p className="text-sm text-[var(--color-gap)] mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 text-white font-semibold py-2.5 rounded-[var(--radius-sm)] transition-colors duration-150"
          >
            {loading
              ? mode === "password" ? "Signing in..." : "Sending..."
              : mode === "password" ? "Sign In" : "Send Magic Link"}
          </button>
        </form>

        {mode === "password" && (
          <p className="text-sm text-[var(--color-text-muted)] text-center mt-4">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[var(--color-accent)] hover:underline font-semibold">
              Create one
            </Link>
          </p>
        )}

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
