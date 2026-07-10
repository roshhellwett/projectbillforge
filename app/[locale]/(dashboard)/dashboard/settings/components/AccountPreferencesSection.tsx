"use client";

import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignOutButton } from "@/components/layout/signout-button";

export function AccountPreferencesSection() {
  const t = useTranslations("Settings");
  return (
    <div className="glass-card p-8 md:hidden">
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-6">{t("accountPreferences")}</h2>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between p-4 bg-[var(--foreground)]/5 rounded-xl border border-[var(--border)]">
          <div>
            <h3 className="font-medium text-[var(--foreground)]">{t("theme")}</h3>
            <p className="text-xs text-[var(--foreground)]/60">{t("themeDesc")}</p>
          </div>
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-between p-4 bg-[var(--foreground)]/5 rounded-xl border border-[var(--border)]">
          <div>
            <h3 className="font-medium text-[var(--foreground)]">{t("signOut")}</h3>
            <p className="text-xs text-[var(--foreground)]/60">{t("signOutDesc")}</p>
          </div>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
