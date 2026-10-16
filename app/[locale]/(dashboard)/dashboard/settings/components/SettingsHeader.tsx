"use client";

import { useTranslations } from "next-intl";
import { FadeIn } from "@/components/ui/MotionWrapper";
import { AlertCircle, CheckCircle2, LoaderCircle, Save, Settings as SettingsIcon } from "lucide-react";

interface Props {
  saving: boolean;
  isDirty: boolean;
  onSave: () => void;
  saveError?: string | null;
  saveSuccess?: string | null;
}

export function SettingsHeader({ saving, isDirty, onSave, saveError, saveSuccess }: Props) {
  const t = useTranslations("Settings");
  const statusMessage = saving
    ? t("savingStatus")
    : saveError
      ? saveError
      : saveSuccess;

  return (
    <FadeIn className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 glass-card p-5 sm:p-6 border border-[var(--border)]">
      <div className="flex items-center gap-3.5">
        <div className="p-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)] shadow-sm shrink-0 flex items-center justify-center font-bold">
          <SettingsIcon size={24} aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--foreground)]">
            {t("title")}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--foreground)]/60 mt-0.5">
            {t("subtitle")}
          </p>
          <p className="text-xs text-[var(--foreground)]/45 mt-1">
            {t("settingsSaveHint")}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onSave}
        disabled={saving || !isDirty}
        className="w-full sm:w-auto bg-zinc-900 dark:bg-zinc-100 hover:brightness-110 text-white dark:text-zinc-900 font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
      >
        <Save size={18} aria-hidden="true" className={saving ? "animate-spin" : ""} />
        <span>{saving ? t("saving") : t("saveChanges")}</span>
        {isDirty && !saving && (
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 dark:bg-zinc-600 animate-ping ml-1" />
        )}
      </button>

      {statusMessage && (
        <div
          role={saveError ? "alert" : "status"}
          aria-live={saveError ? "assertive" : "polite"}
          data-settings-save-status="true"
          tabIndex={-1}
          className={`w-full sm:w-auto sm:max-w-xs flex items-start gap-2 text-xs font-semibold ${saveError ? "text-[var(--color-danger)]" : "text-[var(--foreground)]/70"}`}
        >
          {saving ? <LoaderCircle size={16} aria-hidden="true" className="mt-0.5 shrink-0 animate-spin" /> : saveError ? <AlertCircle size={16} aria-hidden="true" className="mt-0.5 shrink-0" /> : <CheckCircle2 size={16} aria-hidden="true" className="mt-0.5 shrink-0" />}
          <span>{statusMessage}</span>
        </div>
      )}
    </FadeIn>
  );
}
