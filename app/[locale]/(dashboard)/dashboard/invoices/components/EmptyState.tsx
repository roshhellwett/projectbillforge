"use client";

import { useTranslations } from "next-intl";
import { FileText, Plus, SearchX } from "lucide-react";

export function EmptyState({
  visible,
  filtered = false,
  onClear,
  onCreate,
}: {
  visible: boolean;
  filtered?: boolean;
  onClear?: () => void;
  onCreate?: () => void;
}) {
  const t = useTranslations("Invoices");
  if (!visible) return null;
  return (
    <div className="p-8 sm:p-12 text-center flex flex-col items-center">
      {filtered ? (
        <SearchX size={40} className="mx-auto mb-3 text-[var(--foreground)]/20" aria-hidden="true" />
      ) : (
        <FileText size={40} className="mx-auto mb-3 text-[var(--foreground)]/20" aria-hidden="true" />
      )}
      <p className="text-[var(--foreground)] font-semibold">{filtered ? t("searchNoResults") : t("noInvoices")}</p>
      {!filtered && <p className="text-sm text-[var(--foreground)]/55 mt-2 max-w-sm">{t("emptyHint")}</p>}
      {filtered && onClear && (
        <button type="button" onClick={onClear} className="glass-btn-secondary mt-4 min-h-[44px]">
          {t("clearFilters")}
        </button>
      )}
      {!filtered && onCreate && (
        <button type="button" onClick={onCreate} className="glass-btn-primary mt-5 min-h-[44px]">
          <Plus size={17} aria-hidden="true" />
          {t("createFirstInvoice")}
        </button>
      )}
    </div>
  );
}
