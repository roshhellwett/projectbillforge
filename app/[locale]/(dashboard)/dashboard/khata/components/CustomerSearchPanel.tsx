"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
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
  onSearchChange: (v: string) => void;
  onSelect: (id: string) => void;
}

export const CustomerSearchPanel = React.memo(function CustomerSearchPanel({ customers, selectedCustomer, customerSearch, overdueIds, onSearchChange, onSelect }: Props) {
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
    <div className="glass-card p-6 overflow-hidden">
      <label className="block text-sm font-semibold text-[var(--foreground)]/80 mb-4">{t("selectCustomer")}</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-[var(--color-primary)]/60 pointer-events-none" size={18} />
        <input
          type="text"
          placeholder={t("searchCustomer")}
          value={customerSearch}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full px-4 py-3.5 glass-input text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 font-medium focus:ring-0"
          style={{ paddingLeft: "2.5rem" }}
        />
      </div>
      <div className="mt-4 max-h-60 overflow-y-auto border border-[var(--border)] rounded-xl">
        {filtered.length === 0 ? (
          <div className="p-3 text-sm text-[var(--foreground)]/50 text-center">{t("noCustomers")}</div>
        ) : (
          filtered.map(c => {
            const isOverdue = overdueSet.has(c.id);
            return (
              <button
                key={c.id} type="button" onClick={() => onSelect(c.id)}
                className={`w-full text-left px-4 py-3 border-b border-[var(--border)] last:border-0 cursor-pointer transition-all hover:bg-[var(--color-primary)]/10 hover:shadow-sm ${selectedCustomer === c.id ? "bg-[var(--color-primary)]/10 border-l-4 border-l-blue-500" : isOverdue ? "border-l-4 border-l-red-400 bg-red-50/30" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-[var(--foreground)]">{c.name}</div>
                    <div className="text-xs text-[var(--foreground)]/50">{c.phone || t("noPhone")}</div>
                    {isOverdue && <span className="inline-block mt-1 text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">OVERDUE</span>}
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${safeNum(c.currentBalance) > 0 ? "text-orange-600" : safeNum(c.currentBalance) < 0 ? "text-blue-600" : "text-green-600"}`}>
                      {safeNum(c.currentBalance) < 0 ? "-" : ""}₹{fmt(c.currentBalance)}
                    </div>
                    <div className="text-xs text-[var(--foreground)]/40">{t("balance")}</div>
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
