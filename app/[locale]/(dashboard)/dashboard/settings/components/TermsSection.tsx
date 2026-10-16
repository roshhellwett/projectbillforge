"use client";

import { useTranslations } from "next-intl";
import { FileText } from "lucide-react";
import { useId } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function TermsSection({ value, onChange }: Props) {
  const t = useTranslations("Settings");
  const idPrefix = useId();
  const termsId = `${idPrefix}-terms`;
  const helperId = `${idPrefix}-terms-helper`;

  return (
    <section aria-labelledby={`${idPrefix}-title`} className="glass-card p-5 sm:p-8 border border-[var(--border)]">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)]">
          <FileText size={18} aria-hidden="true" />
        </div>
        <div>
          <h2 id={`${idPrefix}-title`} className="text-lg font-black text-[var(--foreground)] tracking-tight">{t("termsC")}</h2>
          <p className="text-xs text-[var(--foreground)]/60">{t("termsSubtitle")}</p>
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor={termsId} className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/70 mb-2">
          {t("termsLabel")}
        </label>
        <textarea
          id={termsId}
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={5}
          maxLength={2000}
          aria-describedby={helperId}
          className="w-full px-4 py-3.5 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--color-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20 text-sm text-[var(--foreground)] transition-all leading-relaxed shadow-sm"
          placeholder={t("termsPlaceholder")}
        />
        <div id={helperId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mt-2">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--foreground)]/40">
            {t("termsHelper")}
          </span>
          <span className="text-xs font-mono font-bold text-[var(--foreground)]/50">
            {t("termsCounter", { count: value.length, max: 2000 })}
          </span>
        </div>
      </div>
    </section>
  );
}
