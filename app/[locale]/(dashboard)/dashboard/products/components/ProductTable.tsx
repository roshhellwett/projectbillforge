"use client";

import { useTranslations } from "next-intl";
import { Edit2, Trash2 } from "lucide-react";
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
    return <div className="p-4"><SkeletonTable rows={5} /></div>;
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[var(--foreground)]/5 border-b border-[var(--border)]/30">
            <tr>
              <th className="px-5 py-4 text-left text-sm font-semibold text-[var(--foreground)]/70">{t("productName")}</th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-[var(--foreground)]/70">{t("sku")}</th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-[var(--foreground)]/70">{t("hsnCode")}</th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-[var(--foreground)]/70">{t("rate")}</th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-[var(--foreground)]/70">{t("gstRate")}</th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-[var(--foreground)]/70">{t("stock")}</th>
              <th className="px-5 py-4 text-left text-sm font-semibold text-[var(--foreground)]/70">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/30">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-[var(--foreground)]/[0.02] transition-colors">
                <td className="px-5 py-4 font-medium text-[var(--foreground)]">{p.name}</td>
                <td className="px-5 py-4 text-[var(--foreground)]/70 text-sm">{p.sku || "-"}</td>
                <td className="px-5 py-4 text-[var(--foreground)]/70 text-sm">{p.hsnCode || "-"}</td>
                <td className="px-5 py-4 text-[var(--foreground)] font-medium">₹{p.rate.toFixed(2)}</td>
                <td className="px-5 py-4 text-[var(--foreground)]/70 text-sm">{p.gstRate ?? 0}%</td>
                <td className="px-5 py-4 text-sm">
                  <span className={((p.lowStockThreshold ?? 0) > 0 && (p.stockQuantity ?? 0) <= (p.lowStockThreshold ?? 0)) ? "text-[var(--color-danger)] font-semibold" : "text-[var(--foreground)]"}>
                    {p.stockQuantity ?? 0} <span className="text-[var(--foreground)]/50">{p.unit ?? "piece"}</span>
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => onEdit(p)} className="p-1.5 text-[var(--foreground)]/40 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors" aria-label="Edit product">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => onDelete(p.id)} className="p-1.5 text-[var(--foreground)]/40 hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 rounded-lg transition-colors" aria-label="Delete product">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {offset < totalProducts && (
        <div className="p-4 text-center">
          <button onClick={onLoadMore} className="glass-btn-primary px-6 py-2 text-sm min-h-[44px]">
            {t("loadMoreRemaining", { remaining: totalProducts - offset })}
          </button>
        </div>
      )}
    </>
  );
}
