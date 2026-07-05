"use client";

import { useCallback, useEffect, useState } from "react";
import type { WeekGroup } from "@/lib/types";
import { Header } from "./Header";
import { CardDeck } from "./CardDeck";
import { LinkedinComposer } from "./LinkedinComposer";
import { InboxIcon, PlusIcon } from "./Icons";

type Horizon = 1 | 2 | 3;

export function Dashboard() {
  const [weeks, setWeeks] = useState<WeekGroup[]>([]);
  const [horizon, setHorizon] = useState<Horizon>(1);
  const [refreshing, setRefreshing] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/posts?horizon=${horizon}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data = await res.json();
      setWeeks(data.weeks);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
      setLoaded(true);
    }
  }, [horizon]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refresh]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/login");
  }

  const totalPending = weeks.reduce((n, w) => n + w.counts.pending, 0);
  const totalApproved = weeks.reduce((n, w) => n + w.counts.approved, 0);
  const totalPosts = weeks.reduce((n, w) => n + w.total, 0);

  return (
    <div className="min-h-screen bg-[var(--color-canvas)]">
      <Header
        onNew={() => setShowNew(true)}
        onRefresh={refresh}
        refreshing={refreshing}
        onLogout={logout}
      />

      <main className="mx-auto max-w-[920px] px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">
              Approval queue
            </p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-[28px]">
              Review posts
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <HorizonSelector value={horizon} onChange={setHorizon} />
            <div className="hidden items-center gap-3 font-mono text-xs text-[var(--color-muted-foreground)] sm:flex">
              <span className="text-[var(--color-accent)]">{totalApproved} approved</span>
              <span className="h-3 w-px bg-[var(--color-border)]" aria-hidden />
              <span className={totalPending > 0 ? "text-[var(--color-pending)]" : ""}>
                {totalPending} pending
              </span>
            </div>
          </div>
        </div>

        {!loaded ? (
          <LoadingSkeleton />
        ) : totalPosts === 0 ? (
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

      <footer className="mx-auto max-w-[920px] px-4 pb-12 pt-6 text-center text-[11px] text-[var(--color-muted-foreground)] sm:px-6">
        LinkedIn Approval
      </footer>
    </div>
  );
}

function HorizonSelector({
  value,
  onChange,
}: {
  value: Horizon;
  onChange: (h: Horizon) => void;
}) {
  const opts: Horizon[] = [1, 2, 3];
  return (
    <div className="flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] p-1">
      {opts.map((h) => (
        <button
          key={h}
          type="button"
          onClick={() => onChange(h)}
          className={
            "rounded-full px-3 py-1 text-xs font-medium transition-colors " +
            (h === value
              ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
              : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]")
          }
          aria-pressed={h === value}
          title={`Show ${h} week${h > 1 ? "s" : ""}`}
        >
          {h}w
        </button>
      ))}
    </div>
  );
}

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="surface overflow-hidden">
      <div className="surface-inner flex flex-col items-center gap-4 px-6 py-20 text-center">
        <span
          className="grid h-14 w-14 place-items-center rounded-full bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
          aria-hidden
        >
          <InboxIcon size={26} />
        </span>
        <div>
          <h3 className="text-lg font-semibold">Nothing in the queue</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-[var(--color-muted-foreground)]">
            Stage a post to start the review cycle.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={onNew}>
          <PlusIcon size={16} /> New post
        </button>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="surface">
        <div className="surface-inner h-12 animate-pulse" style={{ background: "var(--color-muted)" }} />
      </div>
      <div className="surface">
        <div className="surface-inner h-[400px] animate-pulse" style={{ background: "var(--color-muted)" }} />
      </div>
    </div>
  );
}