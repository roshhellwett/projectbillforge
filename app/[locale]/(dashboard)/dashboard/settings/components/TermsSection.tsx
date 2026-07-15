"use client";

import { useTranslations } from "next-intl";
import { FileText } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function TermsSection({ value, onChange }: Props) {
  const t = useTranslations("Settings");
  return (
    <div className="glass-card p-6 sm:p-8 border border-[var(--border)] card-hover-lift">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
          <FileText size={18} />
        </div>
        <div>
          <h2 className="text-lg font-black text-[var(--foreground)] tracking-tight">{t("termsC")}</h2>
          <p className="text-xs text-[var(--foreground)]/60">{t("termsSubtitle")}</p>
        </div>
      </div>

      <div className="mt-5">
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={5}
          className="w-full px-4 py-3.5 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--color-primary)] text-sm text-[var(--foreground)] transition-all leading-relaxed shadow-sm"
          placeholder="Enter terms and conditions (e.g. Goods once sold will not be taken back...)"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--foreground)]/40">
            Printed at the bottom of all generated GST invoices & PDF receipts
          </span>
          <span className="text-xs font-mono font-bold text-[var(--foreground)]/50">
            {value.length} / 2000
          </span>
        </div>
      </div>
    </div>
  );
}
