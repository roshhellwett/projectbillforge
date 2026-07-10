import { getTranslations } from "next-intl/server";
import { FileText, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/routing";

export async function WelcomeBanner({ salesPromise }: { salesPromise: Promise<{ success?: boolean; summary?: { totalInvoices: number } }> }) {
  const t = await getTranslations("Dashboard");
  const salesResult = await salesPromise;
  const summary = salesResult.success ? salesResult.summary : { totalInvoices: 0 };

  return (
    <div className="white-container p-6 sm:p-8 md:p-10 flex items-center justify-between relative overflow-hidden">
      <div className="relative z-10 max-w-xl">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--foreground)] tracking-tight">{t("welcomeTitle")}</h1>
        <p className="text-[var(--foreground)]/60 mt-1 text-sm md:text-base">{t("welcomeSubtitle", { count: summary?.totalInvoices ?? 0 })}</p>
        <Link href="/dashboard/invoices?new=true" className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-white text-sm font-medium rounded-full hover:opacity-90 transition-all">
          {t("welcomeNewInvoice")} <ArrowUpRight size={14} />
        </Link>
      </div>
      <div className="hidden md:flex shrink-0 opacity-90 relative z-10 mr-10">
        <div className="w-32 h-32 bg-[var(--color-primary)]/5 rounded-3xl rotate-12 flex items-center justify-center transform hover:rotate-6 transition-transform duration-500">
          <FileText size={48} className="text-[var(--color-primary)]/60 -rotate-12" />
        </div>
      </div>
      <div className="absolute -top-20 -right-10 w-64 h-64 bg-slate-100 dark:bg-slate-800/20 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
