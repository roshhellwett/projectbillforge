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
          className="px-6 py-3.5 bg-[var(--color-danger)]/10 text-[var(--color-danger)] font-bold rounded-full hover:bg-[var(--color-danger)] hover:text-white transition-all hover:-translate-y-1"
        >
          {t("resetButton")}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full border border-red-200 dark:border-red-900/50 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-950/30">
              <div className="flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-600" />
                <h2 className="text-lg font-bold text-red-800 dark:text-red-400">Reset All Khata Data</h2>
              </div>
              <button onClick={() => { setOpen(false); setConsentChecked(false); }} className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
                <X size={20} className="text-red-600" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                You are about to reset khata for <span className="text-red-600">all customers</span>
              </p>

              {summary && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-[var(--color-danger)]">{summary.customer_count}</p>
                    <p className="text-xs text-[var(--foreground)]/60">Customers</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-[var(--color-danger)]">{summary.invoice_count}</p>
                    <p className="text-xs text-[var(--foreground)]/60">Invoices</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-[var(--color-danger)]">₹{Number(summary.total_balance).toFixed(2)}</p>
                    <p className="text-xs text-[var(--foreground)]/60">Total Balance</p>
                  </div>
                </div>
              )}

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-4 space-y-2 text-sm">
                <p className="font-bold text-amber-800 dark:text-amber-400">What will happen:</p>
                <ul className="space-y-1.5 text-amber-700 dark:text-amber-300 list-disc list-inside">
                  <li>All active invoices across <span className="font-bold">all customers</span> will be <span className="font-bold">permanently deleted</span>.</li>
                  <li>Each customer's outstanding balance will remain as a single lump sum.</li>
                  <li>Partial payments on individual invoices won't be possible after reset.</li>
                  <li>Customers' credit limits and khata transaction history are preserved.</li>
                  <li>Product stock will <span className="font-bold">not</span> be reversed.</li>
                </ul>
                <p className="font-bold text-red-600 dark:text-red-400 mt-2">This cannot be undone.</p>
              </div>

              <label className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={e => setConsentChecked(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  I understand these consequences and want to proceed with resetting khata data for all customers.
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/20">
              <button onClick={() => { setOpen(false); setConsentChecked(false); }} className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!consentChecked || loading}
                className="px-5 py-2 text-sm font-bold rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
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