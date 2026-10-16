"use client";

import { BookOpen } from "lucide-react";
import { StaggerItem } from "@/components/ui/MotionWrapper";
import { useTranslations } from "next-intl";

interface Props {
  loading: boolean;
  hasCustomers: boolean;
}

export function EmptyState({ loading, hasCustomers }: Props) {
  const t = useTranslations("Khata");
  if (loading) return null;
  return (
    <StaggerItem className="glass-card p-8 sm:p-12 text-center mt-6">
      <BookOpen size={40} className="mx-auto mb-3 text-[var(--foreground)]/15" />
      <p className="text-[var(--foreground)]/60 font-bold text-lg">{hasCustomers ? t("selectCustomerPrompt") : t("noCustomers")}</p>
      <p className="text-[var(--foreground)]/40 text-sm mt-1">{hasCustomers ? t("selectCustomerHint") : t("noCustomersHint")}</p>
    </StaggerItem>
  );
}
