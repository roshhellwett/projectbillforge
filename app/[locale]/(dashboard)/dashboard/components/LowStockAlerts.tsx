import { getTranslations } from "next-intl/server";
import { AlertTriangle } from "lucide-react";
import { InteractiveItem } from "@/components/ui/MotionWrapper";

export async function LowStockAlerts({ lowStockPromise }: { lowStockPromise: Promise<{ success?: boolean; products?: { id: string; name: string; stockQuantity: number | null; lowStockThreshold: number | null }[] }> }) {
  const t = await getTranslations("Dashboard");
  const lowStockResult = await lowStockPromise;
  const lowStock = lowStockResult.success ? (lowStockResult.products || []) : [];

  return (
    <div className="glass-card p-4 sm:p-5 md:p-7">
      <h2 className="text-base font-bold tracking-tight text-[var(--foreground)] mb-4 flex items-center gap-2.5">
        <div className="p-2 bg-red-500/10 rounded-xl">
          <AlertTriangle style={{ color: "#ef4444" }} size={17} />
        </div>
        {t("lowStockTitle")}
      </h2>
      {(!lowStock || lowStock.length === 0) ? (
        <div className="text-center py-8 glass-light rounded-xl">
          <p className="text-[var(--color-success)] font-medium text-sm">{t("lowStockWellStocked")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {lowStock?.map((product) => (
            <InteractiveItem key={product.id}>
              <div className="flex items-center justify-between p-3.5 glass-light rounded-xl border border-red-500/10 hover:bg-red-500/5 transition-colors cursor-pointer">
                <div>
                  <p className="font-semibold text-[var(--foreground)] text-sm">{product.name}</p>
                  <p className="text-xs text-[var(--foreground)]/35">{t("lowStockThreshold", { threshold: product.lowStockThreshold ?? 0 })}</p>
                </div>
                  <div className="badge badge-danger">{t("lowStockCount", { count: product.stockQuantity ?? 0 })}</div>
              </div>
            </InteractiveItem>
          ))}
        </div>
      )}
    </div>
  );
}
