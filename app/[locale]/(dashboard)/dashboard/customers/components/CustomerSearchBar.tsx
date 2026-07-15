"use client";

import { useTranslations } from "next-intl";
import { Search, Users } from "lucide-react";

export function CustomerSearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const t = useTranslations("Customers");
  return (
    <div className="p-4 sm:p-6 bg-[var(--surface-elevated)] border-b border-[var(--border)]">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-[var(--color-primary)] opacity-80 pointer-events-none" size={18} />
          <input
            type="text"
            placeholder={t("searchCustomer")}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 font-medium shadow-sm focus:outline-none focus:border-[var(--color-primary)] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs font-semibold text-[var(--foreground)]/60 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
            <Users size={14} className="text-[var(--color-primary)]" />
            Quick Contact Search
          </span>
        </div>
      </div>
    </div>
  );
}
