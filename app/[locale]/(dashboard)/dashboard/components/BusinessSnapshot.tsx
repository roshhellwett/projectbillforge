import { getTranslations } from "next-intl/server";
import { Users, Package, FileText, AlertTriangle, Activity } from "lucide-react";

interface SalesSummary { totalCustomers: number; totalInvoices: number; todaySales: number; totalSales: number; totalReceivable: number }

export async function BusinessSnapshot({
  salesPromise, productsPromise, lowStockPromise,
}: {
  salesPromise: Promise<{ success?: boolean; summary?: SalesSummary }>;
  productsPromise: Promise<{ success?: boolean; products?: { id: string }[] }>;
  lowStockPromise: Promise<{ success?: boolean; products?: { id: string; name: string; stockQuantity: number | null; lowStockThreshold: number | null }[] }>;
}) {
  const t = await getTranslations("Dashboard");
  const [salesResult, productsResult, lowStockResult] = await Promise.all([salesPromise, productsPromise, lowStockPromise]);
  const summary = salesResult.success ? (salesResult.summary ?? { totalCustomers: 0, totalInvoices: 0, todaySales: 0, totalSales: 0, totalReceivable: 0 }) : { totalCustomers: 0, totalInvoices: 0, todaySales: 0, totalSales: 0, totalReceivable: 0 };
  const totalProducts = productsResult.success ? (productsResult.products?.length || 0) : 0;
  const lowStock = lowStockResult.success ? (lowStockResult.products || []) : [];

  const items = [
    { icon: Users, label: t("snapshotCustomers"), value: summary.totalCustomers, colorClass: "text-blue-500", bgClass: "bg-blue-500/10 border-blue-500/20" },
    { icon: Package, label: t("snapshotProducts"), value: totalProducts, colorClass: "text-indigo-500", bgClass: "bg-indigo-500/10 border-indigo-500/20" },
    { icon: FileText, label: t("snapshotInvoices"), value: summary.totalInvoices, colorClass: "text-amber-500", bgClass: "bg-amber-500/10 border-amber-500/20" },
    {
      icon: AlertTriangle,
      label: t("snapshotLowStock"),
      value: lowStock?.length || 0,
      colorClass: (lowStock?.length || 0) > 0 ? "text-red-500" : "text-emerald-500",
      bgClass: (lowStock?.length || 0) > 0 ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div className="glass-card p-6 sm:p-8 h-full flex flex-col justify-between card-hover-lift">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <Activity size={18} />
          </div>
          <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-[var(--foreground)]">
            {t("snapshotTitle")}
          </h2>
        </div>
        <span className="badge badge-success text-[10px]">Real-Time Sync</span>
      </div>

      <div className="space-y-3 flex-1 flex flex-col justify-around">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between p-4 bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] transition-all duration-200 border border-[var(--border)] rounded-2xl group"
          >
            <div className="flex items-center gap-3.5">
              <div className={`p-2.5 rounded-xl ${item.bgClass} border flex items-center justify-center`}>
                <item.icon size={18} className={item.colorClass} />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-[var(--foreground)]/80 group-hover:text-[var(--foreground)] transition-colors">
                {item.label}
              </span>
            </div>
            <span className="text-base sm:text-lg font-black font-mono text-[var(--foreground)]">
              {typeof item.value === "number" ? item.value.toLocaleString("en-IN") : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
