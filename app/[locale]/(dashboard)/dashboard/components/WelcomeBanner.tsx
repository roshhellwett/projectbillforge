import { getTranslations } from "next-intl/server";
import { FileText, ArrowUpRight, Sparkles, Plus } from "lucide-react";
import { Link } from "@/i18n/routing";

export async function WelcomeBanner({ salesPromise }: { salesPromise: Promise<{ success?: boolean; summary?: { totalInvoices: number } }> }) {
  const t = await getTranslations("Dashboard");
  const salesResult = await salesPromise;
  const summary = salesResult.success ? salesResult.summary : { totalInvoices: 0 };

  return (
    <div className="glass-card p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between relative overflow-hidden bg-[var(--surface)] border border-[var(--border)] card-hover-lift shadow-sm">
      <div className="relative z-10 max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)]/80 text-xs font-bold mb-3">
          <Sparkles size={13} className="text-amber-500" /> Cloud Workspace Sync
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--foreground)] tracking-tight leading-tight">
          {t("welcomeTitle")}
        </h1>
        <p className="text-[var(--foreground)]/70 mt-2 text-sm sm:text-base leading-relaxed text-balance">
          {t("welcomeSubtitle", { count: summary?.totalInvoices ?? 0 })}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/invoices?new=true"
            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-bold rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            <Plus size={16} /> {t("welcomeNewInvoice")}
          </Link>
          <Link
            href="/dashboard/khata"
            className="inline-flex items-center gap-1.5 px-5 py-3 bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--foreground)] text-sm font-semibold rounded-xl transition-all"
          >
            Open Khata Ledger <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>

      <div className="hidden md:flex shrink-0 opacity-90 relative z-10 mr-8">
        <div className="w-36 h-36 bg-[var(--surface-elevated)] rounded-3xl rotate-6 flex items-center justify-center transform hover:rotate-0 transition-transform duration-500 border border-[var(--border)] shadow-md">
          <FileText size={56} className="text-[var(--foreground)]/80" />
        </div>
      </div>
    </div>
  );
}
