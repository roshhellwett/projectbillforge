import { getTranslations } from "next-intl/server";
import { Clock, ShoppingBag, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { InteractiveItem } from "@/components/ui/MotionWrapper";
import { formatCurrency } from "@/lib/formatters";

interface RecentInvoice { id: string; customerName: string; invoiceNumber: string; total: number | null; paymentStatus: string | null }

export async function RecentInvoices({ recentPromise }: { recentPromise: Promise<{ success?: boolean; invoices?: RecentInvoice[] }> }) {
  const t = await getTranslations("Dashboard");
  const recentResult = await recentPromise;
  const recentInvoices = (recentResult.success && recentResult.invoices) ? recentResult.invoices : [];

  return (
    <div className="white-container p-5 sm:p-6 md:p-7 lg:p-8 h-full flex flex-col">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
        <div className="p-2 bg-blue-600/10 rounded-xl">
          <Clock style={{ color: "#2563eb" }} size={16} />
        </div>
        <h2 className="text-sm sm:text-base font-bold tracking-tight text-[var(--foreground)]">{t("recentInvoicesTitle")}</h2>
      </div>
      {(!recentInvoices || recentInvoices.length === 0) ? (
        <div className="text-center py-8 sm:py-10 md:py-12 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700/30">
          <ShoppingBag className="mx-auto mb-2 sm:mb-3 text-[var(--foreground)]/20" size={32} />
          <p className="text-[var(--foreground)]/40 font-medium text-sm">{t("recentInvoicesEmpty")}</p>
          <p className="text-xs text-[var(--foreground)]/30 mt-1">{t("recentInvoicesEmptyHint")}</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-2.5">
          {recentInvoices?.map((inv) => (
            <InteractiveItem key={inv.id}>
              <div className="flex items-center justify-between px-3 py-3 sm:px-4 sm:py-4 bg-white dark:bg-[var(--surface)] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 border-b border-slate-100/60 dark:border-slate-800/60 hover:shadow-sm cursor-pointer group">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className={`p-2 lg:p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${inv.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : inv.paymentStatus === "partial" ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"}`}>
                    {inv.paymentStatus === "paid" ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-[var(--foreground)] text-sm group-hover:text-[var(--color-primary)] transition-colors truncate">{inv.customerName}</p>
                    <p className="text-[10px] sm:text-xs text-[var(--foreground)]/40 mt-0.5">{inv.invoiceNumber}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-sm text-[var(--foreground)]">{formatCurrency(inv.total)}</p>
                  <span className={`inline-flex mt-1 items-center px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${inv.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : inv.paymentStatus === "partial" ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"}`}>{inv.paymentStatus}</span>
                </div>
              </div>
            </InteractiveItem>
          ))}
        </div>
      )}
    </div>
  );
}
