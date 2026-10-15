"use client";

import { useTranslations } from "next-intl";
import { Plus, Receipt } from "lucide-react";
import { FadeIn } from "@/components/ui/MotionWrapper";

export function InvoiceHeader({
  onAdd,
  disabled = false,
  invoiceCount,
}: {
  onAdd: () => void;
  disabled?: boolean;
  invoiceCount?: number;
}) {
  const t = useTranslations("Invoices");
  return (
    <FadeIn className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-6 border border-[var(--border)] card-hover-lift">
      <div className="flex items-center gap-3.5">
        <div className="p-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)] shadow-sm shrink-0 flex items-center justify-center font-bold">
          <Receipt size={24} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--foreground)]">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--foreground)]/60 mt-0.5">
            {t("subtitle")}
          </p>
          {typeof invoiceCount === "number" && invoiceCount > 0 && (
            <p className="text-xs font-semibold text-[var(--foreground)]/50 mt-2">
              {t("invoiceCount", { count: invoiceCount })}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onAdd}
        disabled={disabled}
        className="w-full sm:w-auto bg-zinc-900 dark:bg-zinc-100 hover:brightness-110 text-white dark:text-zinc-900 font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 group shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        <Plus size={18} className="group-hover:rotate-90 transition-transform" />
        <span>{t("newInvoice")}</span>
      </button>
    </FadeIn>
  );
}
