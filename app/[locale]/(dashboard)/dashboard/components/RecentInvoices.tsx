import { getTranslations } from "next-intl/server";
import { Clock, ShoppingBag, ArrowDownRight, ArrowUpRight, Receipt, ExternalLink } from "lucide-react";
import { InteractiveItem } from "@/components/ui/MotionWrapper";
import { formatCurrency } from "@/lib/formatters";
import { Link } from "@/i18n/routing";

interface RecentInvoice { id: string; customerName: string; invoiceNumber: string; total: number | null; paymentStatus: string | null }

export async function RecentInvoices({ recentPromise }: { recentPromise: Promise<{ success?: boolean; invoices?: RecentInvoice[] }> }) {
  const t = await getTranslations("Dashboard");
  const recentResult = await recentPromise;
  const recentInvoices = (recentResult.success && recentResult.invoices) ? recentResult.invoices : [];

  return (
    <div className="glass-card p-6 sm:p-8 h-full flex flex-col justify-between card-hover-lift">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-xl">
            <Clock size={18} />
          </div>
          <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-[var(--foreground)]">
            {t("recentInvoicesTitle")}
          </h2>
        </div>
        <Link
          href="/dashboard/invoices"
          className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1 transition-colors"
        >
          View All <ExternalLink size={13} />
        </Link>
      </div>

      {(!recentInvoices || recentInvoices.length === 0) ? (
        <div className="text-center py-12 bg-[var(--surface-elevated)] rounded-2xl border border-[var(--border)] flex-1 flex flex-col items-center justify-center">
          <div className="p-4 rounded-full bg-[var(--foreground)]/5 text-[var(--foreground)]/30 mb-3">
            <Receipt size={32} />
          </div>
          <p className="text-[var(--foreground)]/60 font-semibold text-sm">{t("recentInvoicesEmpty")}</p>
          <p className="text-xs text-[var(--foreground)]/40 mt-1">{t("recentInvoicesEmptyHint")}</p>
        </div>
      ) : (
        <div className="space-y-2.5 flex-1">
          {recentInvoices?.map((inv) => (
            <InteractiveItem key={inv.id}>
              <div className="flex items-center justify-between px-4 py-3.5 bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] transition-all duration-200 border border-[var(--border)] rounded-2xl cursor-pointer group">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-110 ${
                      inv.paymentStatus === "paid"
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-800 dark:border-zinc-200"
                        : inv.paymentStatus === "partial"
                        ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    {inv.paymentStatus === "paid" ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-[var(--foreground)] text-sm group-hover:text-[var(--color-primary)] transition-colors truncate">
                      {inv.customerName}
                    </p>
                    <p className="text-xs font-mono text-[var(--foreground)]/50 mt-0.5">{inv.invoiceNumber}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-black font-mono text-sm sm:text-base text-[var(--foreground)]">
                    {formatCurrency(inv.total)}
                  </p>
                  <span
                    className={`inline-flex mt-1 items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      inv.paymentStatus === "paid"
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-800 dark:border-zinc-200"
                        : inv.paymentStatus === "partial"
                        ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-700"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    {inv.paymentStatus === "paid_by_khata" ? "Khata Sync" : inv.paymentStatus}
                  </span>
                </div>
              </div>
            </InteractiveItem>
          ))}
        </div>
      )}
    </div>
  );
}
