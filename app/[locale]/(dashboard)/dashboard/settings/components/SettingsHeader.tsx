"use client";

import { useTranslations } from "next-intl";
import { FadeIn } from "@/components/ui/MotionWrapper";
import { Save } from "lucide-react";

interface Props {
  saving: boolean;
  isDirty: boolean;
  onSave: () => void;
}

export function SettingsHeader({ saving, isDirty, onSave }: Props) {
  const t = useTranslations("Settings");
  return (
    <FadeIn className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">{t("title")}</h1>
        <p className="text-[var(--foreground)]/60 mt-1">{t("subtitle")}</p>
      </div>
      <button
        onClick={onSave}
        disabled={saving || !isDirty}
        className="glass-btn-primary px-6 flex items-center gap-2 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Save size={16} />
        {saving ? t("saving") : t("saveChanges")}
        {isDirty && !saving && (
          <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
        )}
      </button>
    </FadeIn>
  );
}
