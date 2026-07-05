"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import type { Post, WeekGroup } from "@/lib/types";
import { cn } from "@/lib/utils";
import { LinkedinPreview } from "./LinkedinPreview";
import { CheckIcon, XIcon, AlertIcon, CheckCircleIcon, UndoIcon } from "./Icons";
import { StatusBadge } from "./StatusBadge";

type Verdict = "approved" | "rejected" | "changes_requested";

interface Decision {
  postId: string;
  verdict: Verdict;
  at: number;
}

export function CardDeck({
  weeks,
  onChanged,
}: {
  weeks: WeekGroup[];
  onChanged: () => void;
}) {
  const [tabIdx, setTabIdx] = useState(0);
  const [cursor, setCursor] = useState(0);
  const [history, setHistory] = useState<Decision[]>([]);
  const [busy, start] = useTransition();
  const [animKey, setAnimKey] = useState(0);
  const [flash, setFlash] = useState<Verdict | "undo" | null>(null);

  const pendingByWeek = useMemo(
    () => weeks.map((w) => w.posts.filter((p) => p.status === "pending")),
    [weeks]
  );

  const tab = Math.min(tabIdx, weeks.length - 1);
  const currentPending = pendingByWeek[tab] ?? [];
  const total = currentPending.length;
  const idx = Math.min(cursor, Math.max(total - 1, 0));
  const post = currentPending[idx];

  const decide = useCallback(
    (verdict: Verdict) => {
      if (!post || busy) return;
      start(async () => {
        const res = await fetch(`/api/posts/${post.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: verdict }),
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          alert(e.error ?? "Save failed");
          return;
        }
        setHistory((h) => [...h, { postId: post.id, verdict, at: Date.now() }]);
        setFlash(verdict);
        setAnimKey((k) => k + 1);
        setTimeout(() => setFlash(null), 700);
        onChanged();
      });
    },
    [post, busy, onChanged]
  );

  function undo() {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    start(async () => {
      const res = await fetch(`/api/posts/${last.postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pending" }),
      });
      if (!res.ok) {
        alert("Undo failed");
        return;
      }
      setHistory((h) => h.slice(0, -1));
      setFlash("undo");
      setTimeout(() => setFlash(null), 600);
      onChanged();
    });
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLowerCase();
      if (k === "a") { e.preventDefault(); decide("approved"); }
      else if (k === "r") { e.preventDefault(); decide("rejected"); }
      else if (k === "c") { e.preventDefault(); decide("changes_requested"); }
      else if (k === "u") { e.preventDefault(); undo(); }
      else if (e.key === "ArrowRight" && weeks.length > 1) {
        setTabIdx((i) => Math.min(i + 1, weeks.length - 1)); setCursor(0);
      } else if (e.key === "ArrowLeft" && weeks.length > 1) {
        setTabIdx((i) => Math.max(i - 1, 0)); setCursor(0);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [decide, undo, weeks.length]);

  useEffect(() => {
    if (cursor > 0 && cursor >= total) setCursor(Math.max(0, total - 1));
  }, [total, cursor]);

  useEffect(() => { setCursor(0); }, [tabIdx]);

  const showTabs = weeks.length > 1;

  return (
    <div className="flex flex-col gap-5">
      {showTabs && (
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-background)] p-1 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
            {weeks.map((w, i) => {
              const n = pendingByWeek[i]?.length ?? 0;
              return (
                <button
                  key={w.weekId}
                  type="button"
                  onClick={() => setTabIdx(i)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    i === tab
                      ? "bg-[var(--color-primary)] text-[var(--color-on-primary)]"
                      : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                  )}
                >
                  {w.weekLabel}
                  {n > 0 && (
                    <span className={cn(
                      "ml-2 font-mono text-xs",
                      i === tab ? "opacity-80" : "text-[var(--color-pending)]"
                    )}>
                      {n}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="relative min-h-[24rem]">
        {!post ? (
          <WeekClear weekLabel={weeks[tab]?.weekLabel} />
        ) : (
          <div key={post.id + animKey} className="relative animate-slide-up">
            {flash && flash !== "undo" && (
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 z-10 flex items-center justify-center animate-zoom-in",
                  flash === "approved" && "bg-[var(--color-approved)]/85",
                  flash === "rejected" && "bg-[var(--color-rejected)]/85",
                  flash === "changes_requested" && "bg-[var(--color-changes)]/85"
                )}
                style={{ borderRadius: "inherit" }}
              >
                <span className="rounded-full border border-white/30 px-6 py-2 text-lg font-semibold tracking-tight text-white backdrop-blur-sm">
                  {flash === "approved" && "Approved"}
                  {flash === "rejected" && "Rejected"}
                  {flash === "changes_requested" && "Changes requested"}
                </span>
              </div>
            )}

            {/* Double-bezel: outer shell */}
            <div
              className={cn(
                "surface overflow-hidden",
                flash === "approved" && "ring-2 ring-[var(--color-approved)]",
                flash === "rejected" && "ring-2 ring-[var(--color-rejected)]",
                flash === "changes_requested" && "ring-2 ring-[var(--color-changes)]"
              )}
            >
              {/* Inner core */}
              <div className="surface-inner">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3">
                  <div className="text-sm text-[var(--color-muted-foreground)]">
                    <span className="font-medium text-[var(--color-foreground)]">{post.dayLabel}</span>
                    <span className="mx-2 opacity-50" aria-hidden>·</span>
                    <span>{post.author}</span>
                  </div>
                  <StatusBadge status={post.status} size="sm" />
                </div>

                <LinkedinPreview post={post} />

                {post.notes && (
                  <div className="mx-5 mb-5 rounded-lg bg-[var(--color-muted)] px-4 py-3 text-sm text-[var(--color-foreground)]/85">
                    <span className="font-medium">Note · </span>
                    {post.notes}
                  </div>
                )}

                {post.feedback && post.status !== "pending" && (
                  <div className="mx-5 mb-5 rounded-lg bg-[var(--color-changes-bg)] px-4 py-3 text-sm text-[var(--color-changes)]">
                    <span className="font-medium">Feedback · </span>
                    {post.feedback}
                  </div>
                )}
              </div>
            </div>

            {/* Button-in-button action bar */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                className="btn-accent min-w-[8rem] justify-center text-sm"
                onClick={() => decide("approved")}
                disabled={busy}
                title="Approve (A)"
              >
                <span className="btn-icon-nest"><CheckIcon size={15} /></span>
                Approve
              </button>
              <button
                type="button"
                className="btn-secondary min-w-[8rem] justify-center text-sm"
                onClick={() => decide("changes_requested")}
                disabled={busy}
                title="Request changes (C)"
              >
                <span className="btn-icon-nest"><AlertIcon size={15} /></span>
                Changes
              </button>
              <button
                type="button"
                className="btn-danger min-w-[8rem] justify-center text-sm"
                onClick={() => decide("rejected")}
                disabled={busy}
                title="Reject (R)"
              >
                <span className="btn-icon-nest"><XIcon size={15} /></span>
                Reject
              </button>
            </div>

            {history.length > 0 && (
              <div className="mt-3 flex justify-center">
                <button
                  type="button"
                  className={cn(
                    "btn-ghost text-xs transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    flash === "undo" && "scale-105 opacity-0"
                  )}
                  onClick={undo}
                  disabled={busy}
                  title="Undo (U)"
                >
                  <UndoIcon size={14} /> Undo
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function WeekClear({ weekLabel }: { weekLabel: string }) {
  return (
    <div className="surface overflow-hidden">
      <div className="surface-inner flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span
          className="grid h-14 w-14 place-items-center rounded-full bg-[var(--color-approved-bg)] text-[var(--color-approved)]"
          aria-hidden
        >
          <CheckCircleIcon size={28} />
        </span>
        <h3 className="text-lg font-semibold">Week clear</h3>
        <p className="mx-auto max-w-sm text-sm text-[var(--color-muted-foreground)]">
          Nothing left to review for {weekLabel}.
        </p>
      </div>
    </div>
  );
}
