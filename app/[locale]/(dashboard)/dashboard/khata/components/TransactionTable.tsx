"use client";

import { useTranslations } from "next-intl";
import { ArrowUpCircle, ArrowDownCircle, Trash2, Lock } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import { safeNum, fmt } from "../hooks/useKhata";

interface Transaction {
  id: string; type: "credit" | "debit"; amount: number;
  note: string | null; createdAt: Date | null;
  referenceInvoiceId: string | null; status?: string | null;
  runningBalance?: number;
}

interface Props {
  statement: Transaction[];
  loading: boolean;
  onDelete: (id: string) => void;
}

export function TransactionTable({ statement, loading, onDelete }: Props) {
  const t = useTranslations("Khata");

  return (
    <div className="glass-card overflow-hidden mt-6">
      <div className="p-6 border-b border-[var(--border)]/50">
        <h2 className="font-bold text-[var(--foreground)] text-xl">{t("transactionHistory")}</h2>
      </div>

      {loading ? (
        <div className="p-12 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin" />
        </div>
      ) : statement.length === 0 ? (
        <div className="p-12 text-center text-[var(--foreground)]/50 font-medium">{t("noTransactions")}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--foreground)]/5 border-b border-[var(--border)]/30">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-semibold text-[var(--foreground)]/70">{t("thDate")}</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-[var(--foreground)]/70">{t("thType")}</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-[var(--foreground)]/70">{t("thNote")}</th>
                <th className="px-5 py-4 text-right text-sm font-semibold text-[var(--foreground)]/70">{t("thAmount")}</th>
                <th className="px-5 py-4 text-right text-sm font-semibold text-[var(--foreground)]/70">{t("thBalance")}</th>
                <th className="px-5 py-4 text-left text-sm font-semibold text-[var(--foreground)]/70">{t("thActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]/30">
              {statement.map(txn => (
                <tr key={txn.id} className={`hover:bg-[var(--foreground)]/[0.02] transition-colors ${txn.status === "cancelled" ? "opacity-50" : ""}`}>
                  <td className="px-5 py-4 text-sm text-[var(--foreground)]/70">{formatDate(txn.createdAt)}</td>
                  <td className="px-5 py-4">
                    {txn.status === "cancelled" ? (
                      <span className="flex items-center gap-1.5 text-sm font-medium text-[var(--foreground)]/40 line-through">
                        {txn.type === "credit" ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}
                        {t("cancelled")}
                      </span>
                    ) : (
                      <span className={`flex items-center gap-1.5 text-sm font-medium ${txn.type === "credit" ? "text-[var(--color-warning)]" : "text-[var(--color-success)]"}`}>
                        {txn.type === "credit" ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}
                        {txn.type === "credit" ? t("saleAdded") : t("paymentReceived")}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-[var(--foreground)]/70">
                    {txn.status === "cancelled" ? <span className="line-through">{txn.note || "-"}</span> : txn.note || "-"}
                  </td>
                  <td className="px-5 py-4 text-right font-medium text-[var(--foreground)]">
                    {txn.status === "cancelled" ? (
                      <span className="line-through text-[var(--foreground)]/40">₹{fmt(txn.amount)}</span>
                    ) : <span>₹{fmt(txn.amount)}</span>}
                  </td>
                  <td className="px-5 py-4 text-right font-semibold">
                    {txn.status === "cancelled" ? (
                      <span className="text-[var(--foreground)]/40">-</span>
                    ) : (
                      <span className={safeNum(txn.runningBalance) >= 0 ? "text-[var(--color-warning)]" : "text-[var(--color-success)]"}>
                        {safeNum(txn.runningBalance) < 0 ? "-" : ""}₹{fmt(txn.runningBalance)}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {txn.status === "cancelled" ? (
                      <span className="text-xs text-[var(--foreground)]/40">{t("cancelled")}</span>
                    ) : txn.referenceInvoiceId ? (
                      <div className="relative group inline-block">
                        <button className="p-2.5 sm:p-1.5 text-[var(--foreground)]/20 cursor-not-allowed" title={t("cannotDelete")}>
                          <Lock size={16} />
                        </button>
                        <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-48 p-3 bg-black/90 backdrop-blur-xl text-white text-xs rounded-xl z-10 border border-white/10 shadow-xl">
                          {t("cannotDeleteHint")}
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => onDelete(txn.id)} className="p-2.5 sm:p-1.5 text-[var(--foreground)]/40 hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 rounded-lg transition-colors" aria-label="Delete transaction">
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
}
