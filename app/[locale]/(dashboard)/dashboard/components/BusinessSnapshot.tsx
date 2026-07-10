import { getTranslations } from "next-intl/server";
import { Users, Package, FileText, AlertTriangle } from "lucide-react";

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
    { icon: Users, label: t("snapshotCustomers"), value: summary.totalCustomers, color: "#2563eb", bg: "bg-blue-600/10" },
    { icon: Package, label: t("snapshotProducts"), value: totalProducts, color: "#6366f1", bg: "bg-indigo-500/10" },
    { icon: FileText, label: t("snapshotInvoices"), value: summary.totalInvoices, color: "#f59e0b", bg: "bg-amber-500/10" },
    { icon: AlertTriangle, label: t("snapshotLowStock"), value: lowStock?.length || 0, color: (lowStock?.length || 0) > 0 ? "#ef4444" : "#10b981", bg: (lowStock?.length || 0) > 0 ? "bg-red-500/10" : "bg-emerald-500/10" },
  ];

  return (
    <div className="white-container p-5 sm:p-6 md:p-7 lg:p-8 h-full flex flex-col">
      <h2 className="text-sm sm:text-base font-bold tracking-tight text-[var(--foreground)] mb-3 sm:mb-4">{t("snapshotTitle")}</h2>
      <div className="space-y-2 sm:space-y-3 flex-1">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 transition-colors duration-200 border border-slate-100/50 dark:border-slate-700/30 rounded-xl sm:rounded-2xl">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`p-1.5 sm:p-2 ${item.bg} rounded-lg`}>
                <item.icon size={16} style={{ color: item.color }} />
              </div>
              <span className="text-xs sm:text-sm font-medium text-[var(--foreground)]/70">{item.label}</span>
            </div>
            <span className="text-sm sm:text-base font-bold text-[var(--foreground)]">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
