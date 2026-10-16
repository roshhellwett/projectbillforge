"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

export function SignOutButton({ iconOnly = true }: { iconOnly?: boolean }) {
  const locale = useLocale();
  const t = useTranslations("Dashboard");

  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
      className={`flex items-center justify-center transition-colors text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 
        ${iconOnly ? "p-2 rounded-lg" : "gap-3 px-4 py-3 w-full rounded-xl"}
      `}
      title={t("signOut")}
      aria-label={t("signOut")}
    >
      <LogOut size={iconOnly ? 18 : 20} aria-hidden="true" />
       {!iconOnly && <span className="font-medium">{t("signOut")}</span>}
    </button>
  );
}
