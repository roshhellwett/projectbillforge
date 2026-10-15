import { getTranslations } from "next-intl/server";
import { ArrowUpRight, DollarSign, FileText, Sparkles, TrendingUp, Users } from "lucide-react";
import { InteractiveItem } from "@/components/ui/MotionWrapper";
import { formatCurrency } from "@/lib/formatters";
import { Link } from "@/i18n/routing";
import { DashboardDataState } from "./DashboardDataState";

interface SalesSummary {
  todaySales: number;
  totalSales: number;
  totalInvoices: number;
  totalReceivable: number;
}

export async function OverviewCards({
  salesPromise,
}: {
  salesPromise: Promise<{ success?: boolean; summary?: SalesSummary }>;
}) {
  const t = await getTranslations("Dashboard");
  const salesResult = await salesPromise;
  const summary = salesResult.success === true ? salesResult.summary : undefined;

  if (!summary) {
    return (
      <section aria-labelledby="dashboard-overview-title">
        <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
          <Sparkles size={14} aria-hidden="true" />
          <h2 id="dashboard-overview-title">{t("overviewTitle")}</h2>
        </div>
        <DashboardDataState
          title={t("dashboardDataErrorTitle")}
          description={t("dashboardDataErrorDescription")}
          retryLabel={t("dashboardDataRetry")}
          compact
        />
      </section>
    );
  }

  const statCards = [
    {
      label: t("overviewTodaySales"),
      value: formatCurrency(summary.todaySales),
      icon: TrendingUp,
      badge: t("overviewLive"),
      href: "/dashboard/invoices" as const,
      bgClass: "bg-zinc-900 dark:bg-zinc-950 text-white border border-zinc-800 shadow-xl",
      iconBg: "bg-white/10 text-white",
      badgeClass: "bg-white/20 text-white border border-white/30",
    },
    {
      label: t("overviewTotalSales"),
      value: formatCurrency(summary.totalSales),
      icon: DollarSign,
      badge: t("overviewGrossVolume"),
      href: "/dashboard/invoices" as const,
      bgClass: "bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] shadow-sm",
      iconBg: "bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)]",
      badgeClass: "bg-[var(--surface-elevated)] text-[var(--foreground)]/70 border border-[var(--border)]",
    },
    {
      label: t("overviewTotalInvoices"),
      value: summary.totalInvoices.toLocaleString("en-IN"),
      icon: FileText,
      badge: t("overviewGstBills"),
      href: "/dashboard/invoices" as const,
      bgClass: "bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] shadow-sm",
      iconBg: "bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)]",
      badgeClass: "bg-[var(--surface-elevated)] text-[var(--foreground)]/70 border border-[var(--border)]",
    },
    {
      label: t("overviewReceivables"),
      value: formatCurrency(summary.totalReceivable),
      icon: Users,
      badge: t("overviewPendingKhata"),
      href: "/dashboard/khata" as const,
      bgClass: "bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] shadow-sm",
      iconBg: "bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)]",
      badgeClass: "bg-[var(--surface-elevated)] text-[var(--foreground)]/70 border border-[var(--border)]",
    },
  ];

  return (
    <section aria-labelledby="dashboard-overview-title">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="dashboard-overview-title" className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
          <Sparkles size={14} aria-hidden="true" className="text-[var(--color-primary)]" /> {t("overviewTitle")}
        </h2>
        <Link
          href="/dashboard/invoices"
          className="flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-bold text-[var(--color-primary)] transition-colors hover:bg-[var(--surface-elevated)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        >
          {t("overviewViewAll")} <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const isFeatured = card.bgClass.includes("bg-zinc-900");
          return (
            <InteractiveItem key={card.label}>
              <Link
                href={card.href}
                aria-label={`${card.label}: ${card.value}`}
                className={`relative flex h-36 flex-col justify-between overflow-hidden rounded-3xl p-5 transition-all duration-300 card-hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] sm:h-40 sm:p-6 ${card.bgClass}`}
              >
                <div className="z-10 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className={`flex shrink-0 items-center justify-center rounded-2xl p-2.5 font-bold ${card.iconBg}`}>
                      <card.icon size={18} aria-hidden="true" />
                    </div>
                    <span className={`truncate text-xs font-bold uppercase tracking-wide ${isFeatured ? "text-white/90" : "text-[var(--foreground)]/70"}`}>
                      {card.label}
                    </span>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${card.badgeClass}`}>
                    {card.badge}
                  </span>
                </div>

                <div className="z-10 mt-4">
                  <p className={`truncate font-mono text-2xl font-black tracking-tight sm:text-3xl ${isFeatured ? "text-white" : "text-[var(--foreground)]"}`}>
                    {card.value}
                  </p>
                </div>
              </Link>
            </InteractiveItem>
          );
        })}
      </div>
    </section>
  );
}
