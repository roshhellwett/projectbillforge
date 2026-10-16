"use client";

import { useTranslations } from "next-intl";
import { Github, Info, Mail } from "lucide-react";

export function AboutSection() {
  const t = useTranslations("Settings");

  return (
    <section aria-labelledby="about-title" className="glass-card p-5 sm:p-8">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)] shrink-0">
          <Info size={18} aria-hidden="true" />
        </div>
        <div>
          <h2 id="about-title" className="text-lg font-semibold text-[var(--foreground)]">{t("aboutTitle")}</h2>
          <p className="text-sm text-[var(--foreground)]/60 mt-1">{t("aboutVersion")}</p>
        </div>
      </div>

      <div className="w-12 h-px bg-[var(--border)] mx-auto my-6" />

      <p className="text-sm text-[var(--foreground)]/60 text-center">
        <Mail size={14} aria-hidden="true" className="inline-block mr-1.5 align-[-2px]" />
        {t("aboutSupport")} {" "}
        <a href="mailto:zenithprojects@icloud.com" className="text-[var(--color-primary)] hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]">zenithprojects@icloud.com</a>
      </p>

      <p className="text-xs text-[var(--foreground)]/45 mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <Github size={14} aria-hidden="true" />
        <span>{t("aboutDeveloped")}</span>
        <a href="https://github.com/roshhellwett" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)]/70 hover:text-[var(--color-primary)] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]">@roshhellwett</a>
        <span aria-hidden="true">&middot;</span>
        <a href="https://github.com/roshhellwett/projectbillforge" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)]/70 hover:text-[var(--color-primary)] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]">{t("aboutRepository")}</a>
      </p>
    </section>
  );
}
