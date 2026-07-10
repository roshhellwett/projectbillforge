"use client";

import { useTranslations } from "next-intl";
import { FadeIn } from "@/components/ui/MotionWrapper";
import { Plus } from "lucide-react";

interface Props {
  onAdd: () => void;
}

export function ProductHeader({ onAdd }: Props) {
  const t = useTranslations("Products");
  return (
    <FadeIn className="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">{t("title")}</h1>
        <p className="text-[var(--foreground)]/60 mt-1">{t("subtitle")}</p>
      </div>
      <button onClick={onAdd} className="glass-btn-primary flex items-center gap-2">
        <Plus size={20} />
        {t("addProduct")}
      </button>
    </FadeIn>
  );
}
