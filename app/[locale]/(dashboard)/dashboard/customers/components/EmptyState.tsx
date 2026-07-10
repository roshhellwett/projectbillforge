"use client";

import { useTranslations } from "next-intl";
import { Users } from "lucide-react";

export function EmptyState({ visible }: { visible: boolean }) {
  const t = useTranslations("Customers");
  if (!visible) return null;
  return (
    <div className="p-12 text-center">
      <Users size={40} className="mx-auto mb-3 text-[var(--foreground)]/15" />
      <p className="text-[var(--foreground)]/50 font-medium">{t("noCustomers")}</p>
    </div>
  );
}
