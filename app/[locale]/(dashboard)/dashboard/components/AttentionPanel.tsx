import { getTranslations } from "next-intl/server";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  PackageSearch,
  ReceiptText,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { formatCurrency } from "@/lib/formatters";
import { DashboardDataState } from "./DashboardDataState";

interface ReceivableCustomer {
  id: string;
  name: string;
  currentBalance: number | null;
}

interface LowStockProduct {
  id: string;
  name: string;
  stockQuantity: number | null;
  lowStockThreshold: number | null;
}

interface RecentInvoice {
  id: string;
  customerName: string;
  invoiceNumber: string;
  paymentStatus: string | null;
}

type AttentionItem = {
  icon: LucideIcon;
  title: string;
  description: string;
  value?: string;
  actionLabel: string;
  href: "/dashboard/invoices" | "/dashboard/products" | "/dashboard/khata";
};

export async function AttentionPanel({
  customersPromise,
  lowStockPromise,
  recentPromise,
}: {
  customersPromise: Promise<{
    success?: boolean;
    customers?: ReceivableCustomer[];
  }>;
  lowStockPromise: Promise<{
    success?: boolean;
    products?: LowStockProduct[];
  }>;
  recentPromise: Promise<{
    success?: boolean;
    invoices?: RecentInvoice[];
  }>;
}) {
  const t = await getTranslations("Dashboard");
  const [customersResult, lowStockResult, recentResult] = await Promise.all([
    customersPromise,
    lowStockPromise,
    recentPromise,
  ]);

  const customers = customersResult.success ? customersResult.customers ?? [] : [];
  const lowStock = lowStockResult.success ? lowStockResult.products ?? [] : [];
  const recentInvoices = recentResult.success ? recentResult.invoices ?? [] : [];
  const pendingInvoice = recentInvoices.find(
    (invoice) => invoice.paymentStatus !== "paid" && invoice.paymentStatus !== "paid_by_khata",
  );

  const attentionItems: AttentionItem[] = [];

  if (customers.length > 0) {
    const topCustomer = customers[0];
    attentionItems.push({
      icon: CircleDollarSign,
      title: t("attentionReceivablesTitle"),
      description: t("attentionReceivablesBody", { customer: topCustomer.name }),
      value: formatCurrency(topCustomer.currentBalance),
      actionLabel: t("attentionReceivablesAction"),
      href: "/dashboard/khata",
    });
  }

  if (lowStock.length > 0) {
    attentionItems.push({
      icon: PackageSearch,
      title: t("attentionInventoryTitle"),
      description: t("attentionInventoryBody"),
      actionLabel: t("attentionInventoryAction"),
      href: "/dashboard/products",
    });
  }

  if (pendingInvoice) {
    attentionItems.push({
      icon: ReceiptText,
      title: t("attentionInvoiceTitle"),
      description: t("attentionInvoiceBody", {
        invoice: pendingInvoice.invoiceNumber,
        customer: pendingInvoice.customerName,
      }),
      actionLabel: t("attentionInvoiceAction"),
      href: "/dashboard/invoices",
    });
  }

  const hasDataError = !customersResult.success || !lowStockResult.success || !recentResult.success;

  return (
    <section aria-labelledby="dashboard-attention-title" className="glass-card p-5 sm:p-6 lg:p-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <AlertCircle size={18} aria-hidden="true" />
            </span>
            <h2 id="dashboard-attention-title" className="text-lg font-extrabold tracking-tight text-[var(--foreground)]">
              {t("attentionTitle")}
            </h2>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]/60">{t("attentionSubtitle")}</p>
        </div>
        {attentionItems.length > 0 && (
          <span className="self-start rounded-full border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--foreground)]/55 sm:self-auto">
            {t("attentionActionCount", { count: attentionItems.length })}
          </span>
        )}
      </div>

      {attentionItems.length === 0 && hasDataError ? (
        <div className="mt-5">
          <DashboardDataState
            title={t("dashboardDataErrorTitle")}
            description={t("dashboardDataErrorDescription")}
            retryLabel={t("dashboardDataRetry")}
            compact
          />
        </div>
      ) : attentionItems.length === 0 ? (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-4 sm:px-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--foreground)]/8 text-[var(--foreground)]">
            <CheckCircle2 size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold text-[var(--foreground)]">{t("attentionClearTitle")}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-[var(--foreground)]/60">{t("attentionClearBody")}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            {attentionItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group flex min-h-36 flex-col rounded-2xl border border-[var(--border)] border-l-4 border-l-[var(--color-primary)] bg-[var(--surface-elevated)] p-4 transition-all hover:-translate-y-0.5 hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--foreground)] shadow-sm">
                    <item.icon size={17} aria-hidden="true" />
                  </span>
                  {item.value && <span className="font-mono text-sm font-black text-[var(--foreground)]">{item.value}</span>}
                </div>
                <p className="mt-3 text-sm font-bold text-[var(--foreground)]">{item.title}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--foreground)]/60">{item.description}</p>
                <span className="mt-auto flex items-center gap-1 pt-3 text-xs font-bold text-[var(--color-primary)]">
                  {item.actionLabel}
                  <ArrowRight size={14} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
          {hasDataError && (
            <p className="mt-4 flex items-center gap-2 text-xs text-[var(--foreground)]/60" role="status">
              <AlertCircle size={14} aria-hidden="true" />
              {t("attentionPartialWarning")}
            </p>
          )}
        </>
      )}
    </section>
  );
}
