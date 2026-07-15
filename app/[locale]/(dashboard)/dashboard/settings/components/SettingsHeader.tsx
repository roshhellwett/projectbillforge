"use client";

import { useTranslations } from "next-intl";
import { FadeIn } from "@/components/ui/MotionWrapper";
import { Save, Settings as SettingsIcon, Sparkles } from "lucide-react";

interface Props {
  saving: boolean;
  isDirty: boolean;
  onSave: () => void;
}

export function SettingsHeader({ saving, isDirty, onSave }: Props) {
  const t = useTranslations("Settings");
  return (
    <FadeIn className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-6 border border-[var(--border)] card-hover-lift">
      <div className="flex items-center gap-3.5">
        <div className="p-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)] shadow-sm shrink-0 flex items-center justify-center font-bold">
          <SettingsIcon size={24} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--foreground)] flex items-center gap-2">
            {t("title")}
            <span className="badge badge-success text-[10px] hidden sm:inline-flex items-center gap-1">
              <Sparkles size={10} /> Control Center
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--foreground)]/60 mt-0.5">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <button
        onClick={onSave}
        disabled={saving || !isDirty}
        className="w-full sm:w-auto bg-zinc-900 dark:bg-zinc-100 hover:brightness-110 text-white dark:text-zinc-900 font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
      >
        <Save size={18} className={saving ? "animate-spin" : ""} />
        <span>{saving ? t("saving") : t("saveChanges")}</span>
        {isDirty && !saving && (
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping ml-1" />
        )}
      </button>
    </FadeIn>
  );
}
