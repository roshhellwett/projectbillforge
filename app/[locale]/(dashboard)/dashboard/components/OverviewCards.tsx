import { getTranslations } from "next-intl/server";
import { DollarSign, FileText, Users, TrendingUp, ArrowUpRight, Sparkles } from "lucide-react";
import { InteractiveItem } from "@/components/ui/MotionWrapper";
import { formatCurrency } from "@/lib/formatters";
import { Link } from "@/i18n/routing";

export async function OverviewCards({ salesPromise }: { salesPromise: Promise<{ success?: boolean; summary?: { todaySales: number; totalSales: number; totalInvoices: number; totalReceivable: number } }> }) {
  const t = await getTranslations("Dashboard");
  const salesResult = await salesPromise;
  const summary = salesResult.success ? salesResult.summary : { todaySales: 0, totalSales: 0, totalInvoices: 0, totalReceivable: 0 };

  const statCards = [
    {
      label: t("overviewTodaySales"),
      value: formatCurrency(summary?.todaySales),
      icon: TrendingUp,
      badge: "+Live",
      bgClass: "bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/20",
      iconBg: "bg-white/20 text-white",
    },
    {
      label: t("overviewTotalSales"),
      value: formatCurrency(summary?.totalSales),
      icon: DollarSign,
      badge: "Gross Volume",
      bgClass: "bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/20",
      iconBg: "bg-white/20 text-white",
    },
    {
      label: t("overviewTotalInvoices"),
      value: (summary?.totalInvoices ?? 0).toLocaleString("en-IN"),
      icon: FileText,
      badge: "GST Bills",
      bgClass: "glass-card border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]",
      iconBg: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
    },
    {
      label: t("overviewReceivables"),
      value: formatCurrency(summary?.totalReceivable),
      icon: Users,
      badge: "Pending Khata",
      bgClass: "bg-gradient-to-br from-rose-600 via-pink-600 to-rose-700 text-white shadow-lg shadow-rose-500/20",
      iconBg: "bg-white/20 text-white",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-[var(--foreground)]/60 tracking-wider uppercase flex items-center gap-1.5">
          <Sparkles size={14} className="text-[var(--color-primary)]" /> {t("overviewTitle")}
        </h2>
        <Link
          href="/dashboard/invoices"
          className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1 transition-colors"
        >
          {t("overviewViewAll")} <ArrowUpRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const isGradient = card.bgClass.includes("from-");
          return (
            <InteractiveItem key={card.label}>
              <div className={`p-5 sm:p-6 rounded-3xl transition-all duration-300 card-hover-lift ${card.bgClass} flex flex-col justify-between h-36 sm:h-40 relative overflow-hidden`}>
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2.5 rounded-2xl ${card.iconBg} flex items-center justify-center font-bold`}>
                      <card.icon size={18} />
                    </div>
                    <span className={`text-xs font-bold tracking-wide uppercase truncate ${isGradient ? "text-white/90" : "text-[var(--foreground)]/70"}`}>
                      {card.label}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isGradient ? "bg-white/20 text-white" : "badge badge-success"}`}>
                    {card.badge}
                  </span>
                </div>

                <div className="z-10 mt-4">
                  <p className={`text-2xl sm:text-3xl font-black tracking-tight font-mono truncate ${isGradient ? "text-white" : "text-[var(--foreground)]"}`}>
                    {card.value}
                  </p>
                </div>

                {isGradient && (
                  <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
                )}
              </div>
            </InteractiveItem>
          );
        })}
      </div>
    </div>
  );
}
