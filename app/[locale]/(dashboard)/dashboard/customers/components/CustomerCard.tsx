"use client";

import type { Customer } from "../hooks/useCustomers";
import { fmt, safeNum } from "../hooks/useCustomers";
import { useTranslations } from "next-intl";
import { Phone, Mail, Edit2, Trash2, RefreshCw } from "lucide-react";

interface Props {
  customer: Customer;
  syncingId: string | null;
  onEdit: (c: Customer) => void;
  onDelete: (id: string) => void;
  onSyncBalance: (id: string) => void;
}

export function CustomerCard({ customer, syncingId, onEdit, onDelete, onSyncBalance }: Props) {
  const t = useTranslations("Customers");
  const hasBalance = Math.abs(safeNum(customer.currentBalance)) > 0.01;

  return (
    <div className="p-6 bg-[var(--card)] rounded-3xl shadow-[0_5px_15px_rgba(0,0,0,0.02)] border border-[var(--border)]/30 hover:-translate-y-1 hover:shadow-lg transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-[var(--foreground)]">{customer.name}</h3>
          {customer.phone && (
            <p className="text-sm text-[var(--foreground)]/60 flex items-center gap-1.5 mt-1">
              <Phone size={12} /> {customer.phone}
            </p>
          )}
          {customer.email && (
            <p className="text-sm text-[var(--foreground)]/60 flex items-center gap-1.5 mt-0.5">
              <Mail size={12} /> {customer.email}
            </p>
          )}
        </div>
        <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(customer)}
            className="p-2.5 sm:p-1.5 text-[var(--foreground)]/40 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors"
            aria-label={t("editCustomerBtn")}
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(customer.id)}
            className={`p-2.5 sm:p-1.5 rounded-lg transition-colors ${hasBalance ? "text-[var(--foreground)]/20 cursor-not-allowed" : "text-[var(--foreground)]/40 hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10"}`}
            aria-label={t("deleteCustomerBtn")}
            disabled={hasBalance}
            title={hasBalance ? t("deleteBlocked") : t("deleteCustomerBtn")}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="pt-3 border-t border-[var(--border)]/30">
        <div className="flex justify-between items-center text-sm">
          <span className="text-[var(--foreground)]/60">{t("totalOwed")}</span>
          <div className="flex items-center gap-1">
            <span className={
              safeNum(customer.currentBalance) > 0 ? "font-semibold text-[var(--color-warning)]"
                : safeNum(customer.currentBalance) < 0 ? "font-semibold text-[var(--color-primary)]"
                : "font-medium text-[var(--foreground)]"
            }>
              {safeNum(customer.currentBalance) < 0 ? "-" : ""}₹{fmt(customer.currentBalance)}
            </span>
            <button
              onClick={() => onSyncBalance(customer.id)}
              disabled={syncingId === customer.id}
              className="p-1 text-[var(--foreground)]/40 hover:text-[var(--color-primary)] disabled:opacity-50"
              title={t("syncBalance")}
            >
              <RefreshCw size={14} className={syncingId === customer.id ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
        <div className="flex justify-between text-sm mt-1.5">
          <span className="text-[var(--foreground)]/60">{t("creditLimit")}</span>
          <span className="text-[var(--foreground)] font-medium">₹{fmt(customer.creditLimit)}</span>
        </div>
        {safeNum(customer.creditLimit) > 0 && (
          <div className="flex justify-between text-sm mt-1.5">
            <span className="text-[var(--foreground)]/60">{t("availableCredit")}</span>
            <span className="font-semibold text-[var(--color-success)]">
              ₹{fmt(Math.max(0, safeNum(customer.creditLimit) - safeNum(customer.currentBalance)))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
