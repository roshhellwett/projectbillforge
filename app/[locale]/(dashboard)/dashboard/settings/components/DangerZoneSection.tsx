"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, X } from "lucide-react";
import { resetAllKhataData, getResetAllKhataSummary } from "@/lib/actions/business";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "@/i18n/routing";

export function DangerZoneSection() {
  const t = useTranslations("Settings");
  const { addToast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [summary, setSummary] = useState<{ customer_count: number; invoice_count: number; total_balance: number } | null>(null);

  useEffect(() => {
    if (open) {
      setConsentChecked(false);
      setSummary(null);
      getResetAllKhataSummary().then(r => {
        if ('success' in r && r.success) setSummary(r);
      });
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!consentChecked) return;
    setLoading(true);
    const result = await resetAllKhataData(true);
    if ('error' in result) {
      addToast(result.error!, "error");
    } else {
      addToast(`Reset complete: ${result.totalCustomers} customer(s), ${result.totalInvoices} invoice(s), ₹${Number(result.totalBalance).toFixed(2)} total`, "success");
      setOpen(false);
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <>
      <div className="glass-card p-8 border border-[var(--color-danger)]/10">
        <h2 className="text-xl font-bold text-[var(--color-danger)] mb-2">{t("dangerZone")}</h2>
        <p className="text-sm font-medium text-[var(--foreground)]/60 mb-6">{t("dangerDescription")}</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-6 py-3.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold rounded-full hover:brightness-110 transition-all hover:-translate-y-1"
        >
          {t("resetButton")}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full border border-[var(--border)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-elevated)]">
              <div className="flex items-center gap-2">
                <AlertTriangle size={20} className="text-[var(--foreground)]" />
                <h2 className="text-lg font-bold text-[var(--foreground)]">Reset All Khata Data</h2>
              </div>
              <button onClick={() => { setOpen(false); setConsentChecked(false); }} className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
                <X size={20} className="text-[var(--foreground)]" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                You are about to reset khata for <span className="text-[var(--foreground)] font-bold">all customers</span>
              </p>

              {summary && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-[var(--foreground)]">{summary.customer_count}</p>
                    <p className="text-xs text-[var(--foreground)]/60">Customers</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-[var(--foreground)]">{summary.invoice_count}</p>
                    <p className="text-xs text-[var(--foreground)]/60">Invoices</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-[var(--foreground)]">₹{Number(summary.total_balance).toFixed(2)}</p>
                    <p className="text-xs text-[var(--foreground)]/60">Total Balance</p>
                  </div>
                </div>
              )}

              <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl p-4 space-y-2 text-sm">
                <p className="font-bold text-[var(--foreground)]">What will happen:</p>
                <ul className="space-y-1.5 text-[var(--foreground)]/80 list-disc list-inside">
                  <li>All active invoices across <span className="font-bold">all customers</span> will be <span className="font-bold">permanently deleted</span>.</li>
                  <li>Each customer's outstanding balance will remain as a single lump sum.</li>
                  <li>Partial payments on individual invoices won't be possible after reset.</li>
                  <li>Customers' credit limits and khata transaction history are preserved.</li>
                  <li>Product stock will <span className="font-bold">not</span> be reversed.</li>
                </ul>
                <p className="font-bold text-[var(--foreground)] mt-2">This cannot be undone.</p>
              </div>

              <label className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={e => setConsentChecked(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-zinc-900 focus:ring-zinc-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  I understand these consequences and want to proceed with resetting khata data for all customers.
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-elevated)]/50">
              <button onClick={() => { setOpen(false); setConsentChecked(false); }} className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!consentChecked || loading}
                className="px-5 py-2 text-sm font-bold rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {loading ? "Resetting..." : "Reset All Khata Data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}