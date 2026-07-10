import { getTranslations } from "next-intl/server";
import { Users, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { Link } from "@/i18n/routing";

export async function TopReceivables({ customersPromise }: { customersPromise: Promise<{ success?: boolean; customers?: { id: string; name: string; currentBalance: number | null }[] }> }) {
  const t = await getTranslations("Dashboard");
  const customersResult = await customersPromise;
  const topCustomers = customersResult.success && customersResult.customers ? customersResult.customers : [];

  return (
    <div className="white-container p-5 sm:p-6 md:p-7 lg:p-8 h-full flex flex-col">
      <h2 className="text-sm sm:text-base font-bold tracking-tight text-[var(--foreground)] mb-3 sm:mb-4">{t("topReceivablesTitle")}</h2>
      {topCustomers.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center text-[var(--foreground)]/50">
          <Users size={32} className="mb-2" />
          <p className="text-sm">{t("topReceivablesEmpty")}</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3 flex-1">
          {topCustomers.map((customer) => (
            <div key={customer.id} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 transition-colors duration-200 border border-slate-100/50 dark:border-slate-700/30 rounded-xl sm:rounded-2xl">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-600/10 rounded-lg">
                  <Users size={16} style={{ color: "#2563eb" }} />
                </div>
                <span className="text-xs sm:text-sm font-medium text-[var(--foreground)]/70 truncate max-w-[120px] sm:max-w-[150px]">{customer.name}</span>
              </div>
              <span className="text-sm sm:text-base font-bold text-[var(--foreground)]">{formatCurrency(customer.currentBalance)}</span>
            </div>
          ))}
        </div>
      )}
      <Link href="/dashboard/customers" className="mt-4 sm:mt-6 text-center text-xs sm:text-sm font-medium text-[var(--color-primary)] hover:underline flex items-center justify-center gap-1">
        {t("topReceivablesViewAll")} <ArrowUpRight size={12} />
      </Link>
    </div>
  );
}
