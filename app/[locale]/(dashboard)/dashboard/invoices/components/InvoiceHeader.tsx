"use client";

import { useTranslations } from "next-intl";
import { Plus, Receipt, Sparkles } from "lucide-react";
import { FadeIn } from "@/components/ui/MotionWrapper";

export function InvoiceHeader({ onAdd }: { onAdd: () => void }) {
  const t = useTranslations("Invoices");
  return (
    <FadeIn className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-6 border border-[var(--border)] card-hover-lift">
      <div className="flex items-center gap-3.5">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-lg shadow-blue-500/25 shrink-0 flex items-center justify-center font-bold">
          <Receipt size={24} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--foreground)] flex items-center gap-2">
            {t("title")}
            <span className="badge badge-success text-[10px] hidden sm:inline-flex items-center gap-1">
              <Sparkles size={10} /> GST Ready
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--foreground)]/60 mt-0.5">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <button
        onClick={onAdd}
        className="w-full sm:w-auto bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] hover:brightness-110 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 group shrink-0"
      >
        <Plus size={18} className="group-hover:rotate-90 transition-transform" />
        <span>{t("newInvoice")}</span>
      </button>
    </FadeIn>
  );
}
