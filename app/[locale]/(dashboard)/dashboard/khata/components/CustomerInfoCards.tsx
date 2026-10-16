"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { FadeIn } from "@/components/ui/MotionWrapper";
import { formatCurrency } from "@/lib/formatters";
import { safeNum, fmt } from "../hooks/useKhata";
import { User, Phone, Wallet, ShieldAlert, Sparkles, RefreshCcw, ArrowDownLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";

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
  totalBalanceDue: number;
  resetHistory: ResetRecord[];
  onRecordPayment: () => void;
  onCollectFines?: () => void;
  collectingFines?: boolean;
  onResetKhata: () => void;
}

export const CustomerInfoCards = React.memo(function CustomerInfoCards({ customer, accruedFines, totalBalanceDue, resetHistory, onRecordPayment, onCollectFines, collectingFines, onResetKhata }: Props) {
  const t = useTranslations("Khata");
  const bal = safeNum(customer.currentBalance);
  const currentDue = Math.max(0, bal);
  const advance = Math.max(0, -bal);
  const dueWithFines = Math.max(0, safeNum(totalBalanceDue));
  const creditLimit = safeNum(customer.creditLimit);
  const used = currentDue;
  const available = Math.max(0, creditLimit - used);
  const utilPct = creditLimit > 0 ? Math.round((used / creditLimit) * 100) : 0;
  const isUtilWarning = utilPct > 80;
  const isUtilDanger = utilPct >= 100;
  const badgeClass = isUtilDanger ? "badge badge-danger" : isUtilWarning ? "badge badge-warning" : "badge badge-success";
  const isSettled = currentDue === 0 && advance === 0 && accruedFines === 0;

  return (
    <FadeIn delay={0.1} className="mt-6 space-y-6">
      <section aria-labelledby="khata-selected-customer" className="glass-card border border-[var(--color-primary)]/20 p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]" aria-hidden="true">
              <User size={21} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--foreground)]/45">{t("customerSelectedLabel")}</p>
              <h2 id="khata-selected-customer" className="mt-1 truncate text-xl font-black tracking-tight text-[var(--foreground)] sm:text-2xl">
                {customer.name}
              </h2>
              {customer.phone ? (
                <a href={`tel:${customer.phone}`} className="mt-1 inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[var(--foreground)]/60 transition-colors hover:text-[var(--color-primary)]">
                  <Phone size={13} aria-hidden="true" /> {customer.phone}
                </a>
              ) : (
                <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-[var(--foreground)]/45">
                  <Phone size={13} aria-hidden="true" /> {t("noPhone")}
                </p>
              )}
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[14rem]">
            <button
              type="button"
              onClick={onRecordPayment}
              className="glass-btn-primary min-h-11 w-full justify-center gap-2 px-5 text-sm font-extrabold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
            >
              <Sparkles size={16} aria-hidden="true" />
              {currentDue > 0 ? t("recordPayment") : t("recordAdvance")}
            </button>
            <p className="text-center text-[11px] leading-relaxed text-[var(--foreground)]/55">{t("paymentActionHint")}</p>
          </div>
        </div>
      </section>

      <div>
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-[0.12em] text-[var(--foreground)]">{t("balanceSummaryTitle")}</h3>
            <p className="mt-1 text-xs text-[var(--foreground)]/55">{t("balanceSummaryHint")}</p>
          </div>
          {isSettled && <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-success)]"><CheckCircle2 size={14} aria-hidden="true" />{t("settled")}</span>}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="glass-card border border-[var(--color-warning)]/25 p-5 card-hover-lift">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
                <ArrowDownLeft size={16} className="text-[var(--color-warning)]" aria-hidden="true" /> {t("currentDue")}
              </span>
              {currentDue > 0 && <span className="badge badge-warning">{t("dueLabel")}</span>}
            </div>
            <p className="mt-4 text-2xl font-black font-mono tracking-tight text-[var(--color-warning)] sm:text-3xl">₹{fmt(currentDue)}</p>
            {accruedFines > 0 && (
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-3 text-xs">
                <span className="text-[var(--foreground)]/55">{t("totalDueWithFines")}</span>
                <span className="font-mono font-bold text-[var(--foreground)]">₹{fmt(dueWithFines)}</span>
              </div>
            )}
          </div>

          <div className="glass-card border border-[var(--color-success)]/25 p-5 card-hover-lift">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
                <ArrowUpRight size={16} className="text-[var(--color-success)]" aria-hidden="true" /> {t("advanceBalance")}
              </span>
              {advance > 0 && <span className="badge badge-success">{t("advanceLabel")}</span>}
            </div>
            <p className="mt-4 text-2xl font-black font-mono tracking-tight text-[var(--color-success)] sm:text-3xl">₹{fmt(advance)}</p>
            <p className="mt-2 text-xs leading-relaxed text-[var(--foreground)]/55">{t("creditBalance")}</p>
          </div>

          <div className="glass-card border border-[var(--border)] p-5 card-hover-lift">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
              <Wallet size={16} aria-hidden="true" /> {t("balance")}
            </div>
            <p className={`mt-4 text-2xl font-black font-mono tracking-tight sm:text-3xl ${bal > 0 ? "text-[var(--color-warning)]" : bal < 0 ? "text-[var(--color-success)]" : "text-[var(--foreground)]"}`}>
              {bal < 0 ? "-" : ""}₹{fmt(bal)}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[var(--foreground)]/55">
              {bal > 0 ? t("dueLabel") : bal < 0 ? t("advanceLabel") : t("settledLabel")}
            </p>
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
              <span className={badgeClass}>{t("creditUtilization", { percent: utilPct })}</span>
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
              type="button"
              onClick={onCollectFines}
              disabled={collectingFines}
              className="min-h-11 px-6 py-3 bg-zinc-900 dark:bg-zinc-100 hover:brightness-110 text-white dark:text-zinc-900 font-extrabold text-sm rounded-xl shadow-md transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
            >
              {collectingFines ? t("processing") : t("collectFines")}
            </button>
          )}
        </div>
      )}

      {/* Reset Khata Section */}
      {(bal > 0 || resetHistory.length > 0) && (
        <div className="glass-card p-6 border border-[var(--border)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <RefreshCcw size={16} className="text-[var(--foreground)]" />
                <h3 className="text-sm font-extrabold text-[var(--foreground)] uppercase tracking-wide">
                  {t("resetTitle")}
                </h3>
              </div>
              <p className="text-xs text-[var(--foreground)]/60 mt-1">
                {t("resetDescription", { customerName: customer.name })}
              </p>
            </div>
            {bal > 0 && (
              <button
                type="button"
                onClick={onResetKhata}
                className="min-h-11 px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 hover:brightness-110 text-white dark:text-zinc-900 text-xs font-extrabold rounded-xl transition-all shadow-sm active:scale-95 self-start sm:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
              >
                {t("resetConfirm")}
              </button>
            )}
          </div>

          {bal > 0 && <ul className="mt-4 space-y-1.5 text-xs leading-relaxed text-[var(--foreground)]/60">
            <li>• {t("resetArchiveInvoices")}</li>
            <li>• {t("resetCancelTransactions")}</li>
            <li>• {t("resetZeroBalance")}</li>
          </ul>}

          {resetHistory.length > 0 && (
            <div className="mt-6 pt-5 border-t border-[var(--border)]">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/50 mb-3">
                {t("resetHistoryTitle")}
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
                      {Number(r.amountReset) < 0 ? "−" : ""}₹{fmt(r.amountReset)} <span className="text-[10px] text-[var(--foreground)]/50 font-sans">({r.invoiceCount} invoices)</span>
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
