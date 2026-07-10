"use client";

import { useTranslations } from "next-intl";
import { Search } from "lucide-react";

export function InvoiceSearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const t = useTranslations("Invoices");
  return (
    <div className="p-3 sm:p-4 md:p-6 border-b border-[var(--border)]/50">
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-[var(--color-primary)]/60 pointer-events-none" size={18} />
        <input
          type="text"
          placeholder={t("searchInvoices")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pr-4 py-3 glass-input text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 font-medium focus:ring-0"
          style={{ paddingLeft: "2.75rem" }}
        />
      </div>
    </div>
  );
}
