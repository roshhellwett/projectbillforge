"use client";

import { useTranslations } from "next-intl";
import { FileText } from "lucide-react";

export function EmptyState({ visible }: { visible: boolean }) {
  const t = useTranslations("Invoices");
  if (!visible) return null;
  return (
    <div className="p-8 sm:p-12 text-center">
      <FileText size={40} className="mx-auto mb-3 text-[var(--foreground)]/15" />
      <p className="text-[var(--foreground)]/50 font-medium">{t("noInvoices")}</p>
    </div>
  );
}
