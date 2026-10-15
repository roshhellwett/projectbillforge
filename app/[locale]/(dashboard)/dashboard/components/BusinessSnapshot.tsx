import { getTranslations } from "next-intl/server";
import { Activity, AlertTriangle, ArrowUpRight, FileText, Package, Users } from "lucide-react";
import { Link } from "@/i18n/routing";
import { DashboardDataState } from "./DashboardDataState";

interface SalesSummary {
  totalCustomers: number;
  totalInvoices: number;
}

interface ProductResult {
  id: string;
}

interface LowStockProduct {
  id: string;
  name: string;
  stockQuantity: number | null;
  lowStockThreshold: number | null;
}

export async function BusinessSnapshot({
  salesPromise,
  productsPromise,
  lowStockPromise,
}: {
  salesPromise: Promise<{ success?: boolean; summary?: SalesSummary }>;
  productsPromise: Promise<{ success?: boolean; products?: ProductResult[]; total?: number }>;
  lowStockPromise: Promise<{ success?: boolean; products?: LowStockProduct[] }>;
}) {
  const t = await getTranslations("Dashboard");
  const [salesResult, productsResult, lowStockResult] = await Promise.all([
    salesPromise,
    productsPromise,
    lowStockPromise,
  ]);

  const hasSalesData = salesResult.success === true && salesResult.summary !== undefined;
  const hasProductsData = productsResult.success === true;
  const hasLowStockData = lowStockResult.success === true;

  if (!hasSalesData && !hasProductsData && !hasLowStockData) {
    return (
      <section aria-labelledby="dashboard-snapshot-title" className="glass-card flex h-full flex-col p-5 sm:p-6 md:p-7 lg:p-8">
        <SnapshotHeading title={t("snapshotTitle")} />
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

  const summary = salesResult.summary;
  const totalProducts = hasProductsData
    ? productsResult.total ?? productsResult.products?.length ?? 0
    : null;
  const lowStockCount = hasLowStockData ? lowStockResult.products?.length ?? 0 : null;

  const items = [
    {
      icon: Users,
      label: t("snapshotCustomers"),
      value: summary?.totalCustomers ?? null,
      href: "/dashboard/customers" as const,
    },
    {
      icon: Package,
      label: t("snapshotProducts"),
      value: totalProducts,
      href: "/dashboard/products" as const,
    },
    {
      icon: FileText,
      label: t("snapshotInvoices"),
      value: summary?.totalInvoices ?? null,
      href: "/dashboard/invoices" as const,
    },
    {
      icon: AlertTriangle,
      label: t("snapshotLowStock"),
      value: lowStockCount,
      href: "/dashboard/products" as const,
    },
  ];

  return (
    <section aria-labelledby="dashboard-snapshot-title" className="glass-card flex h-full flex-col p-5 sm:p-6 md:p-7 lg:p-8">
      <div className="flex items-center justify-between gap-3">
        <SnapshotHeading title={t("snapshotTitle")} />
        <span className="badge badge-success shrink-0 text-[10px]">{t("snapshotStatus")}</span>
      </div>

      <div className="mt-5 flex flex-1 flex-col justify-around gap-3">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            aria-label={`${item.label}: ${item.value ?? "—"}`}
            className="group flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
          >
            <span className="flex items-center gap-3.5">
              <span className="flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 text-[var(--foreground)]">
                <item.icon size={18} aria-hidden="true" />
              </span>
              <span className="text-xs font-semibold text-[var(--foreground)]/80 transition-colors group-hover:text-[var(--foreground)] sm:text-sm">
                {item.label}
              </span>
            </span>
            <span className="flex items-center gap-2">
              <span className="font-mono text-base font-black text-[var(--foreground)] sm:text-lg">
                {item.value === null ? "—" : item.value.toLocaleString("en-IN")}
              </span>
              <ArrowUpRight size={14} aria-hidden="true" className="text-[var(--foreground)]/35 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>

      {(!hasSalesData || !hasProductsData || !hasLowStockData) && (
        <p className="mt-4 flex items-center gap-2 text-xs text-[var(--foreground)]/55" role="status">
          <Activity size={14} aria-hidden="true" />
          {t("dashboardPartialData")}
        </p>
      )}
    </section>
  );
}

function SnapshotHeading({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="rounded-xl bg-[var(--color-primary)]/10 p-2.5 text-[var(--color-primary)]">
        <Activity size={18} aria-hidden="true" />
      </div>
      <h2 id="dashboard-snapshot-title" className="text-base font-extrabold tracking-tight text-[var(--foreground)] sm:text-lg">{title}</h2>
    </div>
  );
}
