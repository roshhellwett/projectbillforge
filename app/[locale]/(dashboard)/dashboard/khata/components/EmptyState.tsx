"use client";

import { BookOpen } from "lucide-react";
import { StaggerItem } from "@/components/ui/MotionWrapper";
import { useTranslations } from "next-intl";

interface Props {
  loading: boolean;
}

export function EmptyState({ loading }: Props) {
  const t = useTranslations("Khata");
  if (loading) return null;
  return (
    <StaggerItem className="glass-card p-8 sm:p-12 text-center mt-6">
      <BookOpen size={40} className="mx-auto mb-3 text-[var(--foreground)]/15" />
      <p className="text-[var(--foreground)]/50 font-medium text-lg">{t("selectCustomerPrompt")}</p>
      <p className="text-[var(--foreground)]/30 text-sm mt-1">{t("selectCustomerHint")}</p>
    </StaggerItem>
  );
}
