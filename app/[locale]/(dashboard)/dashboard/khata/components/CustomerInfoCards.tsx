"use client";

import { useTranslations } from "next-intl";
import { FadeIn } from "@/components/ui/MotionWrapper";
import { formatCurrency } from "@/lib/formatters";
import { safeNum, fmt } from "../hooks/useKhata";

interface Customer {
  id: string; name: string; phone: string | null;
  currentBalance: number | null; creditLimit?: number | null;
}

interface Props {
  customer: Customer;
  accruedFines: number;
  onRecordPayment: () => void;
}

export function CustomerInfoCards({ customer, accruedFines, onRecordPayment }: Props) {
  const t = useTranslations("Khata");

  return (
    <FadeIn delay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      <div className="glass-card p-6 hover:-translate-y-1 transition-all">
        <p className="text-sm font-semibold text-[var(--foreground)]/60 mb-1">{t("customerName")}</p>
        <p className="text-2xl font-bold text-[var(--foreground)] tracking-tight">{customer.name}</p>
      </div>
      <div className="glass-card p-6 hover:-translate-y-1 transition-all">
        <p className="text-sm font-semibold text-[var(--foreground)]/60 mb-1">{t("phone")}</p>
        <p className="text-2xl font-bold text-[var(--foreground)] tracking-tight">{customer.phone || "-"}</p>
      </div>
      <div className="glass-card p-6 hover:-translate-y-1 transition-all">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]/60">{t("totalOwed")}</p>
            <p className={`text-2xl font-bold mt-1 tracking-tight ${(customer.currentBalance ?? 0) > 0 ? "text-[var(--color-warning)]" : "text-[var(--color-success)]"}`}>
              ₹{fmt(customer.currentBalance)}
            </p>
          </div>
          {safeNum(customer.currentBalance) > 0 && (
            <button onClick={onRecordPayment} className="px-4 py-2 bg-[var(--color-success)] text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity shadow-sm">
              {t("recordPayment")}
            </button>
          )}
        </div>
      </div>
      {(customer.creditLimit ?? 0) > 0 && (
        <>
          <div className="glass-card p-6 hover:-translate-y-1 transition-all">
            <p className="text-sm font-semibold text-[var(--foreground)]/60 mb-1">{t("creditLimit")}</p>
            <p className="text-2xl font-bold text-[var(--foreground)] tracking-tight">₹{fmt(customer.creditLimit)}</p>
          </div>
          <div className="glass-card p-6 bg-[var(--color-success)]/5 border border-[var(--color-success)]/10 hover:-translate-y-1 transition-all">
            <p className="text-sm font-semibold text-[var(--color-success)] mb-1">{t("availableCredit")}</p>
            <p className="text-2xl font-bold text-[var(--color-success)] tracking-tight">
              ₹{fmt(Math.max(0, safeNum(customer.creditLimit) - safeNum(customer.currentBalance)))}
            </p>
          </div>
        </>
      )}
      {accruedFines > 0 && (
        <div className="bg-[var(--color-danger)]/5 backdrop-blur-3xl p-6 rounded-3xl border border-[var(--color-danger)]/20 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-[var(--color-danger)]/80">{t("accruedFines")}</p>
          <p className="text-2xl font-bold text-[var(--color-danger)] mt-1 tracking-tight">{formatCurrency(accruedFines)}</p>
        </div>
      )}
    </FadeIn>
  );
}
