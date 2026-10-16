"use client";

import { useId, useRef, type FormEvent } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useModalAccessibility } from "@/components/ui/ui";
import { safeNum, fmt } from "../hooks/useKhata";

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  currentBalance: number | null;
}

interface Props {
  open: boolean;
  saving: boolean;
  customer: Customer | null;
  paymentData: { amount: string; note: string; method: string };
  onClose: () => void;
  onChange: (data: { amount: string; note: string; method: string }) => void;
  onSubmit: (e: FormEvent) => void;
}

const methods = ["cash", "upi", "bank", "cheque"];

export function RecordPaymentModal({ open, saving, customer, paymentData, onClose, onChange, onSubmit }: Props) {
  const t = useTranslations("Khata");
  const dialogRef = useRef<HTMLDivElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const methodKey = (m: string) => `payment${m.charAt(0).toUpperCase() + m.slice(1)}` as const;
  const due = Math.max(0, safeNum(customer?.currentBalance));
  const advance = Math.max(0, -safeNum(customer?.currentBalance));

  useModalAccessibility({
    open,
    containerRef: dialogRef,
    initialFocusRef: amountRef,
    onClose,
    closeOnEscape: !saving,
  });

  if (!open) return null;

  return (
    <div className="glass-overlay">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-busy={saving}
        tabIndex={-1}
        className="glass-card glass-modal-panel max-w-md"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)]/50 p-4 sm:p-5">
          <h2 id={titleId} className="text-lg font-semibold text-[var(--foreground)]">{due > 0 ? t("recordPayment") : t("recordAdvance")}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="min-h-11 min-w-11 rounded-lg p-1.5 transition-colors hover:bg-[var(--foreground)]/5 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            aria-label={t("closeDialog")}
          >
            <X size={20} className="text-[var(--foreground)]/60" aria-hidden="true" />
          </button>
        </div>
        <p id={descriptionId} className="border-b border-[var(--border)]/50 px-4 py-3 text-xs leading-relaxed text-[var(--foreground)]/60 sm:px-5">{t("paymentModalHint")}</p>
        <form onSubmit={onSubmit} className="space-y-4 p-4 sm:p-5">
          <div className={`rounded-xl border p-4 ${due > 0 ? "border-[var(--color-warning)]/25 bg-[var(--color-warning)]/10" : "border-[var(--color-success)]/25 bg-[var(--color-success)]/10"}`}>
            <p className={`text-sm ${due > 0 ? "text-[var(--color-warning)]" : "text-[var(--color-success)]"}`}>
              {t("paymentFor")} <strong>{customer?.name}</strong>
            </p>
            {due > 0 ? (
              <p className="mt-1 text-lg font-bold text-[var(--color-warning)]">{t("currentDue")} · ₹{fmt(due)}</p>
            ) : (
              <>
                <p className="mt-1 text-lg font-bold text-[var(--color-success)]">{t("advanceBalance")} · ₹{fmt(advance)}</p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--color-success)]">{t("advancePaymentHint")}</p>
              </>
            )}
          </div>
          <div>
            <label htmlFor="khata-payment-amount" className="mb-1 block text-sm font-medium text-[var(--foreground)]/70">{t("paymentAmount")}</label>
            <input
              ref={amountRef}
              id="khata-payment-amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              required
              value={paymentData.amount}
              onChange={e => onChange({ ...paymentData, amount: e.target.value })}
              className="glass-input w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              placeholder="0.00"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={due <= 0 || saving}
                onClick={() => onChange({ ...paymentData, amount: String(due) })}
                className="min-h-11 rounded border border-[var(--border)] bg-[var(--foreground)]/5 px-3 py-1.5 text-xs text-[var(--foreground)]/70 transition-colors hover:bg-[var(--foreground)]/10 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              >
                {t("payFull")}
              </button>
              <button
                type="button"
                disabled={due <= 0 || saving}
                onClick={() => onChange({ ...paymentData, amount: (due / 2).toFixed(2) })}
                className="min-h-11 rounded border border-[var(--border)] bg-[var(--foreground)]/5 px-3 py-1.5 text-xs text-[var(--foreground)]/70 transition-colors hover:bg-[var(--foreground)]/10 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              >
                {t("payHalf")}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="khata-payment-method" className="mb-1 block text-sm font-medium text-[var(--foreground)]/70">{t("paymentMethod")}</label>
            <select id="khata-payment-method" value={paymentData.method} onChange={e => onChange({ ...paymentData, method: e.target.value })} className="glass-input w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]">
              {methods.map(m => <option key={m} value={m}>{t(methodKey(m))}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="khata-payment-note" className="mb-1 block text-sm font-medium text-[var(--foreground)]/70">{t("noteOptional")}</label>
            <input id="khata-payment-note" type="text" value={paymentData.note} onChange={e => onChange({ ...paymentData, note: e.target.value })} className="glass-input w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]" placeholder={t("notePlaceholderPayment")} />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} disabled={saving} className="glass-btn-secondary min-h-11 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]">{t("cancel")}</button>
            <button type="submit" disabled={saving} aria-busy={saving} className="glass-btn-primary min-h-11 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]">
              {saving ? t("processing") : due > 0 ? t("recordPayment") : t("recordAdvance")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
