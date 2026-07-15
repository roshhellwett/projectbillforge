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
      bgClass: "bg-zinc-900 dark:bg-zinc-950 text-white border border-zinc-800 shadow-xl",
      iconBg: "bg-white/10 text-white",
      badgeClass: "bg-white/20 text-white border border-white/30",
    },
    {
      label: t("overviewTotalSales"),
      value: formatCurrency(summary?.totalSales),
      icon: DollarSign,
      badge: "Gross Volume",
      bgClass: "bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] shadow-sm",
      iconBg: "bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)]",
      badgeClass: "bg-[var(--surface-elevated)] text-[var(--foreground)]/70 border border-[var(--border)]",
    },
    {
      label: t("overviewTotalInvoices"),
      value: (summary?.totalInvoices ?? 0).toLocaleString("en-IN"),
      icon: FileText,
      badge: "GST Bills",
      bgClass: "bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] shadow-sm",
      iconBg: "bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)]",
      badgeClass: "bg-[var(--surface-elevated)] text-[var(--foreground)]/70 border border-[var(--border)]",
    },
    {
      label: t("overviewReceivables"),
      value: formatCurrency(summary?.totalReceivable),
      icon: Users,
      badge: "Pending Khata",
      bgClass: "bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] shadow-sm",
      iconBg: "bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)]",
      badgeClass: "bg-[var(--surface-elevated)] text-[var(--foreground)]/70 border border-[var(--border)]",
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
          const isFeatured = card.bgClass.includes("bg-zinc-900");
          return (
            <InteractiveItem key={card.label}>
              <div className={`p-5 sm:p-6 rounded-3xl transition-all duration-300 card-hover-lift ${card.bgClass} flex flex-col justify-between h-36 sm:h-40 relative overflow-hidden`}>
                <div className="flex items-center justify-between z-10">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2.5 rounded-2xl ${card.iconBg} flex items-center justify-center font-bold`}>
                      <card.icon size={18} />
                    </div>
                    <span className={`text-xs font-bold tracking-wide uppercase truncate ${isFeatured ? "text-white/90" : "text-[var(--foreground)]/70"}`}>
                      {card.label}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${card.badgeClass}`}>
                    {card.badge}
                  </span>
                </div>

                <div className="z-10 mt-4">
                  <p className={`text-2xl sm:text-3xl font-black tracking-tight font-mono truncate ${isFeatured ? "text-white" : "text-[var(--foreground)]"}`}>
                    {card.value}
                  </p>
                </div>
              </div>
            </InteractiveItem>
          );
        })}
      </div>
    </div>
  );
}
