"use client";

import { useTranslations } from "next-intl";
import { Plus, Users, UserRoundCheck } from "lucide-react";
import { FadeIn } from "@/components/ui/MotionWrapper";

interface Props {
  onAdd: () => void;
  totalCustomers: number;
  showingCustomers: number;
  dueCustomers: number;
}

export function CustomerHeader({ onAdd, totalCustomers, showingCustomers, dueCustomers }: Props) {
  const t = useTranslations("Customers");

  return (
    <FadeIn className="glass-card border border-[var(--border)] card-hover-lift">
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <div
            className="p-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)] shadow-sm shrink-0 flex items-center justify-center font-bold"
            aria-hidden="true"
          >
            <Users size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--foreground)]/50 mb-1">
              {t("headerEyebrow")}
            </p>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--foreground)]">
              {t("title")}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--foreground)]/60 mt-1 max-w-2xl">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="w-full sm:w-auto min-h-[44px] bg-zinc-900 dark:bg-zinc-100 hover:brightness-110 text-white dark:text-zinc-900 font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 group shrink-0 cursor-pointer"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" aria-hidden="true" />
          <span>{t("addCustomer")}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 border-t border-[var(--border)] bg-[var(--surface-elevated)]/60">
        <div className="p-4 sm:px-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)]/50">{t("summaryTotal")}</p>
          <p className="mt-1 text-xl font-black text-[var(--foreground)]">{totalCustomers}</p>
        </div>
        <div className="p-4 sm:px-5 border-l border-[var(--border)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)]/50">{t("summaryDue")}</p>
          <p className="mt-1 text-xl font-black text-[var(--foreground)] flex items-center gap-2">
            {dueCustomers}
            <UserRoundCheck size={16} aria-hidden="true" className="text-[var(--foreground)]/45" />
          </p>
        </div>
        <div className="hidden sm:block p-4 sm:px-5 border-l border-[var(--border)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)]/50">{t("summaryShowing")}</p>
          <p className="mt-1 text-xl font-black text-[var(--foreground)]">{showingCustomers}</p>
        </div>
      </div>
    </FadeIn>
  );
}
