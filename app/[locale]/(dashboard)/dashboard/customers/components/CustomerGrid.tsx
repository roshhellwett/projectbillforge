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
  onEdit: (c: Customer) => void;
  onDelete: (id: string) => void;
  onSyncBalance: (id: string) => void;
  onLoadMore: () => void;
}

export function CustomerGrid({ customers, loading, syncingId, offset, totalCustomers, onEdit, onDelete, onSyncBalance, onLoadMore }: Props) {
  const t = useTranslations("Customers");

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 md:p-6">
        {customers.map((customer) => (
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
      {offset < totalCustomers && (
        <div className="p-4 text-center">
          <button onClick={onLoadMore} className="glass-btn-primary px-6 py-2 text-sm min-h-[44px]">
            {t("loadMoreRemaining", { remaining: totalCustomers - offset })}
          </button>
        </div>
      )}
    </>
  );
}
