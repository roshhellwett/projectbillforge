"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { ArrowUpCircle, ArrowDownCircle, Trash2, Lock, History } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import { safeNum, fmt } from "../hooks/useKhata";

interface Transaction {
  id: string; type: "credit" | "debit"; amount: number;
  note: string | null; createdAt: Date | null;
  referenceInvoiceId: string | null; status?: string | null;
  paymentMethod?: string | null;
  runningBalance?: number;
}

interface Props {
  statement: Transaction[];
  loading: boolean;
  onDelete: (id: string) => void;
}

export const TransactionTable = React.memo(function TransactionTable({ statement, loading, onDelete }: Props) {
  const t = useTranslations("Khata");

  return (
    <div className="glass-card overflow-hidden mt-6 card-hover-lift border border-[var(--border)]">
      <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <History size={18} />
          </div>
          <h2 className="font-extrabold text-[var(--foreground)] text-lg tracking-tight">
            {t("transactionHistory")}
          </h2>
        </div>
        <span className="badge badge-success text-[10px]">Cloud Ledger Audit</span>
      </div>

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin" />
          <span className="text-xs font-semibold text-[var(--foreground)]/60">Syncing ledger entries...</span>
        </div>
      ) : statement.length === 0 ? (
        <div className="p-16 text-center text-[var(--foreground)]/50 font-semibold text-sm flex flex-col items-center justify-center">
          <History size={32} className="opacity-30 mb-2" />
          <span>{t("noTransactions")}</span>
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[650px] border-collapse">
            <thead className="bg-[var(--surface-elevated)] border-b border-[var(--border)]">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
                  {t("thDate")}
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
                  {t("thType")}
                </th>
                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
                  {t("thNote")}
                </th>
                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
                  {t("thAmount")}
                </th>
                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
                  {t("thBalance")}
                </th>
                <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
                  {t("thActions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
              {statement.map(txn => (
                <tr
                  key={txn.id}
                  className={`hover:bg-[var(--surface-hover)] transition-colors duration-150 ${
                    txn.status === "cancelled" ? "opacity-50 bg-[var(--surface-elevated)]/30" : ""
                  }`}
                >
                  <td className="px-5 py-4 text-xs font-medium text-[var(--foreground)]/70">
                    {formatDate(txn.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    {txn.status === "cancelled" ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-[var(--foreground)]/60 border border-zinc-300 dark:border-zinc-700 line-through">
                        <ArrowUpCircle size={15} /> {t("cancelled")}
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${
                          txn.type === "credit"
                            ? "bg-zinc-200 dark:bg-zinc-800 text-[var(--foreground)] border-zinc-300 dark:border-zinc-700"
                            : "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-800 dark:border-zinc-200"
                        }`}
                      >
                        {txn.type === "credit" ? <ArrowUpCircle size={15} /> : <ArrowDownCircle size={15} />}
                        {txn.type === "credit" ? t("saleAdded") : t("paymentReceived")}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs font-medium text-[var(--foreground)]/80">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={txn.status === "cancelled" ? "line-through text-[var(--foreground)]/40" : ""}>
                        {txn.note || "Standard Entry"}
                      </span>
                      {txn.paymentMethod && txn.status !== "cancelled" && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--color-primary)]">
                          {txn.paymentMethod}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right font-black font-mono text-sm text-[var(--foreground)]">
                    {txn.status === "cancelled" ? (
                      <span className="line-through text-[var(--foreground)]/40">₹{fmt(txn.amount)}</span>
                    ) : (
                      <span>₹{fmt(txn.amount)}</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right font-bold font-mono text-sm">
                    {txn.status === "cancelled" ? (
                      <span className="text-[var(--foreground)]/40">—</span>
                    ) : (
                      <span
                        className={
                          safeNum(txn.runningBalance) >= 0 ? "text-[var(--color-warning)]" : "text-[var(--color-success)]"
                        }
                      >
                        {safeNum(txn.runningBalance) < 0 ? "-" : ""}₹{fmt(txn.runningBalance)}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {txn.status === "cancelled" ? (
                      <span className="text-[10px] font-mono text-[var(--foreground)]/40">{t("cancelled")}</span>
                    ) : txn.referenceInvoiceId ? (
                      <div className="relative group inline-block">
                        <button className="p-2 text-[var(--foreground)]/30 cursor-not-allowed rounded-xl flex items-center justify-center" title={t("cannotDelete")}>
                          <Lock size={15} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onDelete(txn.id)}
                        className="p-2 text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center ml-auto"
                        aria-label="Delete transaction"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});
