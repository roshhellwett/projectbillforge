"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { X, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { useModalAccessibility } from "@/components/ui/ui";

interface Props {
  open: boolean;
  customerName: string;
  customerBalance: number;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ResetKhataModal({ open, customerName, customerBalance, loading, onClose, onConfirm }: Props) {
  const t = useTranslations("Khata");
  const [consentChecked, setConsentChecked] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const consentId = useId();

  useEffect(() => {
    if (open) setConsentChecked(false);
  }, [open]);

  useModalAccessibility({
    open,
    containerRef: dialogRef,
    initialFocusRef: cancelButtonRef,
    onClose,
    closeOnEscape: !loading,
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
        aria-busy={loading}
        tabIndex={-1}
        className="white-container max-h-[calc(100dvh-4rem)] w-full max-w-lg overflow-y-auto border border-[var(--border)] shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-elevated)] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-[var(--color-warning)]" aria-hidden="true" />
            <h2 id={titleId} className="text-lg font-bold text-[var(--foreground)]">{t("resetTitle")}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="min-h-11 min-w-11 rounded-lg p-1 transition-colors hover:bg-[var(--foreground)]/5 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            aria-label={t("resetClose")}
          >
            <X size={20} className="text-[var(--foreground)]" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5 sm:px-6">
          <p id={descriptionId} className="text-sm font-semibold leading-relaxed text-[var(--foreground)]">
            {t("resetDescription", { customerName })}
          </p>

          <div className="rounded-xl border border-[var(--color-warning)]/25 bg-[var(--color-warning)]/10 p-4 text-sm">
            <p className="font-bold text-[var(--foreground)]">{t("resetWhatHappens")}</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 leading-relaxed text-[var(--foreground)]/80">
              <li>{t("resetArchiveInvoices")}</li>
              <li>{t("resetCancelTransactions")}</li>
              <li>{t("resetZeroBalance")} ({t("resetCurrentBalance", { amount: formatCurrency(customerBalance) })})</li>
              <li>{t("resetRecordRetained")}</li>
              <li>{t("resetStockUnchanged")}</li>
            </ul>
            <p className="mt-3 font-bold text-[var(--foreground)]">{t("resetCannotUndo")}</p>
          </div>

          <label htmlFor={consentId} className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3">
            <input
              id={consentId}
              type="checkbox"
              checked={consentChecked}
              onChange={e => setConsentChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-zinc-900 focus:ring-2 focus:ring-[var(--color-primary)]"
            />
            <span className="text-sm font-medium leading-relaxed text-[var(--foreground)]/80">{t("resetAcknowledgement")}</span>
          </label>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] bg-[var(--surface-elevated)]/50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button ref={cancelButtonRef} type="button" onClick={onClose} disabled={loading} className="glass-btn-secondary min-h-11 px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]">{t("resetCancel")}</button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!consentChecked || loading}
            aria-busy={loading}
            className="min-h-11 rounded-xl bg-zinc-900 px-5 py-2 text-sm font-bold text-white shadow-sm transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] dark:bg-zinc-100 dark:text-zinc-900"
          >
            {loading ? t("resetProcessing") : t("resetConfirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
