"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Search, User, AlertCircle, CheckCircle2, RefreshCw, Wallet } from "lucide-react";
import { safeNum, fmt } from "../hooks/useKhata";

interface Customer {
  id: string; name: string; phone: string | null;
  currentBalance: number | null;
}

interface Props {
  customers: Customer[];
  totalCustomers: number;
  selectedCustomer: string;
  customerSearch: string;
  overdueIds: string[];
  loading: boolean;
  loadingMore: boolean;
  loadMoreError: string | null;
  error: string | null;
  statementLoading?: boolean;
  onSearchChange: (v: string) => void;
  onSelect: (id: string) => void;
  onRetry: () => void;
  onLoadMore: () => void;
}

export const CustomerSearchPanel = React.memo(function CustomerSearchPanel({ customers, totalCustomers, selectedCustomer, customerSearch, overdueIds, loading, loadingMore, loadMoreError, error, statementLoading, onSearchChange, onSelect, onRetry, onLoadMore }: Props) {
  const t = useTranslations("Khata");
  const overdueSet = new Set(overdueIds);
  const normalizedSearch = customerSearch.trim().toLowerCase();
  const filtered = customers
    .filter(c =>
      c.name.toLowerCase().includes(normalizedSearch) ||
      (c.phone && c.phone.includes(normalizedSearch))
    )
    .sort((a, b) => {
      const aOverdue = overdueSet.has(a.id) ? 0 : 1;
      const bOverdue = overdueSet.has(b.id) ? 0 : 1;
      return aOverdue - bOverdue;
    });
  const dueCount = customers.filter(c => safeNum(c.currentBalance) > 0).length;
  const dueCountLabel = totalCustomers > customers.length
    ? t("dueCustomersLoaded", { count: dueCount })
    : t("dueCustomers", { count: dueCount });

  return (
    <section
      aria-labelledby="khata-customer-selection"
      aria-busy={loading || loadingMore || statementLoading}
      className="glass-card p-5 sm:p-6 border border-[var(--border)] overflow-hidden card-hover-lift"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 id="khata-customer-selection" className="text-base font-extrabold text-[var(--foreground)] tracking-tight">
            {t("selectCustomer")}
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[var(--foreground)]/60">
            {t("selectionHint")}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 text-[11px] font-semibold">
          {loading || error ? (
            <span className="inline-flex h-7 w-28 items-center rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] px-2.5">
              <span className="h-2.5 w-16 rounded skeleton" />
            </span>
          ) : (
            <>
              <span className="rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] px-2.5 py-1 text-[var(--foreground)]/65">
                {t("customerCount", { count: totalCustomers || customers.length })}
              </span>
              <span className="rounded-full border border-[var(--color-warning)]/25 bg-[var(--color-warning)]/10 px-2.5 py-1 text-[var(--color-warning)]">
                {dueCountLabel}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="relative mt-5">
        <Search aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 text-[var(--color-primary)] opacity-80 pointer-events-none" size={17} />
        <input
          id="khata-customer-search"
          type="text"
          placeholder={t("searchCustomer")}
          value={customerSearch}
          onChange={e => onSearchChange(e.target.value)}
          aria-label={t("searchCustomer")}
          disabled={loading || Boolean(error)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 font-medium shadow-sm focus:outline-none focus:border-[var(--color-primary)] transition-all"
        />
      </div>

      <div
        role="listbox"
        aria-label={t("selectCustomer")}
        className="mt-4 max-h-[min(24rem,50vh)] overflow-y-auto border border-[var(--border)] rounded-2xl divide-y divide-[var(--border)] bg-[var(--surface)]"
      >
        {error ? (
          <div role="alert" className="p-7 text-center flex flex-col items-center justify-center">
            <AlertCircle size={26} className="mb-2 text-[var(--color-warning)]" aria-hidden="true" />
            <p className="text-sm font-bold text-[var(--foreground)]">{t("customerLoadErrorTitle")}</p>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-[var(--foreground)]/60">{t("customerLoadError")}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-bold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            >
              <RefreshCw size={14} aria-hidden="true" />
              {t("retry")}
            </button>
          </div>
        ) : loading ? (
          <div role="status" aria-live="polite" className="space-y-2 p-3" aria-label={t("loadingCustomers")}>
            {[0, 1, 2].map(index => (
              <div key={index} className="flex items-center justify-between rounded-xl border border-[var(--border)]/60 p-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3.5 w-2/5 rounded skeleton" />
                  <div className="h-3 w-1/4 rounded skeleton" />
                </div>
                <div className="h-4 w-20 rounded skeleton" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-7 text-sm text-[var(--foreground)]/50 text-center flex flex-col items-center justify-center">
            <User size={28} className="opacity-30 mb-2" aria-hidden="true" />
            <span className="font-semibold">{customers.length === 0 ? t("noCustomers") : t("noCustomerMatchHint")}</span>
            <span className="mt-1 max-w-xs text-xs leading-relaxed text-[var(--foreground)]/40">
              {customers.length === 0 ? t("noCustomersHint") : t("selectionHint")}
            </span>
          </div>
        ) : (
          filtered.map(c => {
            const isOverdue = overdueSet.has(c.id);
            const isSelected = selectedCustomer === c.id;
            const balance = safeNum(c.currentBalance);
            const statusLabel = balance > 0
              ? `${t("dueLabel")} ₹${fmt(balance)}`
              : balance < 0
              ? `${t("advanceLabel")} ₹${fmt(balance)}`
              : t("settledLabel");
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c.id)}
                role="option"
                aria-selected={isSelected}
                aria-label={`${c.name}, ${statusLabel}${isOverdue ? `, ${t("overdueLabel")}` : ""}`}
                className={`w-full text-left px-4 py-3.5 transition-all cursor-pointer flex items-center justify-between group ${
                  isSelected
                    ? "bg-[var(--color-primary)]/12 border-l-4 border-l-[var(--color-primary)]"
                    : isOverdue
                    ? "bg-[var(--surface-elevated)] border-l-4 border-l-[var(--color-warning)] hover:bg-[var(--surface-hover)]"
                    : "hover:bg-[var(--surface-hover)]"
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)]`}
              >
                <div className="min-w-0 pr-3">
                  <div className="font-bold text-sm text-[var(--foreground)] group-hover:text-[var(--color-primary)] transition-colors truncate">
                    {c.name}
                  </div>
                  <div className="text-xs font-mono text-[var(--foreground)]/50">
                    {c.phone || t("noPhone")}
                  </div>
                  {isOverdue && (
                    <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold text-[var(--color-warning)] bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/25 px-2 py-0.5 rounded-full">
                      <AlertCircle size={10} aria-hidden="true" /> {t("overdueLabel")}
                    </span>
                  )}
                </div>
                <div className="text-right shrink-0 flex flex-col items-end">
                  <div className="flex items-center gap-1.5">
                    {isSelected && statementLoading && (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
                    )}
                    {isSelected && statementLoading && (
                      <span className="sr-only">{t("loadingStatement")}</span>
                    )}
                    <div className={`text-sm font-black font-mono ${
                      balance > 0
                        ? "text-[var(--color-warning)]"
                        : balance < 0
                        ? "text-[var(--color-success)]"
                        : "text-[var(--foreground)]/70"
                    }`}>
                      {balance > 0 ? `₹${fmt(balance)}` : balance < 0 ? `₹${fmt(balance)}` : "₹0.00"}
                    </div>
                  </div>
                  <div className={`text-[10px] uppercase tracking-wider font-semibold mt-0.5 ${
                    balance > 0 ? "text-[var(--color-warning)]" : balance < 0 ? "text-[var(--color-success)]" : "text-[var(--foreground)]/40"
                  }`}>
                    {balance > 0 ? t("dueLabel") : balance < 0 ? t("advanceLabel") : t("settledLabel")}
                  </div>
                  {isSelected && !statementLoading && (
                    <CheckCircle2 size={14} className="mt-1 text-[var(--color-primary)]" aria-hidden="true" />
                  )}
                  {balance === 0 && !isSelected && (
                    <Wallet size={13} className="mt-1 text-[var(--foreground)]/30" aria-hidden="true" />
                  )}
                  <span className="sr-only">{statusLabel}</span>
                </div>
              </button>
            );
          })
        )}
      </div>
      {!loading && !error && totalCustomers > customers.length && (
        <div className="flex flex-col items-center gap-2 border-x border-b border-[var(--border)] rounded-b-2xl bg-[var(--surface-elevated)] p-3">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            aria-busy={loadingMore}
            className="min-h-11 rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-bold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            {loadingMore ? t("loadingMore") : t("loadMoreCustomers", { count: totalCustomers - customers.length })}
          </button>
          {loadMoreError && (
            <p role="alert" className="text-center text-[11px] leading-relaxed text-[var(--color-warning)]">{t("loadMoreCustomersError")}</p>
          )}
        </div>
      )}
    </section>
  );
});
