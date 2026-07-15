"use client";

import { useTranslations } from "next-intl";
import { Calculator, Percent, Clock } from "lucide-react";

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
  const inputClass = "w-full px-4 py-3 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--color-primary)] text-sm font-mono font-bold text-[var(--foreground)] transition-all min-h-[44px] shadow-sm";

  return (
    <div className="glass-card p-6 sm:p-8 border border-[var(--border)] card-hover-lift">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)]">
          <Calculator size={18} />
        </div>
        <div>
          <h2 className="text-lg font-black text-[var(--foreground)] tracking-tight">{t("fineSettings")}</h2>
          <p className="text-xs text-[var(--foreground)]/60">{t("fineSubtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/70 mb-2 flex items-center gap-1.5">
            <Clock size={14} className="text-[var(--color-primary)]" /> {t("redemptionPeriod")} (Days)
          </label>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            max="365"
            value={redemptionPeriodDays}
            onChange={e => onChange("redemptionPeriodDays", parseInt(e.target.value) || 0)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/70 mb-2 flex items-center gap-1.5">
            <Percent size={14} className="text-[var(--foreground)]" /> {t("finePercentage")} (%)
          </label>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            max="100"
            step="0.1"
            value={finePercentage}
            onChange={e => onChange("finePercentage", parseFloat(e.target.value) || 0)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/70 mb-2 flex items-center gap-1.5">
            <Clock size={14} className="text-[var(--color-primary)]" /> {t("fineFrequency")} (Days)
          </label>
          <input
            type="number"
            inputMode="numeric"
            min="1"
            max="365"
            value={fineFrequencyDays}
            onChange={e => onChange("fineFrequencyDays", parseInt(e.target.value) || 1)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-6 p-5 bg-[var(--surface-elevated)] rounded-2xl border border-[var(--border)] flex items-start gap-3 shadow-sm">
        <div className="p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] shrink-0 mt-0.5">
          <Calculator size={16} />
        </div>
        <p className="text-xs font-medium text-[var(--foreground)]/80 leading-relaxed">
          <span className="font-extrabold text-[var(--color-primary)] uppercase tracking-wide mr-1.5">{t("fineExample")}:</span>
          With {redemptionPeriodDays} days grace and {finePercentage}% interest applied every {fineFrequencyDays} days —
          An invoice of ₹10,000 overdue by 44 days will automatically calculate <span className="font-mono font-black text-[var(--foreground)] bg-[var(--surface-elevated)] px-2 py-0.5 rounded border border-[var(--border)]">₹{calcFine(redemptionPeriodDays, finePercentage, fineFrequencyDays)}</span> in penalty charges.
        </p>
      </div>
    </div>
  );
}
