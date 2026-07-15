import { getTranslations } from "next-intl/server";
import { AlertTriangle, CheckCircle2, Package } from "lucide-react";
import { InteractiveItem } from "@/components/ui/MotionWrapper";
import { Link } from "@/i18n/routing";

export async function LowStockAlerts({ lowStockPromise }: { lowStockPromise: Promise<{ success?: boolean; products?: { id: string; name: string; stockQuantity: number | null; lowStockThreshold: number | null }[] }> }) {
  const t = await getTranslations("Dashboard");
  const lowStockResult = await lowStockPromise;
  const lowStock = lowStockResult.success ? (lowStockResult.products || []) : [];

  return (
    <div className="glass-card p-6 sm:p-8 card-hover-lift">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-red-500/10 text-red-500 rounded-xl">
            <AlertTriangle size={18} />
          </div>
          <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-[var(--foreground)]">
            {t("lowStockTitle")}
          </h2>
        </div>
        <Link
          href="/dashboard/products"
          className="text-xs font-bold text-[var(--color-primary)] hover:underline"
        >
          Manage Inventory
        </Link>
      </div>

      {(!lowStock || lowStock.length === 0) ? (
        <div className="text-center py-10 bg-[var(--surface-elevated)] rounded-2xl border border-[var(--border)] flex flex-col items-center justify-center">
          <div className="p-3 rounded-full bg-[var(--color-success)]/10 text-[var(--color-success)] mb-2">
            <CheckCircle2 size={28} />
          </div>
          <p className="text-[var(--color-success)] font-bold text-sm">{t("lowStockWellStocked")}</p>
          <p className="text-xs text-[var(--foreground)]/50 mt-1">All catalog items are currently above minimum threshold.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {lowStock?.map((product) => (
            <InteractiveItem key={product.id}>
              <div className="flex items-center justify-between p-4 bg-[var(--surface-elevated)] rounded-2xl border border-red-500/20 hover:bg-red-500/5 transition-all duration-200 cursor-pointer group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-red-500/10 text-red-500 shrink-0">
                    <Package size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[var(--foreground)] text-sm truncate group-hover:text-red-500 transition-colors">
                      {product.name}
                    </p>
                    <p className="text-[11px] text-[var(--foreground)]/50">
                      {t("lowStockThreshold", { threshold: product.lowStockThreshold ?? 0 })}
                    </p>
                  </div>
                </div>
                <div className="badge badge-danger shrink-0 font-mono font-bold">
                  {t("lowStockCount", { count: product.stockQuantity ?? 0 })} left
                </div>
              </div>
            </InteractiveItem>
          ))}
        </div>
      )}
    </div>
  );
}
