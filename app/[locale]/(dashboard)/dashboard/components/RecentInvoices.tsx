import { getTranslations } from "next-intl/server";
import { ArrowDownRight, ArrowUpRight, Clock, ExternalLink, Receipt, ReceiptText } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { Link } from "@/i18n/routing";
import { DashboardDataState } from "./DashboardDataState";

interface RecentInvoice {
  id: string;
  customerName: string;
  invoiceNumber: string;
  total: number | null;
  paymentStatus: string | null;
}

export async function RecentInvoices({
  recentPromise,
}: {
  recentPromise: Promise<{ success?: boolean; invoices?: RecentInvoice[] }>;
}) {
  const t = await getTranslations("Dashboard");
  const recentResult = await recentPromise;

  return (
    <section aria-labelledby="dashboard-recent-invoices-title" className="glass-card flex h-full flex-col p-5 sm:p-6 md:p-7 lg:p-8">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-[var(--color-primary)]/10 p-2.5 text-[var(--color-primary)]">
            <Clock size={18} aria-hidden="true" />
          </div>
          <h2 id="dashboard-recent-invoices-title" className="text-base font-extrabold tracking-tight text-[var(--foreground)] sm:text-lg">
            {t("recentInvoicesTitle")}
          </h2>
        </div>
        <Link
          href="/dashboard/invoices"
          className="flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-bold text-[var(--color-primary)] transition-colors hover:bg-[var(--surface-elevated)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        >
          {t("recentInvoicesViewAll")} <ExternalLink size={13} aria-hidden="true" />
        </Link>
      </div>

      {!recentResult.success ? (
        <DashboardDataState
          title={t("dashboardDataErrorTitle")}
          description={t("dashboardDataErrorDescription")}
          retryLabel={t("dashboardDataRetry")}
        />
      ) : recentResult.invoices?.length ? (
        <div className="flex-1 space-y-2.5">
          {recentResult.invoices.map((invoice) => {
            const isPaid = invoice.paymentStatus === "paid" || invoice.paymentStatus === "paid_by_khata";
            const isPartial = invoice.paymentStatus === "partial";
            const statusLabel = isPaid
              ? invoice.paymentStatus === "paid_by_khata"
                ? t("invoiceStatusKhata")
                : t("invoiceStatusPaid")
              : isPartial
                ? t("invoiceStatusPartial")
                : t("invoiceStatusNeedsReview");

            return (
              <Link
                key={invoice.id}
                href="/dashboard/invoices"
                aria-label={`${invoice.invoiceNumber}, ${invoice.customerName}, ${formatCurrency(invoice.total)}`}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3.5 py-3.5 transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] sm:px-4"
              >
                <span className="flex min-w-0 flex-1 items-center gap-3.5">
                  <span className={`shrink-0 rounded-xl p-2.5 transition-transform group-hover:scale-105 ${isPaid ? "border border-zinc-800 bg-zinc-900 text-white dark:border-zinc-200 dark:bg-zinc-100 dark:text-zinc-900" : isPartial ? "border border-zinc-300 bg-zinc-200 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" : "border border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"}`}>
                    {isPaid ? <ArrowDownRight size={18} aria-hidden="true" /> : <ArrowUpRight size={18} aria-hidden="true" />}
                  </span>
                  <span className="min-w-0 pr-2">
                    <span className="block truncate text-sm font-bold text-[var(--foreground)] transition-colors group-hover:text-[var(--color-primary)]">
                      {invoice.customerName}
                    </span>
                    <span className="mt-0.5 block text-xs font-mono text-[var(--foreground)]/50">{invoice.invoiceNumber}</span>
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-mono text-sm font-black text-[var(--foreground)] sm:text-base">{formatCurrency(invoice.total)}</span>
                  <span className={`mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${isPaid ? "border-zinc-800 bg-zinc-900 text-white dark:border-zinc-200 dark:bg-zinc-100 dark:text-zinc-900" : isPartial ? "border-zinc-300 bg-zinc-200 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" : "border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"}`}>
                    {statusLabel}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] px-5 py-10 text-center">
          <div className="rounded-full bg-[var(--foreground)]/5 p-4 text-[var(--foreground)]/30">
            <Receipt size={32} aria-hidden="true" />
          </div>
          <p className="mt-3 text-sm font-semibold text-[var(--foreground)]/60">{t("recentInvoicesEmpty")}</p>
          <p className="mt-1 text-xs text-[var(--foreground)]/40">{t("recentInvoicesEmptyHint")}</p>
          <Link
            href="/dashboard/invoices?new=true"
            className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-bold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <ReceiptText size={14} aria-hidden="true" /> {t("recentInvoicesCreate")}
          </Link>
        </div>
      )}
    </section>
  );
}
