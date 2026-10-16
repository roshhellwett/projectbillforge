"use client";

import { useId, useRef, type FormEvent } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useModalAccessibility } from "@/components/ui/ui";

interface Props {
  open: boolean;
  saving: boolean;
  formData: { type: "credit" | "debit"; amount: string; note: string };
  onClose: () => void;
  onChange: (data: { type: "credit" | "debit"; amount: string; note: string }) => void;
  onSubmit: (e: FormEvent) => void;
}

export function AddTransactionModal({ open, saving, formData, onClose, onChange, onSubmit }: Props) {
  const t = useTranslations("Khata");
  const dialogRef = useRef<HTMLDivElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const descriptionId = useId();

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
          <h2 id={titleId} className="text-lg font-semibold text-[var(--foreground)]">{t("addTransaction")}</h2>
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
        <p id={descriptionId} className="border-b border-[var(--border)]/50 px-4 py-3 text-xs leading-relaxed text-[var(--foreground)]/60 sm:px-5">{t("transactionModalHint")}</p>
        <form onSubmit={onSubmit} className="space-y-4 p-4 sm:p-5">
          <fieldset>
            <legend className="mb-2 block text-sm font-medium text-[var(--foreground)]/70">{t("transactionType")}</legend>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                aria-pressed={formData.type === "credit"}
                onClick={() => onChange({ ...formData, type: "credit" })}
                className={`min-h-11 flex-1 rounded-xl border-2 px-3 py-2 font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${formData.type === "credit" ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900" : "border-[var(--border)] text-[var(--foreground)]/70 hover:text-[var(--foreground)]"}`}
              >
                {t("saleOption")}
              </button>
              <button
                type="button"
                aria-pressed={formData.type === "debit"}
                onClick={() => onChange({ ...formData, type: "debit" })}
                className={`min-h-11 flex-1 rounded-xl border-2 px-3 py-2 font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${formData.type === "debit" ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900" : "border-[var(--border)] text-[var(--foreground)]/70 hover:text-[var(--foreground)]"}`}
              >
                {t("paymentOption")}
              </button>
            </div>
          </fieldset>
          <div>
            <label htmlFor="khata-transaction-amount" className="mb-1 block text-sm font-medium text-[var(--foreground)]/70">{t("amountLabel")}</label>
            <input
              ref={amountRef}
              id="khata-transaction-amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              required
              value={formData.amount}
              onChange={e => onChange({ ...formData, amount: e.target.value })}
              className="glass-input w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            />
          </div>
          <div>
            <label htmlFor="khata-transaction-note" className="mb-1 block text-sm font-medium text-[var(--foreground)]/70">{t("noteOptional")}</label>
            <input
              id="khata-transaction-note"
              type="text"
              value={formData.note}
              onChange={e => onChange({ ...formData, note: e.target.value })}
              className="glass-input w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              placeholder={t("notePlaceholderSale")}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} disabled={saving} className="glass-btn-secondary min-h-11 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]">{t("cancel")}</button>
            <button type="submit" disabled={saving} aria-busy={saving} className="glass-btn-primary min-h-11 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]">
              {saving ? t("saving") : t("addTransactionBtn")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
