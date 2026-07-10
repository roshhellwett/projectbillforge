"use client";

import { Package } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  visible: boolean;
}

export function EmptyState({ visible }: Props) {
  const t = useTranslations("Products");
  if (!visible) return null;
  return (
    <div className="p-12 text-center">
      <Package size={40} className="mx-auto mb-3 text-[var(--foreground)]/15" />
      <p className="text-[var(--foreground)]/50 font-medium">{t("noProducts")}</p>
    </div>
  );
}
