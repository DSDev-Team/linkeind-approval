"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "./Icons";

const KEY = "li-approval-theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const cur = (document.documentElement.classList.contains("dark") ? "dark" : "light") as "light" | "dark";
    setTheme(cur);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    try { localStorage.setItem(KEY, next); } catch {}
  }

  return (
    <button
      type="button"
      className="btn-ghost"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title="Toggle theme"
    >
      {mounted && theme === "dark" ? <SunIcon size={16} /> : <MoonIcon size={16} />}
    </button>
  );
}