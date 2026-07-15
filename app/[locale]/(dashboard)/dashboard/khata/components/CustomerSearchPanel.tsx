"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Search, User, AlertCircle } from "lucide-react";
import { safeNum, fmt } from "../hooks/useKhata";

interface Customer {
  id: string; name: string; phone: string | null;
  currentBalance: number | null;
}

interface Props {
  customers: Customer[];
  selectedCustomer: string;
  customerSearch: string;
  overdueIds: string[];
  statementLoading?: boolean;
  onSearchChange: (v: string) => void;
  onSelect: (id: string) => void;
}

export const CustomerSearchPanel = React.memo(function CustomerSearchPanel({ customers, selectedCustomer, customerSearch, overdueIds, statementLoading, onSearchChange, onSelect }: Props) {
  const t = useTranslations("Khata");
  const overdueSet = new Set(overdueIds);
  const filtered = customers
    .filter(c =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      (c.phone && c.phone.includes(customerSearch))
    )
    .sort((a, b) => {
      const aOverdue = overdueSet.has(a.id) ? 0 : 1;
      const bOverdue = overdueSet.has(b.id) ? 0 : 1;
      return aOverdue - bOverdue;
    });

  return (
    <div className="glass-card p-6 border border-[var(--border)] overflow-hidden card-hover-lift">
      <div className="flex items-center justify-between mb-4">
        <label className="block text-sm font-extrabold text-[var(--foreground)] tracking-tight">
          {t("selectCustomer")}
        </label>
        <span className="badge badge-success text-[10px]">Cloud Ledger</span>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 text-[var(--color-primary)] opacity-80 pointer-events-none" size={17} />
        <input
          type="text"
          placeholder={t("searchCustomer")}
          value={customerSearch}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 font-medium shadow-sm focus:outline-none focus:border-[var(--color-primary)] transition-all"
        />
      </div>

      <div className="mt-4 max-h-[260px] overflow-y-auto border border-[var(--border)] rounded-2xl divide-y divide-[var(--border)] bg-[var(--surface)]">
        {filtered.length === 0 ? (
          <div className="p-6 text-sm text-[var(--foreground)]/50 text-center flex flex-col items-center justify-center">
            <User size={28} className="opacity-30 mb-2" />
            <span>{t("noCustomers")}</span>
          </div>
        ) : (
          filtered.map(c => {
            const isOverdue = overdueSet.has(c.id);
            const isSelected = selectedCustomer === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c.id)}
                className={`w-full text-left px-4 py-3.5 transition-all cursor-pointer flex items-center justify-between group ${
                  isSelected
                    ? "bg-[var(--color-primary)]/15 border-l-4 border-l-[var(--color-primary)]"
                    : isOverdue
                    ? "bg-red-500/10 border-l-4 border-l-red-500 hover:bg-red-500/15"
                    : "hover:bg-[var(--surface-hover)]"
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="font-bold text-sm text-[var(--foreground)] group-hover:text-[var(--color-primary)] transition-colors truncate">
                    {c.name}
                  </div>
                  <div className="text-xs font-mono text-[var(--foreground)]/50">
                    {c.phone || t("noPhone")}
                  </div>
                  {isOverdue && (
                    <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold text-red-600 dark:text-red-400 bg-red-500/15 border border-red-500/20 px-2 py-0.5 rounded-full">
                      <AlertCircle size={10} /> OVERDUE ALERT
                    </span>
                  )}
                </div>
                <div className="text-right shrink-0 flex flex-col items-end">
                  <div className="flex items-center gap-1.5">
                    {isSelected && statementLoading && (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
                    )}
                    <div
                      className={`text-sm font-black font-mono ${
                        safeNum(c.currentBalance) > 0
                          ? "text-[var(--color-warning)]"
                          : safeNum(c.currentBalance) < 0
                          ? "text-[var(--color-success)]"
                          : "text-[var(--foreground)]/70"
                      }`}
                    >
                      {safeNum(c.currentBalance) < 0 ? "-" : ""}₹{fmt(c.currentBalance)}
                    </div>
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-[var(--foreground)]/40 font-semibold mt-0.5">
                    {t("balance")}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
});
