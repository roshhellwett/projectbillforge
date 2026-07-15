"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { FadeIn } from "@/components/ui/MotionWrapper";
import { formatCurrency } from "@/lib/formatters";
import { safeNum, fmt } from "../hooks/useKhata";
import { User, Phone, Wallet, ShieldAlert, Sparkles, RefreshCcw } from "lucide-react";

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
  const badgeClass = isUtilDanger ? "badge badge-danger" : isUtilWarning ? "badge badge-warning" : "badge badge-success";

  return (
    <FadeIn delay={0.1} className="space-y-6 mt-6">
      {/* Primary Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="glass-card p-6 card-hover-lift flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <User size={18} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
              {t("customerName")}
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[var(--foreground)] tracking-tight truncate">
            {customer.name}
          </p>
        </div>

        <div className="glass-card p-6 card-hover-lift flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)]">
              <Phone size={18} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
              {t("phone")}
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-mono font-bold text-[var(--foreground)] tracking-tight truncate">
            {customer.phone || "No Contact"}
          </p>
        </div>

        <div className="glass-card p-6 card-hover-lift flex flex-col justify-between sm:col-span-2 lg:col-span-1 border border-[var(--color-primary)]/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)]">
                <Wallet size={18} />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
                {bal > 0 ? t("totalOwed") : bal < 0 ? t("creditBalance") : t("totalOwed")}
              </span>
            </div>
            {bal > 0 && <span className="badge badge-warning">Udhaar Active</span>}
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <p
              className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                bal > 0
                  ? "text-[var(--color-warning)]"
                  : bal < 0
                  ? "text-[var(--color-success)]"
                  : "text-[var(--foreground)]"
              }`}
            >
              {bal < 0 ? "-" : ""}₹{fmt(customer.currentBalance)}
            </p>

            {bal > 0 ? (
              <button
                onClick={onRecordPayment}
                className="px-5 py-2.5 bg-zinc-900 dark:bg-zinc-100 hover:brightness-110 text-white dark:text-zinc-900 text-xs font-extrabold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
              >
                <Sparkles size={14} /> {t("recordPayment")}
              </button>
            ) : bal < 0 ? (
              <span className="px-3 py-1.5 rounded-xl bg-[var(--color-success)]/15 text-[var(--color-success)] text-xs font-bold border border-[var(--color-success)]/20">
                {t("customerCredit")}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Credit Limit & Utilization Row */}
      {creditLimit > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="glass-card p-6 card-hover-lift flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60 mb-2 block">
              {t("creditLimit")}
            </span>
            <p className="text-2xl font-black font-mono text-[var(--foreground)]">₹{fmt(customer.creditLimit)}</p>
          </div>

          <div className="glass-card p-6 card-hover-lift flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
                {t("availableCredit")}
              </span>
              <span className={badgeClass}>{utilPct}% Utilized</span>
            </div>
            <p className="text-2xl font-black font-mono text-[var(--foreground)]">₹{fmt(available)}</p>
            <div className="w-full bg-[var(--surface-elevated)] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isUtilDanger ? "bg-zinc-900 dark:bg-zinc-100" : isUtilWarning ? "bg-zinc-600 dark:bg-zinc-400" : "bg-zinc-300 dark:bg-zinc-700"
                }`}
                style={{ width: `${Math.min(utilPct, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Accrued Fines Card */}
      {accruedFines > 0 && (
        <div className="p-6 rounded-3xl bg-[var(--surface-elevated)] border border-[var(--border)] shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-zinc-200 dark:bg-zinc-800 text-[var(--foreground)] shrink-0">
              <ShieldAlert size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">{t("accruedFines")}</p>
              <p className="text-2xl sm:text-3xl font-black font-mono text-[var(--foreground)] mt-0.5">
                {formatCurrency(accruedFines)}
              </p>
            </div>
          </div>
          {onCollectFines && (
            <button
              onClick={onCollectFines}
              className="px-6 py-3 bg-zinc-900 dark:bg-zinc-100 hover:brightness-110 text-white dark:text-zinc-900 font-extrabold text-sm rounded-xl shadow-md transition-all active:scale-95"
            >
              {t("collectFines")}
            </button>
          )}
        </div>
      )}

      {/* Reset Khata Section */}
      {bal > 0 && (
        <div className="glass-card p-6 border border-[var(--border)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <RefreshCcw size={16} className="text-[var(--foreground)]" />
                <h3 className="text-sm font-extrabold text-[var(--foreground)] uppercase tracking-wide">
                  Reset Khata Ledger
                </h3>
              </div>
              <p className="text-xs text-[var(--foreground)]/60 mt-1">
                Delete historical invoices while consolidating the existing balance into a clean single lump-sum entry.
              </p>
            </div>
            <button
              onClick={onResetKhata}
              className="px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 hover:brightness-110 text-white dark:text-zinc-900 text-xs font-extrabold rounded-xl transition-all shadow-sm active:scale-95 self-start sm:self-auto"
            >
              Reset Khata Now
            </button>
          </div>

          {resetHistory.length > 0 && (
            <div className="mt-6 pt-5 border-t border-[var(--border)]">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/50 mb-3">
                Consolidation History
              </p>
              <div className="space-y-2">
                {resetHistory.map(r => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs"
                  >
                    <span className="font-medium text-[var(--foreground)]/70">
                      {new Date(r.resetDate ?? new Date()).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="font-mono font-bold text-[var(--foreground)]">
                      ₹{fmt(r.amountReset)} <span className="text-[10px] text-[var(--foreground)]/50 font-sans">({r.invoiceCount} invoices consolidated)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </FadeIn>
  );
});
