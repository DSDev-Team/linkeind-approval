"use client";

import { useState } from "react";
import { PlusIcon, LogoutIcon, RefreshIcon } from "./Icons";
import { ThemeToggle } from "./ThemeToggle";

export function Header({
  onNew,
  onRefresh,
  refreshing,
  onLogout,
}: {
  onNew: () => void;
  onRefresh: () => void;
  refreshing?: boolean;
  onLogout: () => void;
}) {
  const [busy, setBusy] = useState(false);
  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      onLogout();
    } finally {
      setBusy(false);
    }
  }

  return (
    <header className="sticky top-0 z-30">
      <div className="mx-auto mt-1 max-w-[920px] px-4 sm:px-6">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)]/60 bg-[var(--color-background)]/70 px-4 py-2.5 shadow-sm backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] sm:px-5">
          <div className="flex items-baseline gap-2">
            <span
              className="grid h-7 w-7 place-items-center rounded-lg text-white"
              style={{ background: "var(--color-primary)" }}
              aria-hidden
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 12 2 2 4-4" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </span>
            <h1 className="text-[15px] font-semibold tracking-tight">Approval</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-ghost hidden sm:inline-flex"
              onClick={onRefresh}
              disabled={refreshing}
              aria-label="Refresh"
            >
              <RefreshIcon size={15} className={refreshing ? "animate-spin" : ""} />
            </button>
            <button type="button" className="btn-primary" onClick={onNew}>
              <PlusIcon size={16} /> New post
            </button>
            <ThemeToggle />
            <button
              type="button"
              className="btn-ghost"
              onClick={onLogout || logout}
              disabled={busy}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogoutIcon size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
