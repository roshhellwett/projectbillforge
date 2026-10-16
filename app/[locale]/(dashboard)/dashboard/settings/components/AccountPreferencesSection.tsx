"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { Moon, Palette, LogOut, Sun } from "lucide-react";

function SettingsThemeToggle({ label, lightLabel, darkLabel, switchToLight, switchToDark }: {
  label: string;
  lightLabel: string;
  darkLabel: string;
  switchToLight: string;
  switchToDark: string;
}) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-20 h-11 rounded-xl bg-[var(--border)]/40 animate-pulse" role="status" aria-label={label} />;
  }

  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? switchToLight : switchToDark}
      aria-pressed={isDark}
      className="min-h-11 inline-flex items-center justify-center gap-1.5 px-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] hover:border-[var(--foreground)]/30 transition-all shadow-2xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
    >
      {isDark ? <Moon size={14} aria-hidden="true" /> : <Sun size={14} aria-hidden="true" />}
      <span>{isDark ? darkLabel : lightLabel}</span>
    </button>
  );
}

export function AccountPreferencesSection() {
  const t = useTranslations("Settings");
  const locale = useLocale();

  const handleSignOut = () => {
    void signOut({ callbackUrl: `/${locale}/login` });
  };

  return (
    <section aria-labelledby="account-preferences-title" className="glass-card p-5 sm:p-8">
      <h2 id="account-preferences-title" className="text-lg font-semibold text-[var(--foreground)] mb-1">{t("accountPreferences")}</h2>
      <p className="text-sm text-[var(--foreground)]/60 mb-6">{t("accountPreferencesDescription")}</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[var(--foreground)]/5 rounded-xl border border-[var(--border)]">
          <div className="flex items-start gap-3">
            <Palette size={18} aria-hidden="true" className="mt-0.5 text-[var(--foreground)]/60 shrink-0" />
            <div>
              <h3 className="font-medium text-[var(--foreground)]">{t("theme")}</h3>
              <p className="text-xs text-[var(--foreground)]/60">{t("themeDesc")}</p>
            </div>
          </div>
          <SettingsThemeToggle
            label={t("theme")}
            lightLabel={t("lightTheme")}
            darkLabel={t("darkTheme")}
            switchToLight={t("switchToLight")}
            switchToDark={t("switchToDark")}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[var(--foreground)]/5 rounded-xl border border-[var(--border)]">
          <div className="flex items-start gap-3">
            <LogOut size={18} aria-hidden="true" className="mt-0.5 text-[var(--foreground)]/60 shrink-0" />
            <div>
              <h3 className="font-medium text-[var(--foreground)]">{t("signOut")}</h3>
              <p className="text-xs text-[var(--foreground)]/60">{t("signOutDesc")}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="min-h-11 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-[var(--color-danger)] border border-[var(--border)] hover:bg-[var(--color-danger)]/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <LogOut size={17} aria-hidden="true" />
            {t("signOut")}
          </button>
        </div>
      </div>
    </section>
  );
}
