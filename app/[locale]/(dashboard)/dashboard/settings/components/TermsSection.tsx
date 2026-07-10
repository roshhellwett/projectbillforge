"use client";

import { useTranslations } from "next-intl";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function TermsSection({ value, onChange }: Props) {
  const t = useTranslations("Settings");
  return (
    <div className="glass-card p-5 sm:p-8">
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">{t("termsC")}</h2>
      <p className="text-sm text-[var(--foreground)]/60 mb-6">{t("termsSubtitle")}</p>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={6}
        className="w-full px-4 py-3 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 text-[var(--foreground)] transition-all"
        placeholder="Enter terms and conditions..."
      />
      <p className="text-xs text-[var(--foreground)]/40 mt-2 text-right">{value.length} / 2000</p>
    </div>
  );
}
