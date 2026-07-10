"use client";

import { useTranslations } from "next-intl";

interface Props {
  redemptionPeriodDays: number;
  finePercentage: number;
  fineFrequencyDays: number;
  onChange: (key: "redemptionPeriodDays" | "finePercentage" | "fineFrequencyDays", value: number) => void;
}

function calcFine(redemption: number, pct: number, freq: number) {
  if (freq <= 0) return 0;
  const overdue = 44 - redemption;
  const periods = Math.max(0, Math.floor(overdue / freq));
  return (10000 * (pct / 100) * periods).toFixed(2);
}

export function FineSettingsSection({ redemptionPeriodDays, finePercentage, fineFrequencyDays, onChange }: Props) {
  const t = useTranslations("Settings");
  const inputClass = "w-full px-4 py-3 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 text-[var(--foreground)] transition-all";

  return (
    <div className="glass-card p-5 sm:p-8">
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">{t("fineSettings")}</h2>
      <p className="text-sm text-[var(--foreground)]/60 mb-6">{t("fineSubtitle")}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">{t("redemptionPeriod")}</label>
          <input type="number" min="0" max="365" value={redemptionPeriodDays} onChange={e => onChange("redemptionPeriodDays", parseInt(e.target.value) || 0)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">{t("finePercentage")}</label>
          <input type="number" min="0" max="100" step="0.1" value={finePercentage} onChange={e => onChange("finePercentage", parseFloat(e.target.value) || 0)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">{t("fineFrequency")}</label>
          <input type="number" min="1" max="365" value={fineFrequencyDays} onChange={e => onChange("fineFrequencyDays", parseInt(e.target.value) || 1)} className={inputClass} />
        </div>
      </div>

      <div className="mt-6 p-5 bg-[var(--color-primary)]/10 rounded-2xl border-l-4 border-[var(--color-primary)] glass-card">
        <p className="text-sm font-medium text-[var(--foreground)]/80">
          <span className="font-bold text-[var(--color-primary)] mr-2">{t("fineExample")}:</span>
          With {redemptionPeriodDays} days grace, {finePercentage}% per {fineFrequencyDays} days —
          A ₹10,000 invoice overdue by 44 days would incur: <span className="font-bold">₹{calcFine(redemptionPeriodDays, finePercentage, fineFrequencyDays)}</span> in fines.
        </p>
      </div>
    </div>
  );
}
