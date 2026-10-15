import { getTranslations } from "next-intl/server";
import { ArrowUpRight, Bot, FilePlus2, PackagePlus, UserPlus, WalletCards } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "@/i18n/routing";

type QuickAction = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

export async function QuickActions() {
  const t = await getTranslations("Dashboard");
  const actions: QuickAction[] = [
    {
      href: "/dashboard/invoices?new=true",
      label: t("quickNewInvoice"),
      description: t("quickNewInvoiceDescription"),
      icon: FilePlus2,
    },
    {
      href: "/dashboard/customers?new=true",
      label: t("quickAddCustomer"),
      description: t("quickAddCustomerDescription"),
      icon: UserPlus,
    },
    {
      href: "/dashboard/products?new=true",
      label: t("quickAddProduct"),
      description: t("quickAddProductDescription"),
      icon: PackagePlus,
    },
    {
      href: "/dashboard/khata",
      label: t("quickOpenKhata"),
      description: t("quickOpenKhataDescription"),
      icon: WalletCards,
    },
    {
      href: "/dashboard/assistant",
      label: t("quickAskAssistant"),
      description: t("quickAskAssistantDescription"),
      icon: Bot,
    },
  ];

  return (
    <section aria-labelledby="dashboard-quick-actions-title" className="glass-card p-5 sm:p-6 lg:p-7">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="dashboard-quick-actions-title" className="text-lg font-extrabold tracking-tight text-[var(--foreground)]">
            {t("quickActionsTitle")}
          </h2>
          <p className="mt-1 text-sm text-[var(--foreground)]/60">{t("quickActionsSubtitle")}</p>
        </div>
      </div>

      <nav aria-label={t("quickActionsTitle")} className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex min-h-28 flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 transition-all last:col-span-2 hover:-translate-y-0.5 hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] lg:last:col-span-1"
          >
            <span className="flex items-center justify-between gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--foreground)] shadow-sm">
                <action.icon size={17} aria-hidden="true" />
              </span>
              <ArrowUpRight size={16} aria-hidden="true" className="text-[var(--foreground)]/45 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
            <span className="mt-3 text-sm font-bold text-[var(--foreground)]">{action.label}</span>
            <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--foreground)]/55">{action.description}</span>
          </Link>
        ))}
      </nav>
    </section>
  );
}
