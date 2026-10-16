import { getTranslations } from "next-intl/server";
import { ArrowRight, Compass, Package, Receipt, Settings2, Users } from "lucide-react";
import { Link } from "@/i18n/routing";

type GettingStartedCardProps = {
  salesPromise: Promise<{
    success?: boolean;
    summary?: { totalInvoices: number; totalCustomers: number };
  }>;
  productsPromise: Promise<{
    success?: boolean;
    total?: number;
  }>;
};

export async function GettingStartedCard({ salesPromise, productsPromise }: GettingStartedCardProps) {
  const t = await getTranslations("Dashboard");
  const [salesResult, productsResult] = await Promise.all([salesPromise, productsPromise]);
  const summary = salesResult.success === true ? salesResult.summary : undefined;
  const products = productsResult.success === true ? productsResult.total ?? 0 : undefined;

  const isNewWorkspace = summary
    && products !== undefined
    && summary.totalInvoices === 0
    && summary.totalCustomers === 0
    && products === 0;

  if (!isNewWorkspace) return null;

  const steps = [
    { href: "/dashboard/settings", icon: Settings2, label: t("gettingStartedProfile") },
    { href: "/dashboard/products?new=true", icon: Package, label: t("gettingStartedProduct") },
    { href: "/dashboard/customers?new=true", icon: Users, label: t("gettingStartedCustomer") },
    { href: "/dashboard/invoices?new=true", icon: Receipt, label: t("gettingStartedInvoice") },
  ];

  return (
    <section aria-labelledby="getting-started-title" className="relative overflow-hidden rounded-[1.5rem] border border-[var(--color-primary)]/20 bg-[var(--surface)] p-5 shadow-[var(--shadow-elevation)] sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[var(--color-primary)]/10 blur-3xl" />
      <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/8 px-3 py-1 text-xs font-bold text-[var(--color-primary)]">
            <Compass size={14} aria-hidden="true" />
            {t("gettingStartedEyebrow")}
          </div>
          <h2 id="getting-started-title" className="mt-3 text-xl font-black tracking-tight text-[var(--foreground)] sm:text-2xl">{t("gettingStartedTitle")}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--foreground)]/65">{t("gettingStartedDescription")}</p>
        </div>

        <div className="grid w-full gap-2 sm:grid-cols-2 lg:max-w-xl">
          {steps.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="group flex min-h-12 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] px-3.5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[var(--color-primary)]/35 hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            >
              <Icon size={18} className="text-[var(--color-primary)]" aria-hidden="true" />
              <span className="flex-1">{label}</span>
              <ArrowRight size={15} className="text-[var(--foreground)]/35 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
