"use client";

import type { Customer } from "../hooks/useCustomers";
import { CustomerCard } from "./CustomerCard";
import { SkeletonCard } from "@/components/ui/ui";
import { useTranslations } from "next-intl";

interface Props {
  customers: Customer[];
  loading: boolean;
  syncingId: string | null;
  offset: number;
  totalCustomers: number;
  loadingMore: boolean;
  loadMoreError: string | null;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
  onSyncBalance: (id: string) => void;
  onLoadMore: () => void;
}

export function CustomerGrid({
  customers,
  loading,
  syncingId,
  offset,
  totalCustomers,
  loadingMore,
  loadMoreError,
  onEdit,
  onDelete,
  onSyncBalance,
  onLoadMore,
}: Props) {
  const t = useTranslations("Customers");

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 sm:p-6" aria-busy="true" aria-label={t("loadingCustomers")}>
        {[...Array(6)].map((_, index) => <SkeletonCard key={index} />)}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4 sm:p-6">
        {customers.map(customer => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            syncingId={syncingId}
            onEdit={onEdit}
            onDelete={onDelete}
            onSyncBalance={onSyncBalance}
          />
        ))}
      </div>

      <div className="p-4 sm:p-6 border-t border-[var(--border)] bg-[var(--surface-elevated)]/50 flex flex-col items-center gap-3">
        {offset < totalCustomers && (
          <>
            {loadMoreError && (
              <p className="text-sm text-[var(--foreground)]/70" role="alert">{loadMoreError}</p>
            )}
            <button
              type="button"
              onClick={onLoadMore}
              disabled={loadingMore}
              className="glass-btn-primary min-h-[44px] px-6 py-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              aria-busy={loadingMore}
            >
              {loadingMore ? t("loadingMore") : loadMoreError ? t("retryLoadMore") : t("loadMoreRemaining", { remaining: totalCustomers - offset })}
            </button>
          </>
        )}
        <p className="text-xs text-[var(--foreground)]/50" aria-live="polite">
          {t("paginationFeedback", { loaded: Math.min(offset, totalCustomers), total: totalCustomers })}
        </p>
      </div>
    </>
  );
}
