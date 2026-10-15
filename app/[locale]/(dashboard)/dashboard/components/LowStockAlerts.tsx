import { getTranslations } from "next-intl/server";
import { AlertTriangle, CheckCircle2, Package } from "lucide-react";
import { Link } from "@/i18n/routing";
import { DashboardDataState } from "./DashboardDataState";

interface LowStockProduct {
  id: string;
  name: string;
  stockQuantity: number | null;
  lowStockThreshold: number | null;
}

export async function LowStockAlerts({
  lowStockPromise,
}: {
  lowStockPromise: Promise<{ success?: boolean; products?: LowStockProduct[] }>;
}) {
  const t = await getTranslations("Dashboard");
  const lowStockResult = await lowStockPromise;
  const lowStock = lowStockResult.success ? lowStockResult.products ?? [] : [];

  return (
    <section aria-labelledby="dashboard-low-stock-title" className="glass-card p-5 sm:p-6 md:p-7">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-2.5 text-[var(--foreground)]">
            <AlertTriangle size={18} aria-hidden="true" />
          </div>
          <h2 id="dashboard-low-stock-title" className="text-base font-extrabold tracking-tight text-[var(--foreground)] sm:text-lg">
            {t("lowStockTitle")}
          </h2>
        </div>
        <Link
          href="/dashboard/products"
          className="flex min-h-9 items-center rounded-lg px-2 text-xs font-bold text-[var(--color-primary)] transition-colors hover:bg-[var(--surface-elevated)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        >
          {t("lowStockManageInventory")}
        </Link>
      </div>

      {!lowStockResult.success ? (
        <DashboardDataState
          title={t("dashboardDataErrorTitle")}
          description={t("dashboardDataErrorDescription")}
          retryLabel={t("dashboardDataRetry")}
        />
      ) : lowStock.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] px-5 py-10 text-center">
          <div className="rounded-full bg-zinc-200 p-3 text-[var(--foreground)] dark:bg-zinc-800">
            <CheckCircle2 size={28} aria-hidden="true" />
          </div>
          <p className="mt-2 text-sm font-bold text-[var(--foreground)]">{t("lowStockWellStocked")}</p>
          <p className="mt-1 text-xs text-[var(--foreground)]/50">{t("lowStockWellStockedHint")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lowStock.map((product) => (
            <Link
              key={product.id}
              href="/dashboard/products"
              aria-label={`${product.name}: ${t("lowStockCount", { count: product.stockQuantity ?? 0 })}`}
              className="group flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="shrink-0 rounded-lg bg-zinc-200 p-2 text-[var(--foreground)] dark:bg-zinc-800">
                  <Package size={16} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-[var(--foreground)] transition-colors group-hover:text-[var(--color-primary)]">{product.name}</span>
                  <span className="block text-[11px] text-[var(--foreground)]/50">{t("lowStockThreshold", { threshold: product.lowStockThreshold ?? 0 })}</span>
                </span>
              </span>
              <span className="badge badge-danger shrink-0 font-mono font-bold">{t("lowStockCount", { count: product.stockQuantity ?? 0 })}</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
