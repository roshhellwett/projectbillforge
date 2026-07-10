import { getTranslations } from "next-intl/server";
import { BarChart3 } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

export async function SalesTrend({ weeklyPromise }: { weeklyPromise: Promise<{ success?: boolean; days?: { date: string; label: string; total: number }[] }> }) {
  const t = await getTranslations("Dashboard");
  const weeklyResult = await weeklyPromise;
  const data = weeklyResult.success ? (weeklyResult.days ?? []) : [];
  const weeklyMax = data.length > 0 ? Math.max(...data.map((d) => d.total), 1) : 1;
  const weeklyTotal = data.length > 0 ? data.reduce((acc, d) => acc + d.total, 0) : 0;
  const weeklyData = data;

  return (
    <div className="white-container p-5 sm:p-6 md:p-7 lg:p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-2.5 bg-blue-600/10 rounded-xl">
            <BarChart3 style={{ color: "#2563eb" }} size={20} />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-[var(--foreground)]">{t("salesTrendTitle")}</h2>
            <p className="text-[10px] sm:text-xs text-[var(--foreground)]/40">{t("salesTrendSubtitle")}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] sm:text-[10px] font-medium text-[var(--foreground)]/40 uppercase tracking-wider">{t("salesTrendWeeklyTotal")}</p>
          <p className="text-sm sm:text-lg font-bold text-[var(--foreground)]">{formatCurrency(weeklyTotal)}</p>
        </div>
      </div>

      <div className="relative flex-1" style={{ minHeight: "160px" }}>
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-b border-[var(--border)]/30" />
          ))}
        </div>
        <div className="absolute inset-0 flex items-end gap-1 sm:gap-2 md:gap-3 px-0.5 sm:px-1">
          {weeklyData?.map((day, i) => {
            const pct = weeklyMax > 0 ? (day.total / weeklyMax) * 100 : 0;
            const isToday = i === weeklyData.length - 1;
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center justify-end h-full">
                {day.total > 0 && (
                                    <span className="text-[10px] sm:text-[9px] font-bold text-[var(--foreground)]/50 mb-1 sm:mb-1.5 whitespace-nowrap">
                    ₹{day.total >= 1000 ? `${(day.total / 1000).toFixed(1)}k` : day.total.toFixed(0)}
                  </span>
                )}
                <div
                  className={`w-full max-w-[28px] sm:max-w-[36px] md:max-w-[48px] rounded-t-lg transition-all duration-700 ease-out ${isToday ? "bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "bg-blue-600/30"}`}
                  style={{ height: `${Math.max(pct, 3)}%`, minHeight: "6px" }}
                />
                <span className={`text-[9px] sm:text-[11px] font-semibold mt-1 sm:mt-2 ${isToday ? "text-blue-600" : "text-[var(--foreground)]/40"}`}>{day.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
