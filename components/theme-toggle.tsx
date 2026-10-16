"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTranslations } from "next-intl";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const t = useTranslations("Shell");

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
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] hover:border-[var(--foreground)]/30 transition-all shadow-2xs cursor-pointer"
      aria-label={t("toggleTheme")}
      title={isDark ? t("switchToLight") : t("switchToDark")}
    >
      {isDark ? (
         <Moon size={13} className="text-[var(--foreground)] shrink-0" aria-hidden="true" />
      ) : (
         <Sun size={13} className="text-[var(--foreground)] shrink-0" aria-hidden="true" />
      )}
      <span>{isDark ? t("darkTheme") : t("lightTheme")}</span>
    </button>
  );
}
