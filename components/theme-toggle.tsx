"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-16 h-7 rounded-lg bg-[var(--border)]/40 animate-pulse pointer-events-none" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] hover:border-[var(--foreground)]/30 transition-all shadow-2xs cursor-pointer"
      aria-label="Toggle Dark Mode"
      title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
    >
      {isDark ? (
        <Moon size={13} className="text-[var(--foreground)] shrink-0" />
      ) : (
        <Sun size={13} className="text-[var(--foreground)] shrink-0" />
      )}
      <span>{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}
