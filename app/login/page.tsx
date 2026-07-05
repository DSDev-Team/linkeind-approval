"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LockIcon, AlertIcon } from "@/components/Icons";

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // If already authed, bounce to the app.
    fetch("/api/posts", { cache: "no-store" })
      .then((r) => (r.ok ? router.replace(next) : null))
      .catch(() => {});
  }, [router, next]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Login failed");
        setBusy(false);
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setError("Network error");
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-canvas)] px-4">
      <div className="surface w-full max-w-md p-7 animate-slide-up">
        <div className="mb-6 flex flex-col items-center text-center">
          <span
            className="mb-3 grid h-12 w-12 place-items-center rounded-lg text-white"
            style={{ background: "var(--color-primary)" }}
            aria-hidden
          >
            in
          </span>
          <h1 className="text-xl font-semibold tracking-tight">
            LinkedIn Approval
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Sign in to review and batch-approve this week&apos;s posts.
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]">
                <LockIcon size={16} />
              </span>
              <input
                id="password"
                type="password"
                className="input pl-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                autoFocus
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-md bg-[var(--color-rejected-bg)] px-3 py-2 text-sm text-[var(--color-destructive)]">
              <AlertIcon size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-[var(--color-muted-foreground)]">
          Internal tool · access is password-gated
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-canvas)]" />}>
      <LoginInner />
    </Suspense>
  );
}