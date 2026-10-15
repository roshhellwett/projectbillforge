import { getTranslations } from "next-intl/server";
import { FileText, ArrowUpRight, Sparkles, Plus } from "lucide-react";
import { Link } from "@/i18n/routing";

export async function WelcomeBanner({
  salesPromise,
}: {
  salesPromise: Promise<{
    success?: boolean;
    summary?: { totalInvoices: number };
  }>;
}) {
  const t = await getTranslations("Dashboard");
  const salesResult = await salesPromise;
  const summary = salesResult.success === true ? salesResult.summary : undefined;
  const hasSalesData = summary !== undefined;
  const totalInvoices = summary?.totalInvoices ?? 0;

  return (
    <section aria-labelledby="dashboard-welcome-title" className="glass-card relative flex flex-col items-start justify-between overflow-hidden bg-[var(--surface)] p-6 shadow-sm sm:p-8 md:flex-row md:items-center md:p-10">
      <div className="relative z-10 max-w-2xl">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-1 text-xs font-bold text-[var(--foreground)]/80">
          <Sparkles size={13} aria-hidden="true" /> {t("workspaceLabel")}
        </div>
        <h1 id="dashboard-welcome-title" className="text-2xl font-black leading-tight tracking-tight text-[var(--foreground)] sm:text-3xl md:text-4xl">
          {t("welcomeTitle")}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]/70 sm:text-base text-balance">
          {hasSalesData ? t("welcomeSubtitle", { count: totalInvoices }) : t("dashboardDataErrorDescription")}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3" aria-label={t("quickActionsTitle")}>
          <Link
            href="/dashboard/invoices?new=true"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] active:scale-95 dark:bg-zinc-100 dark:text-zinc-900 sm:px-6"
          >
            <Plus size={16} aria-hidden="true" /> {t("welcomeNewInvoice")}
          </Link>
          <Link
            href="/dashboard/khata"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition-all hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] sm:px-5"
          >
            {t("welcomeKhata")} <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="relative z-10 mr-8 hidden shrink-0 opacity-90 md:flex">
        <div className="flex h-36 w-36 rotate-6 items-center justify-center rounded-3xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-md transition-transform duration-500 hover:rotate-0">
          <FileText size={56} aria-hidden="true" className="text-[var(--foreground)]/80" />
        </div>
      </div>
    </section>
  );
}
