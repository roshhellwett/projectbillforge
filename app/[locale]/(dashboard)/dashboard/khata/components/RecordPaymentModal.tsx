"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { safeNum, fmt } from "../hooks/useKhata";

interface Customer {
  id: string; name: string; phone: string | null;
  currentBalance: number | null;
}

interface Props {
  open: boolean;
  saving: boolean;
  customer: Customer | null;
  paymentData: { amount: string; note: string; method: string };
  onClose: () => void;
  onChange: (data: { amount: string; note: string; method: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const methods = ["cash", "upi", "bank", "cheque"];

export function RecordPaymentModal({ open, saving, customer, paymentData, onClose, onChange, onSubmit }: Props) {
  const t = useTranslations("Khata");
  if (!open) return null;
  const methodKey = (m: string) => `payment${m.charAt(0).toUpperCase() + m.slice(1)}` as const;

  return (
    <div className="glass-overlay" onKeyDown={e => { if (e.key === "Escape") onClose(); }}>
      <div className="glass-card glass-modal-panel max-w-md">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--border)]/50">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">{t("recordPayment")}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-[var(--foreground)]/5 rounded-lg transition-colors" aria-label="Close">
            <X size={20} className="text-[var(--foreground)]/60" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-4 space-y-4">
          <div className="bg-[var(--color-success)]/10 p-4 rounded-xl border border-[var(--color-success)]/20">
            <p className="text-sm text-[var(--color-success)]">
              {t("paymentFor")} <strong>{customer?.name}</strong>
            </p>
            <p className="text-lg font-bold text-[var(--color-success)] mt-1">
              {t("currentDue")} ₹{fmt(customer?.currentBalance)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">{t("paymentAmount")}</label>
            <input type="number" step="0.01" min="0.01" required value={paymentData.amount}
              onChange={e => onChange({ ...paymentData, amount: e.target.value })}
              className="w-full glass-input" placeholder="0.00" />
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={() => onChange({ ...paymentData, amount: String(safeNum(customer?.currentBalance)) })}
                className="text-xs px-3 py-1.5 min-h-[44px] bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 rounded border border-[var(--border)] text-[var(--foreground)]/70">
                {t("payFull")}
              </button>
              <button type="button" onClick={() => onChange({ ...paymentData, amount: (safeNum(customer?.currentBalance) / 2).toFixed(2) })}
                className="text-xs px-3 py-1.5 min-h-[44px] bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 rounded border border-[var(--border)] text-[var(--foreground)]/70">
                {t("payHalf")}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">{t("paymentMethod")}</label>
            <select value={paymentData.method} onChange={e => onChange({ ...paymentData, method: e.target.value })} className="w-full glass-input">
              {methods.map(m => (
                <option key={m} value={m}>{t(methodKey(m))}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">{t("noteOptional")}</label>
            <input type="text" value={paymentData.note} onChange={e => onChange({ ...paymentData, note: e.target.value })}
              className="w-full glass-input" placeholder={t("notePlaceholderPayment")} />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="glass-btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="glass-btn-primary flex-1">
              {saving ? t("processing") : t("recordPayment")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
