"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import type { Post, PostStatus, WeekGroup } from "@/lib/types";
import { cn } from "@/lib/utils";
import { LinkedinPreview } from "./LinkedinPreview";
import {
  CheckIcon,
  XIcon,
  AlertIcon,
  ChevronRightIcon,
  InboxIcon,
  ClockIcon,
  CheckCircleIcon,
  RefreshIcon,
  UndoIcon,
} from "./Icons";
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
  const [cursor, setCursor] = useState(0); // index within current week's pending list
  const [history, setHistory] = useState<Decision[]>([]);
  const [busy, start] = useTransition();
  const [animKey, setAnimKey] = useState(0);
  const [flash, setFlash] = useState<Verdict | "undo" | null>(null);

  // Only pending posts need review; approved/rejected are removed from the queue.
  const pendingByWeek = useMemo(() => {
    return weeks.map((w) => w.posts.filter((p) => p.status === "pending"));
  }, [weeks]);

  const tab = Math.min(tabIdx, weeks.length - 1);
  const currentPending = pendingByWeek[tab] ?? [];
  const total = currentPending.length;
  const idx = Math.min(cursor, Math.max(total - 1, 0));
  const post = currentPending[idx];

  const weekTabs = ["This week", "Next week", "The week after"];

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

  // Keyboard shortcuts: A approve, R reject, C changes, U undo, ← → week tabs
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toLowerCase();
      if (k === "a") { e.preventDefault(); decide("approved"); }
      else if (k === "r") { e.preventDefault(); decide("rejected"); }
      else if (k === "c") { e.preventDefault(); decide("changes_requested"); }
      else if (k === "u") { e.preventDefault(); undo(); }
      else if (e.key === "ArrowRight") { setTabIdx((i) => Math.min(i + 1, weeks.length - 1)); setCursor(0); }
      else if (e.key === "ArrowLeft") { setTabIdx((i) => Math.max(i - 1, 0)); setCursor(0); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [decide, approveWeek, undo, weeks.length]);

  // When the week's pending list shrinks (after a decision), keep cursor valid.
  useEffect(() => {
    if (cursor > 0 && cursor >= total) setCursor(Math.max(0, total - 1));
  }, [total, cursor]);

  // When changing tabs, reset cursor.
  useEffect(() => { setCursor(0); }, [tabIdx]);

  const totalReviewed = history.length;
  const totalQueue = pendingByWeek.reduce((n, w) => n + w.length, 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Week tabs + progress */}
      <div className="surface flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4">
        <div className="flex items-center gap-1 rounded-md bg-[var(--color-muted)] p-1">
          {weeks.map((w, i) => {
            const n = pendingByWeek[i]?.length ?? 0;
            return (
              <button
                key={w.weekId}
                type="button"
                onClick={() => setTabIdx(i)}
                className={cn(
                  "rounded px-3 py-1.5 text-sm font-medium transition-colors",
                  i === tab ? "bg-background text-[var(--color-foreground)] shadow-card" : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                )}
              >
                {weekTabs[i] ?? `Week ${i + 1}`}
                <span className={cn("ml-2 font-mono text-xs", n > 0 ? "text-[var(--color-accent)]" : "text-[var(--color-muted-foreground)] opacity-60")}>
                  {n}
                </span>
              </button>
            );
          })}
        </div>
        <div className="font-mono text-xs text-[var(--color-muted-foreground)]">
          {total > 0 ? `${idx + 1} of ${total} pending` : "Week clear"} · {totalReviewed} reviewed · {totalQueue} in queue
        </div>
      </div>

      {/* Card stage */}
      <div className="relative min-h-[28rem]">
        {!post ? (
          <WeekClear weekId={weeks[tab]?.weekId} weekLabel={weeks[tab]?.weekLabel} tabLabel={weekTabs[tab]} />
        ) : (
          <div key={post.id + animKey} className="relative animate-slide-up">
            <div
              className={cn(
                "surface overflow-hidden transition-transform duration-150",
                flash === "approved" && "ring-2 ring-[var(--color-approved)]",
                flash === "rejected" && "ring-2 ring-[var(--color-rejected)]",
                flash === "changes_requested" && "ring-2 ring-[var(--color-changes)]"
              )}
            >
              {/* status strip */}
              <div className="flex items-center justify-between border-b px-4 py-2.5">
                <div className="font-mono text-xs text-[var(--color-muted-foreground)]">
                  {post.dayLabel} · <span className="font-semibold">{post.author}</span>
                </div>
                <StatusBadge status={post.status} size="sm" />
              </div>

              <LinkedinPreview post={post} />

              {post.notes && (
                <div className="mx-5 mb-4 rounded-md bg-[var(--color-muted)] px-3 py-2 text-sm text-[var(--color-foreground)]/85">
                  <span className="font-medium">Note from author: </span>
                  {post.notes}
                </div>
              )}

              {post.feedback && post.status !== "pending" && (
                <div className="mx-5 mb-4 rounded-md bg-[var(--color-changes-bg)] px-3 py-2 text-sm text-[var(--color-changes)]">
                  <span className="font-medium">Previous feedback: </span>
                  {post.feedback}
                </div>
              )}
            </div>

            {/* Verdict bar */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                className="btn-accent min-w-[8rem] justify-center text-sm"
                onClick={() => decide("approved")}
                disabled={busy}
                title="Approve · A"
              >
                <CheckIcon size={18} /> Approve <kbd className="ml-1 hidden font-mono text-[10px] opacity-70 sm:inline">A</kbd>
              </button>
              <button
                type="button"
                className="btn-secondary min-w-[8rem] justify-center text-sm"
                onClick={() => decide("changes_requested")}
                disabled={busy}
                title="Request changes · C"
              >
                <AlertIcon size={18} /> Changes <kbd className="ml-1 hidden font-mono text-[10px] opacity-70 sm:inline">C</kbd>
              </button>
              <button
                type="button"
                className="btn-danger min-w-[8rem] justify-center text-sm"
                onClick={() => decide("rejected")}
                disabled={busy}
                title="Reject · R"
              >
                <XIcon size={18} /> Reject <kbd className="ml-1 hidden font-mono text-[10px] opacity-70 sm:inline">R</kbd>
              </button>
            </div>

            {history.length > 0 && (
              <div className="mt-3 flex justify-center">
                <button type="button" className="btn-ghost text-xs" onClick={undo} disabled={busy} title="Undo · U">
                  <UndoIcon size={14} /> Undo last <kbd className="ml-1 font-mono text-[10px] opacity-70">U</kbd>
                </button>
              </div>
            )}

            {/* flash overlay */}
            {flash && flash !== "undo" && (
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg text-2xl font-bold text-white animate-fade-in",
                  flash === "approved" && "bg-[var(--color-approved)]/85",
                  flash === "rejected" && "bg-[var(--color-rejected)]/85",
                  flash === "changes_requested" && "bg-[var(--color-changes)]/85"
                )}
                style={{ mixBlendMode: "normal" }}
              >
                {flash === "approved" && "✓ Approved"}
                {flash === "rejected" && "✕ Rejected"}
                {flash === "changes_requested" && "⚠ Changes requested"}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function WeekClear({
  weekId,
  weekLabel,
  tabLabel,
}: {
  weekId: string;
  weekLabel: string;
  tabLabel: string;
}) {
  return (
    <div className="surface flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span
        className="grid h-14 w-14 place-items-center rounded-full bg-[var(--color-approved-bg)] text-[var(--color-approved)]"
        aria-hidden
      >
        <CheckCircleIcon size={28} />
      </span>
      <h3 className="text-lg font-semibold">{tabLabel} is clear</h3>
      <p className="mx-auto max-w-md text-sm text-[var(--color-muted-foreground)]">
        Nothing left to review for {weekLabel} ({weekId}). Switch tabs to keep going,
        or stage new posts from the toolbar.
      </p>
    </div>
  );
}