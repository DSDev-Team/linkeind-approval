"use client";

import { useState } from "react";
import { PlusIcon, LogoutIcon, RefreshIcon } from "./Icons";
import { ThemeToggle } from "./ThemeToggle";

export function Header({
  onNew,
  onRefresh,
  refreshing,
  backend,
  onLogout,
}: {
  onNew: () => void;
  onRefresh: () => void;
  refreshing?: boolean;
  backend?: string;
  onLogout: () => void;
}) {
  const [busy, setBusy] = useState(false);
  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.assign("/login");
    } finally {
      setBusy(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-[var(--color-background)]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span
            className="grid h-8 w-8 place-items-center rounded-md font-mono text-sm font-semibold text-white"
            style={{ background: "var(--color-primary)" }}
            aria-hidden
          >
            in
          </span>
          <div className="flex flex-col leading-tight">
            <h1 className="text-sm font-semibold tracking-tight">LinkedIn Approval</h1>
            <span className="font-mono text-[11px] text-[var(--color-muted-foreground)]">
              {backend === "kv" ? "Vercel KV" : "dev · in-memory"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-secondary hidden sm:inline-flex"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh"
          >
            <RefreshIcon size={15} className={refreshing ? "animate-spin" : ""} />
            Refresh
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
    </header>
  );
}