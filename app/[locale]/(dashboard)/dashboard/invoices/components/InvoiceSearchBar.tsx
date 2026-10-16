"use client";

import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import type { InvoiceStatusFilter } from "../hooks/useInvoices";

export function InvoiceSearchBar({
  value,
  onChange,
  statusFilter,
  onStatusFilterChange,
  resultCount,
}: {
  value: string;
  onChange: (v: string) => void;
  statusFilter: InvoiceStatusFilter;
  onStatusFilterChange: (filter: InvoiceStatusFilter) => void;
  resultCount: number;
}) {
  const t = useTranslations("Invoices");
  return (
    <div className="p-4 sm:p-6 bg-[var(--surface-elevated)] border-b border-[var(--border)]" role="search" aria-label={t("searchLabel")}>
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-2xl">
          <label htmlFor="invoice-search" className="sr-only">{t("searchLabel")}</label>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-[var(--color-primary)] opacity-80 pointer-events-none" size={18} aria-hidden="true" />
          <input
            id="invoice-search"
            type="text"
            placeholder={t("searchInvoices")}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoComplete="off"
            enterKeyHint="search"
            className="w-full pl-11 pr-11 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-colors"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-[var(--foreground)]/50 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
              aria-label={t("clearSearch")}
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <label htmlFor="invoice-status-filter" className="sr-only">{t("filterLabel")}</label>
          <select
            id="invoice-status-filter"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as InvoiceStatusFilter)}
            className="min-h-[44px] w-full sm:w-auto px-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm font-semibold text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
          >
            <option value="all">{t("filterAll")}</option>
            <option value="open">{t("filterOpen")}</option>
            <option value="paid">{t("filterPaid")}</option>
            <option value="cancelled">{t("filterCancelled")}</option>
            <option value="archived">{t("filterArchived")}</option>
          </select>
          <span className="text-xs font-semibold text-[var(--foreground)]/60 px-1 sm:px-3 whitespace-nowrap" aria-live="polite">
            {t("resultCount", { count: resultCount })}
          </span>
        </div>
      </div>
    </div>
  );
}
