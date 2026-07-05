"use client";

import { useCallback, useEffect, useState } from "react";
import type { WeekGroup } from "@/lib/types";
import { Header } from "./Header";
import { CardDeck } from "./CardDeck";
import { LinkedinComposer } from "./LinkedinComposer";
import { InboxIcon, PlusIcon } from "./Icons";

export function Dashboard({
  initialWeeks,
  initialBackend,
}: {
  initialWeeks: WeekGroup[];
  initialBackend: string;
}) {
  const [weeks, setWeeks] = useState<WeekGroup[]>(initialWeeks);
  const [backend, setBackend] = useState<string>(initialBackend);
  const [refreshing, setRefreshing] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/posts", { cache: "no-store" });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data = await res.json();
      setWeeks(data.weeks);
      setBackend(data.backend);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/login");
  }

  const totalPending = weeks.reduce(
    (n, w) => n + w.counts.pending,
    0
  );
  const totalApproved = weeks.reduce((n, w) => n + w.counts.approved, 0);
  const totalPosts = weeks.reduce((n, w) => n + w.total, 0);

  return (
    <div className="min-h-screen bg-[var(--color-canvas)]">
      <Header
        onNew={() => setShowNew(true)}
        onRefresh={refresh}
        refreshing={refreshing}
        backend={backend}
        onLogout={logout}
      />

      <main className="mx-auto max-w-[920px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Post approval
            </h2>
            <p className="mt-1 max-w-xl text-sm text-[var(--color-muted-foreground)]">
              Review one post at a time. Approve, request changes, or reject —
              keyboard shortcuts <kbd className="rounded bg-[var(--color-muted)] px-1 font-mono text-[11px]">A</kbd> / <kbd className="rounded bg-[var(--color-muted)] px-1 font-mono text-[11px]">C</kbd> / <kbd className="rounded bg-[var(--color-muted)] px-1 font-mono text-[11px]">R</kbd> work too. Switch weeks with <kbd className="rounded bg-[var(--color-muted)] px-1 font-mono text-[11px]">←</kbd> / <kbd className="rounded bg-[var(--color-muted)] px-1 font-mono text-[11px]">→</kbd>.
            </p>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-[var(--color-muted-foreground)]">
            <span>{totalPosts} staged</span>
            <span className="h-3 w-px bg-[var(--color-border)]" aria-hidden />
            <span className="text-[var(--color-accent)]">{totalApproved} approved</span>
            <span className="h-3 w-px bg-[var(--color-border)]" aria-hidden />
            <span className="text-[var(--color-pending)]">{totalPending} pending</span>
          </div>
        </div>

        {totalPosts === 0 ? (
          <EmptyState onNew={() => setShowNew(true)} />
        ) : (
          <CardDeck weeks={weeks} onChanged={refresh} />
        )}
      </main>

      <LinkedinComposer
        open={showNew}
        onClose={() => setShowNew(false)}
        onCreated={refresh}
      />

      <footer className="mx-auto max-w-[920px] px-4 pb-10 pt-4 text-center font-mono text-[11px] text-[var(--color-muted-foreground)] sm:px-6">
        LinkedIn Approval · internal · {backend === "kv" ? "Vercel KV" : "dev in-memory store"}
      </footer>
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="surface flex flex-col items-center gap-4 px-6 py-16 text-center">
      <span
        className="grid h-14 w-14 place-items-center rounded-full bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
        aria-hidden
      >
        <InboxIcon size={26} />
      </span>
      <div>
        <h3 className="text-lg font-semibold">No posts queued yet</h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-[var(--color-muted-foreground)]">
          Stage your first post — LinkedIn-style composer, visual asset,
          scheduling, and a note for the approver.
        </p>
      </div>
      <button type="button" className="btn-primary" onClick={onNew}>
        <PlusIcon size={16} /> Create a post
      </button>
    </div>
  );
}