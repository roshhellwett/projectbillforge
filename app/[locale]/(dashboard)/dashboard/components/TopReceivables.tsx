import { getTranslations } from "next-intl/server";
import { Users, ArrowUpRight, BookOpen } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { Link } from "@/i18n/routing";

export async function TopReceivables({ customersPromise }: { customersPromise: Promise<{ success?: boolean; customers?: { id: string; name: string; currentBalance: number | null }[] }> }) {
  const t = await getTranslations("Dashboard");
  const customersResult = await customersPromise;
  const topCustomers = customersResult.success && customersResult.customers ? customersResult.customers : [];

  return (
    <div className="glass-card p-6 sm:p-8 h-full flex flex-col justify-between card-hover-lift">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
            <BookOpen size={18} />
          </div>
          <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-[var(--foreground)]">
            {t("topReceivablesTitle")}
          </h2>
        </div>
        <span className="badge badge-warning text-[10px]">Udhaar Alert</span>
      </div>

      {topCustomers.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-12 text-center text-[var(--foreground)]/50 bg-[var(--surface-elevated)] rounded-2xl border border-[var(--border)]">
          <Users size={32} className="mb-2 opacity-40" />
          <p className="text-sm font-semibold">{t("topReceivablesEmpty")}</p>
        </div>
      ) : (
        <div className="space-y-2.5 flex-1">
          {topCustomers.map((customer) => (
            <div
              key={customer.id}
              className="flex items-center justify-between p-3.5 sm:p-4 bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] transition-all duration-200 border border-[var(--border)] rounded-2xl group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/15 to-purple-500/15 text-blue-500 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-500/20">
                  {customer.name ? customer.name.substring(0, 2).toUpperCase() : "CU"}
                </div>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-[var(--foreground)] truncate block group-hover:text-[var(--color-primary)] transition-colors">
                    {customer.name}
                  </span>
                  <span className="text-[10px] text-[var(--foreground)]/50">Khata Customer</span>
                </div>
              </div>
              <span className="text-sm sm:text-base font-black font-mono text-[var(--color-danger)]">
                {formatCurrency(customer.currentBalance)}
              </span>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/dashboard/khata"
        className="mt-5 pt-4 border-t border-[var(--border)] text-center text-xs sm:text-sm font-bold text-[var(--color-primary)] hover:underline flex items-center justify-center gap-1 transition-colors"
      >
        {t("topReceivablesViewAll")} <ArrowUpRight size={14} />
      </Link>
    </div>
  );
}
