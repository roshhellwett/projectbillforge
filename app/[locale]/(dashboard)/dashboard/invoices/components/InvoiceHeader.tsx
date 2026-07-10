"use client";

import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { FadeIn } from "@/components/ui/MotionWrapper";

export function InvoiceHeader({ onAdd }: { onAdd: () => void }) {
  const t = useTranslations("Invoices");
  return (
    <FadeIn className="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">{t("title")}</h1>
        <p className="text-[var(--foreground)]/60 mt-1 text-sm">{t("subtitle")}</p>
      </div>
      <button onClick={onAdd} className="glass-btn-primary flex items-center gap-2 min-h-[44px] px-4 sm:px-6">
        <Plus size={18} />
        <span className="hidden sm:inline">{t("newInvoice")}</span>
        <span className="sm:hidden">New</span>
      </button>
    </FadeIn>
  );
}
