"use client";

import { useCallback } from "react";
import React from "react";
import { useTranslations } from "next-intl";
import { FadeIn } from "@/components/ui/MotionWrapper";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { safeNum, fmt } from "../hooks/useKhata";

interface Customer {
  id: string; name: string; phone: string | null;
  currentBalance: number | null; creditLimit?: number | null;
}

interface ResetRecord {
  id: string;
  resetDate: Date | string | null;
  amountReset: number;
  invoiceCount: number;
  createdAt?: Date | string | null;
}

interface Props {
  customer: Customer;
  accruedFines: number;
  resetHistory: ResetRecord[];
  onRecordPayment: () => void;
  onCollectFines?: () => void;
  onResetKhata: () => void;
}

export const CustomerInfoCards = React.memo(function CustomerInfoCards({ customer, accruedFines, resetHistory, onRecordPayment, onCollectFines, onResetKhata }: Props) {
  const t = useTranslations("Khata");
  const bal = safeNum(customer.currentBalance);
  const creditLimit = safeNum(customer.creditLimit);
  const used = Math.max(0, bal);
  const available = Math.max(0, creditLimit - used);
  const utilPct = creditLimit > 0 ? Math.round((used / creditLimit) * 100) : 0;
  const isUtilWarning = utilPct > 80;
  const isUtilDanger = utilPct >= 100;
  const utilColor = isUtilDanger ? "var(--color-danger)" : isUtilWarning ? "var(--color-warning)" : "var(--color-success)";
  const badgeClass = isUtilDanger ? "bg-red-500/10 text-red-500 border-red-500/20" : isUtilWarning ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";

  return (
    <FadeIn delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      <div className="glass-card p-6 hover:-translate-y-1 transition-all">
        <p className="text-sm font-semibold text-[var(--foreground)]/60 mb-1">{t("customerName")}</p>
        <p className="text-2xl font-bold text-[var(--foreground)] tracking-tight">{customer.name}</p>
      </div>
      <div className="glass-card p-6 hover:-translate-y-1 transition-all">
        <p className="text-sm font-semibold text-[var(--foreground)]/60 mb-1">{t("phone")}</p>
        <p className="text-2xl font-bold text-[var(--foreground)] tracking-tight">{customer.phone || "-"}</p>
      </div>
      <div className="glass-card p-6 hover:-translate-y-1 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]/60">{bal > 0 ? t("totalOwed") : bal < 0 ? t("creditBalance") : t("totalOwed")}</p>
            <p className={`text-2xl font-bold mt-1 tracking-tight ${bal > 0 ? "text-[var(--color-warning)]" : bal < 0 ? "text-[var(--color-success)]" : "text-[var(--foreground)]/60"}`}>
              {bal < 0 ? "-" : ""}₹{fmt(customer.currentBalance)}
            </p>
          </div>
          {bal > 0 ? (
            <button onClick={onRecordPayment} className="px-4 py-2 bg-[var(--color-success)] text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity shadow-sm">
              {t("recordPayment")}
            </button>
          ) : bal < 0 ? (
            <span className="px-4 py-2 bg-[var(--color-success)]/10 text-[var(--color-success)] text-sm font-medium rounded-xl border border-[var(--color-success)]/20 whitespace-nowrap">
              {t("customerCredit")}
            </span>
          ) : null}
        </div>
      </div>
      {creditLimit > 0 && (<>
        <div className="glass-card p-6 hover:-translate-y-1 transition-all">
          <p className="text-sm font-semibold text-[var(--foreground)]/60 mb-1">{t("creditLimit")}</p>
          <p className="text-2xl font-bold text-[var(--foreground)] tracking-tight">₹{fmt(customer.creditLimit)}</p>
        </div>
        <div className={`glass-card p-6 hover:-translate-y-1 transition-all ${isUtilDanger ? "bg-red-500/5 border-red-500/10" : isUtilWarning ? "bg-amber-500/5 border-amber-500/10" : "bg-emerald-500/5 border-emerald-500/10"}`}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold" style={{ color: utilColor }}>{t("availableCredit")}</p>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${badgeClass}`}>{utilPct}%</span>
          </div>
          <p className="text-2xl font-bold tracking-tight" style={{ color: utilColor }}>₹{fmt(available)}</p>
        </div>
      </>)}
      {accruedFines > 0 && (
        <div className="bg-[var(--color-danger)]/5 backdrop-blur-3xl p-6 rounded-3xl border border-[var(--color-danger)]/20 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-danger)]/80">{t("accruedFines")}</p>
              <p className="text-2xl font-bold text-[var(--color-danger)] mt-1 tracking-tight">{formatCurrency(accruedFines)}</p>
            </div>
            {onCollectFines && (
              <button onClick={onCollectFines} className="px-4 py-2 bg-[var(--color-danger)] text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity shadow-sm">
                {t("collectFines")}
              </button>
            )}
          </div>
        </div>
      )}
      {bal > 0 && (
        <FadeIn delay={0.2} className="md:col-span-3">
          <div className="glass-card p-5 border border-red-200/50 dark:border-red-900/30">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm font-bold text-red-600 dark:text-red-400">Reset Khata</p>
                <p className="text-xs text-[var(--foreground)]/50 mt-0.5">Delete all invoices and keep the balance as a lump sum</p>
              </div>
              <button onClick={onResetKhata} className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm">
                Reset Khata
              </button>
            </div>
            {resetHistory.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <p className="text-xs font-semibold text-[var(--foreground)]/50 uppercase tracking-wider mb-2">Reset History</p>
                <div className="space-y-1.5">
                  {resetHistory.map(r => (
                    <div key={r.id} className="flex items-center justify-between text-xs text-[var(--foreground)]/70">
                      <span>{new Date(r.resetDate ?? new Date()).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      <span className="font-medium">₹{fmt(r.amountReset)} — {r.invoiceCount} invoice{r.invoiceCount !== 1 ? "s" : ""}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </FadeIn>
      )}
    </FadeIn>
  );
});
