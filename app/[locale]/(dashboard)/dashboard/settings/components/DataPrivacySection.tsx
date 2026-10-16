"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Database, Download, Shield } from "lucide-react";

export function DataPrivacySection() {
  const t = useTranslations("Settings");
  const [exporting, setExporting] = useState(false);
  const [exportState, setExportState] = useState<"idle" | "success" | "error">("idle");

  const handleExport = async () => {
    setExporting(true);
    setExportState("idle");
    try {
      const response = await fetch("/api/data/export", { credentials: "include", cache: "no-store" });
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = response.headers.get("Content-Disposition")?.match(/filename="([^"]+)"/)?.[1] ?? "billforge-export.json";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
      setExportState("success");
    } catch {
      setExportState("error");
    } finally {
      setExporting(false);
    }
  };

  return (
    <section aria-labelledby="data-privacy-title" className="glass-card p-5 sm:p-8">
      <div className="flex items-start gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)] shrink-0">
          <Shield size={18} aria-hidden="true" />
        </div>
        <div>
          <h2 id="data-privacy-title" className="text-lg font-semibold text-[var(--foreground)]">{t("dataPrivacyTitle")}</h2>
          <p className="text-sm text-[var(--foreground)]/60 mt-1">{t("dataPrivacyDescription")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
          <Database size={17} aria-hidden="true" className="text-[var(--foreground)]/60 mb-3" />
          <h3 className="font-semibold text-[var(--foreground)]">{t("dataScopeTitle")}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--foreground)]/65">{t("dataScopeDescription")}</p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4">
          <Download size={17} aria-hidden="true" className="text-[var(--foreground)]/60 mb-3" />
          <h3 className="font-semibold text-[var(--foreground)]">{t("dataExportTitle")}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--foreground)]/65">{t("dataExportDescription")}</p>
          <button
            type="button"
            onClick={() => void handleExport()}
            disabled={exporting}
            className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--foreground)] px-3.5 py-2 text-xs font-bold text-[var(--background)] transition hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-elevated)] disabled:cursor-wait disabled:opacity-50"
          >
            <Download size={15} aria-hidden="true" />
            {exporting ? t("exportingData") : t("exportDataButton")}
          </button>
          {exportState === "success" && <p className="mt-2 text-xs font-semibold text-[var(--color-success)]" role="status">{t("exportSuccess")}</p>}
          {exportState === "error" && <p className="mt-2 text-xs font-semibold text-[var(--color-danger)]" role="alert">{t("exportError")}</p>}
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[var(--foreground)]/55">
        {t("dataPrivacyNote")}{" "}
        <a
          href="mailto:zenithprojects@icloud.com"
          className="font-semibold text-[var(--foreground)] underline underline-offset-4 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        >
          {t("contactSupport")}
        </a>
        .
      </p>
    </section>
  );
}
