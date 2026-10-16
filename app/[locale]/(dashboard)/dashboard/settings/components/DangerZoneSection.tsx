"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, X } from "lucide-react";
import { resetAllKhataData, getResetAllKhataSummary } from "@/lib/actions/business";
import { useToast } from "@/components/ui/Toast";
import { useModalAccessibility } from "@/components/ui/ui";
import { useRouter } from "@/i18n/routing";

const RESET_CONFIRMATION_PHRASE = "RESET ALL KHATA DATA";

type ResetSummary = {
  customer_count: number;
  invoice_count: number;
  total_balance: number;
};

export function DangerZoneSection() {
  const t = useTranslations("Settings");
  const { addToast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [confirmationPhrase, setConfirmationPhrase] = useState("");
  const [summary, setSummary] = useState<ResetSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryLoadFailed, setSummaryLoadFailed] = useState(false);
  const [summaryRetryKey, setSummaryRetryKey] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmationInputRef = useRef<HTMLInputElement>(null);
  const dialogTitleId = useId();
  const dialogDescriptionId = useId();
  const acknowledgementId = useId();
  const confirmationInputId = useId();
  const confirmationHintId = useId();

  const closeDialog = () => {
    if (loading) return;

    setOpen(false);
    setConsentChecked(false);
    setConfirmationPhrase("");
    setActionError(null);
  };

  useModalAccessibility({
    open,
    containerRef: dialogRef,
    initialFocusRef: confirmationInputRef,
    onClose: closeDialog,
    closeOnEscape: !loading,
  });

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setConsentChecked(false);
    setConfirmationPhrase("");
    setSummary(null);
    setSummaryLoading(true);
    setSummaryLoadFailed(false);
    setActionError(null);

    void getResetAllKhataSummary()
      .then(result => {
        if (cancelled) return;

        if ("success" in result && result.success) {
          setSummary({
            customer_count: result.customer_count,
            invoice_count: result.invoice_count,
            total_balance: result.total_balance,
          });
        } else {
          setSummaryLoadFailed(true);
        }
      })
      .catch(() => {
        if (!cancelled) setSummaryLoadFailed(true);
      })
      .finally(() => {
        if (!cancelled) setSummaryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, summaryRetryKey]);

  const confirmationPhraseMatches = confirmationPhrase.trim() === RESET_CONFIRMATION_PHRASE;
  const summaryLoadedSuccessfully = Boolean(summary) && !summaryLoading && !summaryLoadFailed;
  const canConfirm = summaryLoadedSuccessfully && consentChecked && confirmationPhraseMatches && !loading;

  const handleConfirm = async () => {
    if (!canConfirm) return;

    setLoading(true);
    setActionError(null);

    try {
      const result = await resetAllKhataData(true);

      if ("error" in result) {
        const errorMessage = t("resetError");
        setActionError(errorMessage);
        addToast(errorMessage, "error");
        return;
      }

      addToast(
        t("resetSuccess", {
          totalCustomers: result.totalCustomers,
          totalInvoices: result.totalInvoices,
          totalBalance: Number(result.totalBalance).toFixed(2),
        }),
        "success",
      );
      setOpen(false);
      setConsentChecked(false);
      setConfirmationPhrase("");
      router.refresh();
    } catch {
      const errorMessage = t("resetError");
      setActionError(errorMessage);
      addToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section aria-labelledby="danger-zone-title" className="glass-card p-5 sm:p-8 border border-[var(--color-danger)]/10">
        <h2 id="danger-zone-title" className="text-xl font-bold text-[var(--color-danger)] mb-2">{t("dangerZone")}</h2>
        <p className="text-sm font-medium text-[var(--foreground)]/60 mb-6">{t("dangerDescription")}</p>
        <p className="text-xs leading-relaxed text-[var(--foreground)]/55 mb-6">{t("resetScopeNote")}</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="min-h-11 px-6 py-3.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold rounded-full hover:brightness-110 transition-all hover:-translate-y-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
        >
          {t("resetButton")}
        </button>
      </section>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            aria-describedby={dialogDescriptionId}
            aria-busy={loading || summaryLoading}
            tabIndex={-1}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[calc(100dvh-2rem)] max-w-lg w-full overflow-y-auto border border-[var(--border)]"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-elevated)]">
              <div className="flex items-center gap-2">
                <AlertTriangle aria-hidden="true" size={20} className="text-[var(--foreground)]" />
                <h2 id={dialogTitleId} className="text-lg font-bold text-[var(--foreground)]">{t("resetDialogTitle")}</h2>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                disabled={loading}
                aria-label={t("resetCloseDialog")}
                className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              >
                <X aria-hidden="true" size={20} className="text-[var(--foreground)]" />
              </button>
            </div>

            <form
              onSubmit={event => {
                event.preventDefault();
                void handleConfirm();
              }}
            >
              <div className="px-6 py-5 space-y-4">
                <p id={dialogDescriptionId} className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {t("resetDialogDescription")}
                </p>

                {summaryLoading || (!summary && !summaryLoadFailed) ? (
                  <p role="status" className="rounded-xl border border-[var(--border)] bg-gray-50 dark:bg-gray-800/50 p-4 text-sm text-[var(--foreground)]/70">
                    {t("resetSummaryLoading")}
                  </p>
                ) : summaryLoadFailed ? (
                  <div role="alert" className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-4 space-y-3">
                    <p className="text-sm text-[var(--foreground)]">{t("resetSummaryError")}</p>
                    <button
                      type="button"
                      onClick={() => setSummaryRetryKey(value => value + 1)}
                      className="min-h-11 text-sm font-bold text-[var(--foreground)] underline underline-offset-4 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                    >
                      {t("resetRetrySummary")}
                    </button>
                  </div>
                ) : summary ? (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-[var(--foreground)]">{summary.customer_count}</p>
                      <p className="text-xs text-[var(--foreground)]/60">{t("resetSummaryCustomers")}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-[var(--foreground)]">{summary.invoice_count}</p>
                      <p className="text-xs text-[var(--foreground)]/60">{t("resetSummaryInvoices")}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-[var(--foreground)]">{t("resetSummaryBalanceValue", { amount: Number(summary.total_balance).toFixed(2) })}</p>
                      <p className="text-xs text-[var(--foreground)]/60">{t("resetSummaryBalance")}</p>
                    </div>
                  </div>
                ) : null}

                <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl p-4 space-y-2 text-sm">
                  <p className="font-bold text-[var(--foreground)]">{t("resetWhatHappens")}</p>
                  <ul className="space-y-1.5 text-[var(--foreground)]/80 list-disc list-inside">
                    <li>{t("resetArchiveInvoices")}</li>
                    <li>{t("resetCancelTransactions")}</li>
                    <li>{t("resetZeroBalances")}</li>
                    <li>{t("resetRecordRetained")}</li>
                    <li>{t("resetStockUnchanged")}</li>
                  </ul>
                  <p className="font-bold text-[var(--foreground)] mt-2">{t("resetCannotUndo")}</p>
                </div>

                <label htmlFor={acknowledgementId} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl cursor-pointer">
                  <input
                    id={acknowledgementId}
                    type="checkbox"
                    checked={consentChecked}
                    onChange={event => setConsentChecked(event.target.checked)}
                    disabled={loading}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-zinc-900 focus:ring-zinc-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {t("resetAcknowledgement")}
                  </span>
                </label>

                <div className="space-y-2">
                  <label htmlFor={confirmationInputId} className="block text-sm font-bold text-[var(--foreground)]">
                    {t("resetPhraseLabel", { phrase: RESET_CONFIRMATION_PHRASE })}
                  </label>
                  <input
                    ref={confirmationInputRef}
                    id={confirmationInputId}
                    type="text"
                    value={confirmationPhrase}
                    onChange={event => setConfirmationPhrase(event.target.value)}
                    placeholder={t("resetPhrasePlaceholder")}
                    autoComplete="off"
                    spellCheck={false}
                    disabled={loading}
                    aria-describedby={confirmationHintId}
                    aria-invalid={confirmationPhrase.length > 0 && !confirmationPhraseMatches}
                    className={`w-full rounded-xl border bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)] focus:ring-2 focus:ring-[var(--foreground)]/20 disabled:opacity-50 ${confirmationPhrase.length > 0 && !confirmationPhraseMatches ? "border-[var(--color-danger)]" : "border-[var(--border)]"}`}
                  />
                  <p id={confirmationHintId} className="text-xs text-[var(--foreground)]/60">
                    {t("resetPhraseHint")}
                  </p>
                </div>

                {actionError && (
                  <p role="alert" className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-3 text-sm text-[var(--foreground)]">
                    {actionError}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-elevated)]/50">
                <button
                  type="button"
                  onClick={closeDialog}
                  disabled={loading}
                  className="min-h-11 px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                >
                  {t("resetCancel")}
                </button>
                <button
                  type="submit"
                  disabled={!canConfirm}
                  aria-busy={loading}
                  className="min-h-11 px-5 py-2 text-sm font-bold rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
                >
                  {loading ? t("resetProcessing") : t("resetConfirm")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
