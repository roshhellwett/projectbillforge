"use client";

import { useTranslations } from "next-intl";

export function InvoiceLoadMore({ remaining, onLoadMore }: { remaining: number; onLoadMore: () => void }) {
  const t = useTranslations("Invoices");
  if (remaining <= 0) return null;
  return (
    <div className="p-4 text-center">
      <button onClick={onLoadMore} className="glass-btn-primary px-6 py-2 text-sm min-h-[44px]">
        {t("loadMoreRemaining", { remaining })}
      </button>
    </div>
  );
}
