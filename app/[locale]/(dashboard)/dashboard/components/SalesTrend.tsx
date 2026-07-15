import { getTranslations } from "next-intl/server";
import { BarChart3, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

export async function SalesTrend({ weeklyPromise }: { weeklyPromise: Promise<{ success?: boolean; days?: { date: string; label: string; total: number }[] }> }) {
  const t = await getTranslations("Dashboard");
  const weeklyResult = await weeklyPromise;
  const data = weeklyResult.success ? (weeklyResult.days ?? []) : [];
  const weeklyMax = data.length > 0 ? Math.max(...data.map((d) => d.total), 1) : 1;
  const weeklyTotal = data.length > 0 ? data.reduce((acc, d) => acc + d.total, 0) : 0;
  const weeklyData = data;

  return (
    <div className="glass-card p-6 sm:p-8 h-full flex flex-col justify-between card-hover-lift">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-2xl flex items-center justify-center font-bold">
            <BarChart3 size={22} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-[var(--foreground)]">
              {t("salesTrendTitle")}
            </h2>
            <p className="text-xs text-[var(--foreground)]/60">
              {t("salesTrendSubtitle")}
            </p>
          </div>
        </div>
        <div className="sm:text-right bg-[var(--surface-elevated)] sm:bg-transparent p-3 sm:p-0 rounded-xl border border-[var(--border)] sm:border-none flex justify-between sm:block items-center">
          <p className="text-[10px] font-bold text-[var(--foreground)]/50 uppercase tracking-wider">
            {t("salesTrendWeeklyTotal")}
          </p>
          <p className="text-lg sm:text-xl font-black font-mono text-[var(--color-primary)]">
            {formatCurrency(weeklyTotal)}
          </p>
        </div>
      </div>

      <div className="relative flex-1 pt-6 pb-2 min-h-[190px] flex flex-col justify-end">
        {/* Horizontal Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border-b border-[var(--border)]/50 w-full" />
          ))}
        </div>

        {/* Bars Grid */}
        <div className="relative z-10 flex items-end justify-between gap-2 sm:gap-4 h-full px-1">
          {weeklyData?.map((day, i) => {
            const pct = weeklyMax > 0 ? (day.total / weeklyMax) * 100 : 0;
            const isToday = i === weeklyData.length - 1;
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center justify-end h-full group">
                {day.total > 0 && (
                  <span className="text-[10px] sm:text-xs font-bold font-mono text-[var(--foreground)]/70 mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    ₹{day.total >= 1000 ? `${(day.total / 1000).toFixed(1)}k` : day.total.toFixed(0)}
                  </span>
                )}
                <div className="w-full flex justify-center h-full items-end">
                  <div
                    className={`w-full max-w-[40px] rounded-t-xl transition-all duration-700 ease-out group-hover:brightness-110 ${
                      isToday
                        ? "bg-zinc-900 dark:bg-zinc-100 shadow-sm"
                        : "bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700"
                    }`}
                    style={{ height: `${Math.max(pct, 5)}%`, minHeight: "8px" }}
                  />
                </div>
                <span className={`text-[10px] sm:text-xs font-bold mt-2.5 ${isToday ? "text-[var(--foreground)] font-black scale-105" : "text-[var(--foreground)]/60"}`}>
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
