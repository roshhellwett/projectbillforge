"use client";

import { useTranslations } from "next-intl";

export function AboutSection() {
  const t = useTranslations("Settings");
  return (
    <div className="glass-card p-6 text-center">
      <h3 className="text-sm font-semibold text-[var(--foreground)]/60 mb-1">{t("aboutTitle")}</h3>
      <p className="text-xs text-[var(--foreground)]/40 mb-4">v1.0 &mdash; {t("aboutVersion")}</p>
      <div className="w-12 h-px bg-[var(--border)] mx-auto mb-4" />
      <p className="text-xs text-[var(--foreground)]/50">
        {t("aboutSupport")}{" "}
        <a href="mailto:zenithprojects@icloud.com" className="text-[var(--color-primary)] hover:underline font-medium">zenithprojects@icloud.com</a>
      </p>
      <p className="text-xs text-[var(--foreground)]/35 mt-3">
        {t("aboutDeveloped")}{" "}
        <a href="https://github.com/roshhellwett" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)]/70 hover:text-[var(--color-primary)] font-medium transition-colors">@roshhellwett</a>
        {" "}&middot;{" "}
        <a href="https://github.com/roshhellwett/projectbillforge" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)]/70 hover:text-[var(--color-primary)] font-medium transition-colors">Zenith Open Source</a>
      </p>
    </div>
  );
}
