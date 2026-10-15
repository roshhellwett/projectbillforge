import { getTranslations } from "next-intl/server";
import { ArrowUpRight, BookOpen, Users } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { Link } from "@/i18n/routing";
import { DashboardDataState } from "./DashboardDataState";

interface ReceivableCustomer {
  id: string;
  name: string;
  currentBalance: number | null;
}

export async function TopReceivables({
  customersPromise,
}: {
  customersPromise: Promise<{ success?: boolean; customers?: ReceivableCustomer[] }>;
}) {
  const t = await getTranslations("Dashboard");
  const customersResult = await customersPromise;
  const topCustomers = customersResult.success ? customersResult.customers ?? [] : [];

  return (
    <section aria-labelledby="dashboard-top-receivables-title" className="glass-card flex h-full flex-col p-5 sm:p-6 md:p-7 lg:p-8">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-2.5 text-[var(--foreground)]">
            <BookOpen size={18} aria-hidden="true" />
          </div>
          <h2 id="dashboard-top-receivables-title" className="text-base font-extrabold tracking-tight text-[var(--foreground)] sm:text-lg">
            {t("topReceivablesTitle")}
          </h2>
        </div>
        <span className="badge badge-warning shrink-0 text-[10px]">{t("topReceivablesBadge")}</span>
      </div>

      {!customersResult.success ? (
        <DashboardDataState
          title={t("dashboardDataErrorTitle")}
          description={t("dashboardDataErrorDescription")}
          retryLabel={t("dashboardDataRetry")}
        />
      ) : topCustomers.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] px-5 py-10 text-center text-[var(--foreground)]/50">
          <Users size={32} aria-hidden="true" className="opacity-40" />
          <p className="mt-2 text-sm font-semibold">{t("topReceivablesEmpty")}</p>
        </div>
      ) : (
        <div className="flex-1 space-y-2.5">
          {topCustomers.map((customer) => (
            <Link
              key={customer.id}
              href="/dashboard/khata"
              aria-label={`${customer.name}: ${formatCurrency(customer.currentBalance)}`}
              className="group flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-3.5 transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] sm:p-4"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] font-mono text-xs font-bold text-[var(--foreground)]">
                  {customer.name ? customer.name.substring(0, 2).toUpperCase() : "CU"}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-bold text-[var(--foreground)] transition-colors group-hover:text-[var(--color-primary)] sm:text-sm">{customer.name}</span>
                  <span className="block text-[10px] text-[var(--foreground)]/50">{t("khataCustomerLabel")}</span>
                </span>
              </span>
              <span className="shrink-0 font-mono text-sm font-black text-[var(--color-danger)] sm:text-base">{formatCurrency(customer.currentBalance)}</span>
            </Link>
          ))}
        </div>
      )}

      <Link
        href="/dashboard/khata"
        className="mt-5 flex min-h-10 items-center justify-center gap-1 border-t border-[var(--border)] pt-4 text-center text-xs font-bold text-[var(--color-primary)] transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] sm:text-sm"
      >
        {t("topReceivablesViewAll")} <ArrowUpRight size={14} aria-hidden="true" />
      </Link>
    </section>
  );
}
