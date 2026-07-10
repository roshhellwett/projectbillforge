import { getTranslations } from "next-intl/server";
import { DollarSign, FileText, Users, TrendingUp, ArrowUpRight } from "lucide-react";
import { InteractiveItem } from "@/components/ui/MotionWrapper";
import { formatCurrency } from "@/lib/formatters";
import { Link } from "@/i18n/routing";

export async function OverviewCards({ salesPromise }: { salesPromise: Promise<{ success?: boolean; summary?: { todaySales: number; totalSales: number; totalInvoices: number; totalReceivable: number } }> }) {
  const t = await getTranslations("Dashboard");
  const salesResult = await salesPromise;
  const summary = salesResult.success ? salesResult.summary : { todaySales: 0, totalSales: 0, totalInvoices: 0, totalReceivable: 0 };

  const statCards = [
    { label: t("overviewTodaySales"), value: formatCurrency(summary?.todaySales), icon: TrendingUp, gradClass: "grad-purple" },
    { label: t("overviewTotalSales"), value: formatCurrency(summary?.totalSales), icon: DollarSign, gradClass: "grad-blue" },
    { label: t("overviewTotalInvoices"), value: (summary?.totalInvoices ?? 0).toString(), icon: FileText, gradClass: "white-container border-none shadow-sm" },
    { label: t("overviewReceivables"), value: formatCurrency(summary?.totalReceivable), icon: Users, gradClass: "grad-pink" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-[var(--foreground)]/70 tracking-wide uppercase">{t("overviewTitle")}</h2>
        <Link href="/dashboard/invoices" className="text-[10px] sm:text-xs font-semibold text-[var(--foreground)]/40 hover:text-[var(--color-primary)] flex items-center gap-1 transition-colors">{t("overviewViewAll")} <ArrowUpRight size={14} /></Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {statCards.map((card) => {
          const isGradient = card.gradClass.includes("grad-");
          return (
            <InteractiveItem key={card.label}>
              <div className={`p-5 sm:p-6 group cursor-pointer flex flex-col justify-center rounded-3xl transition-transform hover:-translate-y-1 ${card.gradClass} h-full`}>
                <div className="flex items-center gap-2 mb-3">
                  <card.icon size={16} className={isGradient ? "text-white/90" : "text-[var(--color-primary)]"} />
                  <p className={`text-xs font-semibold truncate uppercase tracking-wider ${isGradient ? "text-white/90" : "text-[var(--foreground)]/60"}`}>{card.label}</p>
                </div>
                <p className={`text-2xl sm:text-3xl font-bold tracking-tight truncate ${isGradient ? "text-white" : "text-[var(--foreground)]"}`}>{card.value}</p>
              </div>
            </InteractiveItem>
          );
        })}
      </div>
    </div>
  );
}
