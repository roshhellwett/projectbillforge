"use client";

import { Search, Tag, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
}

export function ProductSearchBar({ value, onChange, resultCount }: Props) {
  const t = useTranslations("Products");

  return (
    <div className="p-4 sm:p-6 bg-[var(--surface-elevated)] border-b border-[var(--border)]" role="search" aria-label={t("searchLabel")}>
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-2xl">
          <label htmlFor="product-search" className="sr-only">{t("searchLabel")}</label>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-[var(--color-primary)] opacity-80 pointer-events-none" size={18} aria-hidden="true" />
          <input
            id="product-search"
            type="search"
            placeholder={t("searchProduct")}
            value={value}
            onChange={event => onChange(event.target.value)}
            autoComplete="off"
            enterKeyHint="search"
            className="w-full min-h-[44px] pl-11 pr-11 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-colors"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[40px] min-w-[40px] p-2 rounded-lg text-[var(--foreground)]/50 hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 flex items-center justify-center"
              aria-label={t("clearSearch")}
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <span className="text-xs font-semibold text-[var(--foreground)]/60 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] whitespace-nowrap">
            <Tag size={14} className="text-[var(--color-primary)]" aria-hidden="true" />
            {t("searchHint")}
          </span>
          <span className="text-xs font-semibold text-[var(--foreground)]/60 px-1 sm:px-3 whitespace-nowrap" aria-live="polite">
            {t("resultCount", { count: resultCount })}
          </span>
        </div>
      </div>
    </div>
  );
}
