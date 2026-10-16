"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { ArrowDownCircle, ArrowUpCircle, History, Lock, RefreshCw, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import { safeNum, fmt } from "../hooks/useKhata";

interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  note: string | null;
  createdAt: Date | null;
  referenceInvoiceId: string | null;
  status?: string | null;
  paymentMethod?: string | null;
  runningBalance?: number;
}

interface Props {
  statement: Transaction[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onCancel: (id: string) => void;
  onAddTransaction: () => void;
}

export const TransactionTable = React.memo(function TransactionTable({ statement, loading, error, onRetry, onCancel, onAddTransaction }: Props) {
  const t = useTranslations("Khata");

  return (
    <section aria-labelledby="khata-transaction-history" className="glass-card mt-6 overflow-hidden border border-[var(--border)] card-hover-lift">
      <div className="border-b border-[var(--border)] p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-2.5">
            <div className="rounded-xl bg-[var(--color-primary)]/10 p-2.5 text-[var(--color-primary)]" aria-hidden="true">
              <History size={18} />
            </div>
            <div>
              <h2 id="khata-transaction-history" className="font-extrabold tracking-tight text-[var(--foreground)] text-lg">
                {t("transactionHistory")}
              </h2>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[var(--foreground)]/55">{t("transactionHistoryHint")}</p>
            </div>
          </div>
          <span className="w-fit rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]/55">
            {t("transactionTimeline")}
          </span>
        </div>
      </div>

      {loading ? (
        <div role="status" aria-live="polite" className="space-y-3 p-5 sm:p-8">
          <span className="sr-only">{t("loadingStatement")}</span>
          {[0, 1, 2, 3].map(index => (
            <div key={index} className="h-14 rounded-xl skeleton" />
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="flex flex-col items-center justify-center p-8 text-center">
          <History size={30} className="mb-2 text-[var(--color-warning)]/70" aria-hidden="true" />
          <p className="text-sm font-bold text-[var(--foreground)]">{t("statementLoadErrorTitle")}</p>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-[var(--foreground)]/60">{t("statementLoadError")}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-bold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <RefreshCw size={14} aria-hidden="true" />
            {t("retryStatement")}
          </button>
        </div>
      ) : statement.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center sm:p-12">
          <History size={32} className="mb-3 text-[var(--foreground)]/20" aria-hidden="true" />
          <p className="text-sm font-bold text-[var(--foreground)]">{t("noTransactions")}</p>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-[var(--foreground)]/55">{t("noTransactionsHint")}</p>
          <button
            type="button"
            onClick={onAddTransaction}
            className="glass-btn-secondary mt-5 min-h-11 px-4 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
          >
            {t("recordFirstTransaction")}
          </button>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[760px] border-collapse">
              <caption className="sr-only">{t("transactionHistory")}</caption>
              <thead className="border-b border-[var(--border)] bg-[var(--surface-elevated)]">
                <tr>
                  <th scope="col" className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">{t("thDate")}</th>
                  <th scope="col" className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">{t("thType")}</th>
                  <th scope="col" className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">{t("thNote")}</th>
                  <th scope="col" className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">{t("thAmount")}</th>
                  <th scope="col" className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">{t("thBalance")}</th>
                  <th scope="col" className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">{t("thActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
                {statement.map(txn => <TransactionRow key={txn.id} txn={txn} onCancel={onCancel} />)}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-[var(--border)] bg-[var(--surface)] sm:hidden">
            {statement.map(txn => <TransactionTimelineItem key={txn.id} txn={txn} onCancel={onCancel} />)}
          </div>
        </>
      )}
    </section>
  );
});

function TransactionRow({ txn, onCancel }: { txn: Transaction; onCancel: (id: string) => void }) {
  const cancelled = txn.status === "cancelled";

  return (
    <tr className={`transition-colors duration-150 hover:bg-[var(--surface-hover)] ${cancelled ? "bg-[var(--surface-elevated)]/30 opacity-60" : ""}`}>
      <td className="px-5 py-4 text-xs font-medium text-[var(--foreground)]/70">{formatDate(txn.createdAt)}</td>
      <td className="px-5 py-4"><TransactionType txn={txn} /></td>
      <td className="px-5 py-4 text-xs font-medium text-[var(--foreground)]/80">
        <TransactionNote txn={txn} />
      </td>
      <td className="px-5 py-4 text-right"><TransactionAmount txn={txn} /></td>
      <td className="px-5 py-4 text-right"><RunningBalance txn={txn} /></td>
      <td className="px-5 py-4 text-right"><TransactionAction txn={txn} onCancel={onCancel} /></td>
    </tr>
  );
}

function TransactionTimelineItem({ txn, onCancel }: { txn: Transaction; onCancel: (id: string) => void }) {
  const t = useTranslations("Khata");
  const cancelled = txn.status === "cancelled";

  return (
    <article className={`relative p-4 ${cancelled ? "bg-[var(--surface-elevated)]/30 opacity-60" : ""}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${txn.type === "credit" ? "border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 text-[var(--color-warning)]" : "border-[var(--color-success)]/30 bg-[var(--color-success)]/10 text-[var(--color-success)]"}`} aria-hidden="true">
          {txn.type === "credit" ? <ArrowUpCircle size={17} /> : <ArrowDownCircle size={17} />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-[var(--foreground)]">{txn.type === "credit" ? t("saleAdded") : t("paymentReceived")}</p>
              <p className="mt-1 text-xs text-[var(--foreground)]/55">{formatDate(txn.createdAt)}</p>
            </div>
            <TransactionAmount txn={txn} />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-3">
            <TransactionNote txn={txn} />
            <RunningBalance txn={txn} />
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            {cancelled ? <span className="text-[10px] font-mono text-[var(--foreground)]/45">{t("cancelled")}</span> : <span />}
            <TransactionAction txn={txn} onCancel={onCancel} mobile />
          </div>
        </div>
      </div>
    </article>
  );
}

function TransactionType({ txn }: { txn: Transaction }) {
  const t = useTranslations("Khata");
  const cancelled = txn.status === "cancelled";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${
      cancelled
        ? "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--foreground)]/55 line-through"
        : txn.type === "credit"
        ? "border-[var(--color-warning)]/25 bg-[var(--color-warning)]/10 text-[var(--color-warning)]"
        : "border-[var(--color-success)]/25 bg-[var(--color-success)]/10 text-[var(--color-success)]"
    }`}>
      {cancelled ? <History size={14} aria-hidden="true" /> : txn.type === "credit" ? <ArrowUpCircle size={14} aria-hidden="true" /> : <ArrowDownCircle size={14} aria-hidden="true" />}
      {cancelled ? t("cancelled") : txn.type === "credit" ? t("saleAdded") : t("paymentReceived")}
    </span>
  );
}

function TransactionNote({ txn }: { txn: Transaction }) {
  const t = useTranslations("Khata");
  const cancelled = txn.status === "cancelled";
  const paymentMethod = txn.paymentMethod === "cash"
    ? t("paymentCash")
    : txn.paymentMethod === "upi"
    ? t("paymentUpi")
    : txn.paymentMethod === "bank"
    ? t("paymentBank")
    : txn.paymentMethod === "cheque"
    ? t("paymentCheque")
    : txn.paymentMethod;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={cancelled ? "line-through text-[var(--foreground)]/40" : ""}>{txn.note || t("standardEntry")}</span>
      {paymentMethod && !cancelled && <span className="rounded border border-[var(--border)] bg-[var(--surface-elevated)] px-2 py-0.5 text-[10px] font-mono font-bold text-[var(--color-primary)]">{paymentMethod}</span>}
    </div>
  );
}

function TransactionAmount({ txn }: { txn: Transaction }) {
  const cancelled = txn.status === "cancelled";
  return (
    <span className={`font-mono text-sm font-black ${cancelled ? "text-[var(--foreground)]/40 line-through" : txn.type === "credit" ? "text-[var(--color-warning)]" : "text-[var(--color-success)]"}`}>
      {txn.type === "credit" ? "+" : "−"}₹{fmt(txn.amount)}
    </span>
  );
}

function RunningBalance({ txn }: { txn: Transaction }) {
  const t = useTranslations("Khata");
  const balance = safeNum(txn.runningBalance);
  if (txn.status === "cancelled") return <span className="text-sm font-bold text-[var(--foreground)]/35">—</span>;
  return (
    <span className="text-right">
      <span className={`block font-mono text-sm font-bold ${balance >= 0 ? "text-[var(--color-warning)]" : "text-[var(--color-success)]"}`}>
        {balance < 0 ? "−" : ""}₹{fmt(balance)}
      </span>
      <span className="block text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground)]/45">
        {balance > 0 ? t("dueLabel") : balance < 0 ? t("advanceLabel") : t("settledLabel")}
      </span>
    </span>
  );
}

function TransactionAction({ txn, onCancel, mobile = false }: { txn: Transaction; onCancel: (id: string) => void; mobile?: boolean }) {
  const t = useTranslations("Khata");
  if (txn.status === "cancelled") return mobile ? null : <span className="text-[10px] font-mono text-[var(--foreground)]/40">{t("cancelled")}</span>;
  if (txn.referenceInvoiceId) {
    return (
      <span className={mobile ? "inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--foreground)]/45" : "inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--foreground)]/45"} title={t("cannotDeleteHint")}>
        <Lock size={14} aria-hidden="true" /> {mobile ? t("cannotDelete") : ""}
        <span className="sr-only">{t("cannotDeleteHint")}</span>
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onCancel(txn.id)}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-transparent p-2 text-[var(--foreground)]/55 transition-all hover:border-[var(--border)] hover:bg-[var(--surface-elevated)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
      aria-label={t("cancelTransactionTitle")}
      title={t("cancelTransactionTitle")}
    >
      <Trash2 size={16} aria-hidden="true" />
    </button>
  );
}
