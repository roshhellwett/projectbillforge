"use client";

import { useTranslations } from "next-intl";
import { Edit2, Trash2, Package, AlertTriangle, CheckCircle2 } from "lucide-react";
import { SkeletonTable } from "@/components/ui/ui";
import type { Product } from "../hooks/useProducts";

interface Props {
  products: Product[];
  loading: boolean;
  offset: number;
  totalProducts: number;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
  onLoadMore: () => void;
}

export function ProductTable({ products, loading, offset, totalProducts, onEdit, onDelete, onLoadMore }: Props) {
  const t = useTranslations("Products");

  if (loading) {
    return <div className="p-6"><SkeletonTable rows={5} /></div>;
  }

  if (products.length === 0) {
    return (
      <div className="p-16 text-center text-[var(--foreground)]/50 font-semibold text-sm flex flex-col items-center justify-center">
        <Package size={32} className="opacity-30 mb-2" />
        <span>No products currently in catalog. Add your first item above!</span>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-[700px] border-collapse">
          <thead className="bg-[var(--surface-elevated)] border-b border-[var(--border)]">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
                {t("productName")}
              </th>
              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
                {t("sku")}
              </th>
              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
                {t("hsnCode")}
              </th>
              <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
                {t("rate")}
              </th>
              <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
                {t("gstRate")}
              </th>
              <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
                {t("stock")}
              </th>
              <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
            {products.map(p => {
              const isLowStock = (p.lowStockThreshold ?? 0) > 0 && (p.stockQuantity ?? 0) <= (p.lowStockThreshold ?? 0);
              return (
                <tr key={p.id} className="hover:bg-[var(--surface-hover)] transition-colors duration-150 group">
                  <td className="px-5 py-4 font-bold text-[var(--foreground)] text-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] shrink-0">
                        <Package size={16} />
                      </div>
                      <span className="truncate max-w-[200px] group-hover:text-[var(--color-primary)] transition-colors">
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[var(--foreground)]/70 font-mono text-xs font-semibold">
                    {p.sku ? (
                      <span className="px-2 py-1 rounded bg-[var(--surface-elevated)] border border-[var(--border)]">
                        {p.sku}
                      </span>
                    ) : (
                      <span className="text-[var(--foreground)]/30">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-[var(--foreground)]/70 font-mono text-xs font-semibold">
                    {p.hsnCode ? (
                      <span className="px-2 py-1 rounded bg-[var(--surface-elevated)] border border-[var(--border)]">
                        {p.hsnCode}
                      </span>
                    ) : (
                      <span className="text-[var(--foreground)]/30">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right font-black font-mono text-base text-[var(--foreground)]">
                    ₹{p.rate.toFixed(2)}
                  </td>
                  <td className="px-5 py-4 text-right font-mono font-bold text-xs text-[var(--foreground)]/80">
                    <span className="badge badge-success">{p.gstRate ?? 0}% GST</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-mono font-bold">
                    {isLowStock ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 text-red-500 border border-red-500/20 text-xs">
                        <AlertTriangle size={13} /> {p.stockQuantity ?? 0} {p.unit ?? "pcs"} (Low)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs">
                        <CheckCircle2 size={13} /> {p.stockQuantity ?? 0} {p.unit ?? "pcs"}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEdit(p)}
                        className="p-2 text-[var(--foreground)]/60 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-xl transition-all shadow-sm active:scale-95 border border-transparent hover:border-[var(--color-primary)]/20 flex items-center justify-center"
                        aria-label="Edit product"
                        title="Edit product"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(p.id)}
                        className="p-2 text-[var(--foreground)]/60 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all shadow-sm active:scale-95 border border-transparent hover:border-red-500/20 flex items-center justify-center"
                        aria-label="Delete product"
                        title="Delete product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {offset < totalProducts && (
        <div className="p-6 text-center border-t border-[var(--border)] bg-[var(--surface-elevated)]">
          <button
            onClick={onLoadMore}
            className="glass-btn-primary px-8 py-3 text-sm font-bold shadow-md transition-all active:scale-95"
          >
            {t("loadMoreRemaining", { remaining: totalProducts - offset })}
          </button>
        </div>
      )}
    </>
  );
}
