import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import {
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  IndianRupee,
  ReceiptText,
  RefreshCw,
  Users,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

type ReportsSummary = {
  todaySales: number;
  totalSales: number;
  totalInvoices: number;
  totalCustomers: number;
  totalReceivable: number;
};

type SalesDay = {
  date: string;
  label: string;
  total: number;
};

type ReportsPageProps = {
  summary: ReportsSummary | null;
  days: SalesDay[];
  hasError: boolean;
};

export default async function ReportsPage({ summary, days, hasError }: ReportsPageProps) {
  const t = await getTranslations("Reports");
  const weeklyTotal = days.reduce((total, day) => total + Number(day.total || 0), 0);
  const chartMax = Math.max(...days.map((day) => Number(day.total || 0)), 1);
  const hasSales = days.some((day) => Number(day.total || 0) > 0);

  const metrics = summary
    ? [
        {
          label: t("todaySales"),
          value: formatCurrency(summary.todaySales),
          icon: IndianRupee,
          tone: "text-emerald-700 dark:text-emerald-300 bg-emerald-500/10",
        },
        {
          label: t("allTimeSales"),
          value: formatCurrency(summary.totalSales),
          icon: BarChart3,
          tone: "text-blue-700 dark:text-blue-300 bg-blue-500/10",
        },
        {
          label: t("activeInvoices"),
          value: summary.totalInvoices.toLocaleString("en-IN"),
          icon: ReceiptText,
          tone: "text-violet-700 dark:text-violet-300 bg-violet-500/10",
        },
        {
          label: t("receivables"),
          value: formatCurrency(summary.totalReceivable),
          icon: Users,
          tone: "text-amber-700 dark:text-amber-300 bg-amber-500/10",
        },
      ]
    : [];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-2 sm:space-y-8">
      <header className="flex flex-col gap-5 rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-elevation)] sm:p-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--info-border)] bg-[var(--info-surface)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--info-foreground)]">
            <BarChart3 size={13} aria-hidden="true" /> {t("eyebrow")}
          </div>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)] sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
            {t("subtitle")}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs font-medium text-[var(--muted-foreground)] lg:self-auto">
          <CalendarDays size={15} aria-hidden="true" /> {t("window")}
        </div>
      </header>

      {hasError ? (
        <section className="flex flex-col gap-4 rounded-2xl border border-[var(--danger-border)] bg-[var(--danger-surface)] p-5 sm:flex-row sm:items-center sm:justify-between" role="alert">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-[var(--danger-foreground)]" aria-hidden="true" />
            <div>
              <h2 className="font-semibold text-[var(--foreground)]">{t("errorTitle")}</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t("errorDescription")}</p>
            </div>
          </div>
          <Link href="/dashboard/reports" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--surface-hover)]">
            <RefreshCw size={15} aria-hidden="true" /> {t("retry")}
          </Link>
        </section>
      ) : null}

      {summary ? (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label={t("summaryLabel")}>
          {metrics.map(({ label, value, icon: Icon, tone }) => (
            <article key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold text-[var(--muted-foreground)]">{label}</p>
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}><Icon size={17} aria-hidden="true" /></span>
              </div>
              <p className="mt-5 font-mono text-2xl font-bold tracking-tight text-[var(--foreground)]">{value}</p>
            </article>
          ))}
        </section>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <article className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-elevation)] sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">{t("trendTitle")}</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{t("trendSubtitle")}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">{t("periodTotal")}</p>
              <p className="mt-1 font-mono text-xl font-bold text-[var(--foreground)]">{formatCurrency(weeklyTotal)}</p>
            </div>
          </div>

          {hasSales ? (
            <div className="mt-8" role="img" aria-label={t("chartLabel", { total: formatCurrency(weeklyTotal) })}>
              <div className="flex h-56 items-end gap-2 border-b border-[var(--border)] px-1 sm:gap-4">
                {days.map((day) => {
                  const amount = Number(day.total || 0);
                  const height = amount > 0 ? Math.max(8, (amount / chartMax) * 100) : 3;
                  return (
                    <div key={day.date} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
                      <span className="max-w-full truncate text-[10px] font-medium text-[var(--muted-foreground)]" title={formatCurrency(amount)}>
                        {amount > 0 ? formatCurrency(amount) : "—"}
                      </span>
                      <div className="flex h-40 w-full items-end rounded-t-lg bg-[var(--surface-subtle)] px-1">
                        <div className="w-full rounded-t-md bg-gradient-to-t from-[var(--primary)] to-[var(--color-primary-light)] transition-[height] duration-500" style={{ height: `${height}%` }} />
                      </div>
                      <span className="max-w-full truncate text-[10px] font-semibold text-[var(--muted-foreground)]">{day.label}</span>
                    </div>
                  );
                })}
              </div>
              <ul className="sr-only">
                {days.map((day) => <li key={day.date}>{day.label}: {formatCurrency(Number(day.total || 0))}</li>)}
              </ul>
            </div>
          ) : (
            <div className="mt-8 flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-subtle)] px-6 text-center">
              <BarChart3 size={24} className="text-[var(--muted-foreground)]" aria-hidden="true" />
              <h3 className="mt-3 font-semibold text-[var(--foreground)]">{t("emptyTitle")}</h3>
              <p className="mt-1 max-w-sm text-sm text-[var(--muted-foreground)]">{t("emptyDescription")}</p>
              <Link href="/dashboard/invoices?new=true" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-contrast)] hover:brightness-110">
                {t("createInvoice")} <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </div>
          )}
        </article>

        <aside className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface-elevated)] p-5 sm:p-7">
          <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
            <ReceiptText size={17} aria-hidden="true" />
            <h2 className="text-xs font-bold uppercase tracking-[0.14em]">{t("howToReadTitle")}</h2>
          </div>
          <div className="mt-5 space-y-4 text-sm leading-6 text-[var(--muted-foreground)]">
            <p>{t("howToReadOne")}</p>
            <p>{t("howToReadTwo")}</p>
            <p>{t("howToReadThree")}</p>
          </div>
          <Link href="/dashboard/invoices" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline">
            {t("viewInvoices")} <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </aside>
      </section>
    </div>
  );
}
