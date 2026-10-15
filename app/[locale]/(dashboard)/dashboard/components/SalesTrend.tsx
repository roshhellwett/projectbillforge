import { getTranslations } from "next-intl/server";
import { BarChart3, TrendingUp } from "lucide-react";
import { Link } from "@/i18n/routing";
import { formatCurrency } from "@/lib/formatters";
import { DashboardDataState } from "./DashboardDataState";

interface SalesDay {
  date: string;
  label: string;
  total: number;
}

export async function SalesTrend({
  weeklyPromise,
}: {
  weeklyPromise: Promise<{ success?: boolean; days?: SalesDay[] }>;
}) {
  const t = await getTranslations("Dashboard");
  const weeklyResult = await weeklyPromise;

  if (!weeklyResult.success) {
    return (
      <section aria-labelledby="dashboard-sales-trend-title" className="glass-card flex h-full flex-col p-5 sm:p-6 md:p-7 lg:p-8">
        <SalesTrendHeading title={t("salesTrendTitle")} subtitle={t("salesTrendSubtitle")} />
        <div className="mt-5">
          <DashboardDataState
            title={t("dashboardDataErrorTitle")}
            description={t("dashboardDataErrorDescription")}
            retryLabel={t("dashboardDataRetry")}
            compact
          />
        </div>
      </section>
    );
  }

  const weeklyData = weeklyResult.days ?? [];
  const weeklyMax = weeklyData.length > 0 ? Math.max(...weeklyData.map((day) => day.total), 1) : 1;
  const weeklyTotal = weeklyData.reduce((acc, day) => acc + day.total, 0);

  return (
    <section aria-labelledby="dashboard-sales-trend-title" className="glass-card flex h-full flex-col p-5 sm:p-6 md:p-7 lg:p-8">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
        <SalesTrendHeading title={t("salesTrendTitle")} subtitle={t("salesTrendSubtitle")} />
        <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3 sm:block sm:border-none sm:bg-transparent sm:p-0 sm:text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]/50">{t("salesTrendWeeklyTotal")}</p>
          <p className="font-mono text-lg font-black text-[var(--color-primary)] sm:text-xl">{formatCurrency(weeklyTotal)}</p>
        </div>
      </div>

      {weeklyData.length === 0 ? (
        <div className="mt-5 flex flex-1 flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] px-5 py-10 text-center">
          <TrendingUp size={28} aria-hidden="true" className="text-[var(--foreground)]/45" />
          <p className="mt-3 text-sm font-bold text-[var(--foreground)]">{t("salesTrendEmpty")}</p>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-[var(--foreground)]/60">{t("salesTrendEmptyHint")}</p>
          <Link
            href="/dashboard/invoices?new=true"
            className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {t("welcomeNewInvoice")}
          </Link>
        </div>
      ) : (
        <div
          className="relative mt-5 min-h-[210px] flex-1 pt-6 pb-2"
          role="img"
          aria-label={t("salesTrendChartLabel", { total: formatCurrency(weeklyTotal) })}
        >
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-8" aria-hidden="true">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-full border-b border-[var(--border)]/50" />
            ))}
          </div>

          <div className="relative z-10 flex h-full items-end justify-between gap-2 px-1 sm:gap-4" aria-hidden="true">
            {weeklyData.map((day, i) => {
              const pct = weeklyMax > 0 ? (day.total / weeklyMax) * 100 : 0;
              const isToday = i === weeklyData.length - 1;
              return (
                <div key={day.date} className="group flex h-full flex-1 flex-col items-center justify-end">
                  {day.total > 0 && (
                    <span className="mb-2 text-[10px] font-bold font-mono text-[var(--foreground)]/70 opacity-80 transition-opacity group-hover:opacity-100 sm:text-xs">
                      {day.total >= 1000 ? `₹${(day.total / 1000).toFixed(1)}k` : `₹${day.total.toFixed(0)}`}
                    </span>
                  )}
                  <div className="flex h-full w-full items-end justify-center">
                    <div
                      className={`w-full max-w-[40px] rounded-t-xl transition-all duration-700 ease-out group-hover:brightness-110 ${
                        isToday
                          ? "bg-zinc-900 shadow-sm dark:bg-zinc-100"
                          : "bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                      }`}
                      style={{ height: `${Math.max(pct, 5)}%`, minHeight: "8px" }}
                    />
                  </div>
                  <span className={`mt-2.5 text-[10px] font-bold sm:text-xs ${isToday ? "scale-105 font-black text-[var(--foreground)]" : "text-[var(--foreground)]/60"}`}>
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>

          <ul className="sr-only">
            {weeklyData.map((day) => (
              <li key={day.date}>{`${day.label}: ${formatCurrency(day.total)}`}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function SalesTrendHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 p-3 text-[var(--color-primary)]">
        <BarChart3 size={22} aria-hidden="true" />
      </div>
      <div>
        <h2 id="dashboard-sales-trend-title" className="text-base font-extrabold tracking-tight text-[var(--foreground)] sm:text-lg">{title}</h2>
        <p className="text-xs text-[var(--foreground)]/60">{subtitle}</p>
      </div>
    </div>
  );
}
