"use client";

import { useTranslations } from "next-intl";

export function InvoiceLoadMore({
  remaining,
  onLoadMore,
  loading = false,
  error,
}: {
  remaining: number;
  onLoadMore: () => void;
  loading?: boolean;
  error?: string | null;
}) {
  const t = useTranslations("Invoices");
  if (remaining <= 0) return null;
  return (
    <div className="p-4 text-center space-y-2">
      {error && <p className="text-sm text-[var(--color-danger)]" role="alert">{error}</p>}
      <button
        type="button"
        onClick={onLoadMore}
        disabled={loading}
        className="glass-btn-primary px-6 py-2 text-sm min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t("loadingMore") : error ? t("retryLabel") : t("loadMoreRemaining", { remaining })}
      </button>
    </div>
  );
}
