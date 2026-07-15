"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { X, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface Props {
  open: boolean;
  customerName: string;
  customerBalance: number;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ResetKhataModal({ open, customerName, customerBalance, loading, onClose, onConfirm }: Props) {
  const [consentChecked, setConsentChecked] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full border border-[var(--border)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-elevated)]">
          <div className="flex items-center gap-2">
            <AlertTriangle size={20} className="text-[var(--foreground)]" />
            <h2 className="text-lg font-bold text-[var(--foreground)]">Reset Khata</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
            <X size={20} className="text-[var(--foreground)]" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            You are about to reset khata for <span className="text-[var(--foreground)] font-bold">{customerName}</span>
          </p>

          <div className="bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl p-4 space-y-2 text-sm">
            <p className="font-bold text-[var(--foreground)]">What will happen:</p>
            <ul className="space-y-1.5 text-[var(--foreground)]/80 list-disc list-inside">
              <li>All active invoices for this customer will be <span className="font-bold">permanently deleted</span>.</li>
              <li>The outstanding balance of <span className="font-bold">{formatCurrency(customerBalance)}</span> will remain as a single lump sum.</li>
              <li>Partial payments on individual invoices won't be possible after reset.</li>
              <li>The customer's credit limit and khata transaction history are preserved.</li>
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
              I understand these consequences and want to proceed with resetting this customer's khata.
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-elevated)]/50">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!consentChecked || loading}
            className="px-5 py-2 text-sm font-bold rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {loading ? "Resetting..." : "Reset Khata"}
          </button>
        </div>
      </div>
    </div>
  );
}
