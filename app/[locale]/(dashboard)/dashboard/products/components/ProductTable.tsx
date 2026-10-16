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
  loadingMore: boolean;
  loadMoreError: string | null;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onLoadMore: () => void;
}

export function ProductTable({
  products,
  loading,
  offset,
  totalProducts,
  loadingMore,
  loadMoreError,
  onEdit,
  onDelete,
  onLoadMore,
}: Props) {
  const t = useTranslations("Products");

  if (loading) {
    return <div className="p-4 sm:p-6" aria-busy="true" aria-label={t("loadingProducts")}><SkeletonTable rows={6} /></div>;
  }

  if (products.length === 0) return null;

  return (
    <>
      <div className="hidden sm:block overflow-x-auto w-full">
        <table className="w-full min-w-[760px] border-collapse">
          <caption className="sr-only">{t("tableCaption")}</caption>
          <thead className="bg-[var(--surface-elevated)] border-b border-[var(--border)]">
            <tr>
              <th scope="col" className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">{t("productName")}</th>
              <th scope="col" className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">{t("sku")}</th>
              <th scope="col" className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">{t("hsnCode")}</th>
              <th scope="col" className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">{t("rate")}</th>
              <th scope="col" className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">{t("gstRate")}</th>
              <th scope="col" className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">{t("stock")}</th>
              <th scope="col" className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
            {products.map(product => (
              <ProductRow key={product.id} product={product} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden divide-y divide-[var(--border)] bg-[var(--surface)]">
        {products.map(product => (
          <ProductCard key={product.id} product={product} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>

      <div className="p-4 sm:p-6 border-t border-[var(--border)] bg-[var(--surface-elevated)]/50 flex flex-col items-center gap-3">
        {loadMoreError && <p className="text-sm text-[var(--foreground)]/70" role="alert">{loadMoreError}</p>}
        {offset < totalProducts && (
          <button
            type="button"
            onClick={onLoadMore}
            disabled={loadingMore}
            className="glass-btn-primary min-h-[44px] px-8 py-3 text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            aria-busy={loadingMore}
          >
            {loadingMore ? t("loadingMore") : loadMoreError ? t("retryLoadMore") : t("loadMoreRemaining", { remaining: totalProducts - offset })}
          </button>
        )}
        <p className="text-xs text-[var(--foreground)]/50" aria-live="polite">
          {t("paginationFeedback", { loaded: Math.min(offset, totalProducts), total: totalProducts })}
        </p>
      </div>
    </>
  );
}

function ProductRow({ product, onEdit, onDelete }: { product: Product; onEdit: (product: Product) => void; onDelete: (id: string) => void }) {
  const isLowStock = (product.lowStockThreshold ?? 0) > 0 && (product.stockQuantity ?? 0) <= (product.lowStockThreshold ?? 0);

  return (
    <tr className="hover:bg-[var(--surface-hover)] transition-colors duration-150 group">
      <td className="px-5 py-4 font-bold text-[var(--foreground)] text-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] shrink-0" aria-hidden="true"><Package size={16} /></div>
          <span className="truncate max-w-[200px] group-hover:text-[var(--color-primary)] transition-colors">{product.name}</span>
        </div>
      </td>
      <td className="px-5 py-4 text-[var(--foreground)]/70 font-mono text-xs font-semibold"><CodeValue value={product.sku} /></td>
      <td className="px-5 py-4 text-[var(--foreground)]/70 font-mono text-xs font-semibold"><CodeValue value={product.hsnCode} /></td>
      <td className="px-5 py-4 text-right font-black font-mono text-base text-[var(--foreground)]">₹{product.rate.toFixed(2)}</td>
      <td className="px-5 py-4 text-right font-mono font-bold text-xs text-[var(--foreground)]/80"><span className="badge badge-success">{product.gstRate ?? 0}% GST</span></td>
      <td className="px-5 py-4 text-sm font-mono font-bold"><StockBadge product={product} isLowStock={isLowStock} /></td>
      <td className="px-5 py-4 text-right">
        <ActionButtons product={product} onEdit={onEdit} onDelete={onDelete} />
      </td>
    </tr>
  );
}

function ProductCard({ product, onEdit, onDelete }: { product: Product; onEdit: (product: Product) => void; onDelete: (id: string) => void }) {
  const t = useTranslations("Products");
  const isLowStock = (product.lowStockThreshold ?? 0) > 0 && (product.stockQuantity ?? 0) <= (product.lowStockThreshold ?? 0);

  return (
    <article className="p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] shrink-0" aria-hidden="true"><Package size={18} /></div>
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">{product.name}</p>
            <p className="mt-1 text-xs text-[var(--foreground)]/55 font-mono truncate">
              {product.sku ? `${t("sku")}: ${product.sku}` : t("skuNotProvided")}
            </p>
          </div>
        </div>
        <p className="font-mono font-black text-base shrink-0">₹{product.rate.toFixed(2)}</p>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] p-3">
          <dt className="text-[var(--foreground)]/50 uppercase tracking-wider font-bold">{t("hsnCode")}</dt>
          <dd className="mt-1 font-mono font-semibold"><CodeValue value={product.hsnCode} /></dd>
        </div>
        <div className="rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] p-3">
          <dt className="text-[var(--foreground)]/50 uppercase tracking-wider font-bold">{t("gstRate")}</dt>
          <dd className="mt-1 font-semibold">{product.gstRate ?? 0}%</dd>
        </div>
        <div className="col-span-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] p-3 flex items-center justify-between gap-2">
          <dt className="text-[var(--foreground)]/50 uppercase tracking-wider font-bold">{t("stock")}</dt>
          <dd><StockBadge product={product} isLowStock={isLowStock} /></dd>
        </div>
      </dl>
      <ActionButtons product={product} onEdit={onEdit} onDelete={onDelete} mobile />
    </article>
  );
}

function CodeValue({ value }: { value: string | null }) {
  return value ? (
    <span className="px-2 py-1 rounded bg-[var(--surface-elevated)] border border-[var(--border)]">{value}</span>
  ) : (
    <span className="text-[var(--foreground)]/30">—</span>
  );
}

function StockBadge({ product, isLowStock }: { product: Product; isLowStock: boolean }) {
  const t = useTranslations("Products");
  return isLowStock ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-800 dark:border-zinc-200 text-xs font-bold">
      <AlertTriangle size={13} aria-hidden="true" /> {product.stockQuantity ?? 0} {product.unit ?? t("unitDefault")} ({t("lowStockLabel")})
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-[var(--foreground)] border border-zinc-300 dark:border-zinc-700 text-xs font-semibold">
      <CheckCircle2 size={13} aria-hidden="true" /> {product.stockQuantity ?? 0} {product.unit ?? t("unitDefault")}
    </span>
  );
}

function ActionButtons({
  product,
  onEdit,
  onDelete,
  mobile = false,
}: {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  mobile?: boolean;
}) {
  const t = useTranslations("Products");
  const buttonClass = mobile
    ? "min-h-[44px] flex-1 px-3 py-2 text-xs font-semibold rounded-xl border border-[var(--border)] flex items-center justify-center gap-1.5 transition-colors"
    : "min-h-[44px] min-w-[44px] p-2 text-[var(--foreground)]/60 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-xl transition-all shadow-sm active:scale-95 border border-transparent hover:border-[var(--color-primary)]/20 flex items-center justify-center";

  return (
    <div className={mobile ? "flex items-center gap-2" : "flex items-center justify-end gap-1.5"}>
      <button
        type="button"
        onClick={() => onEdit(product)}
        className={`${buttonClass} text-[var(--foreground)]/70 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10`}
        aria-label={t("editProductBtn")}
        title={t("editProductBtn")}
      >
        <Edit2 size={17} aria-hidden="true" />
        {mobile && <span>{t("editShort")}</span>}
      </button>
      <button
        type="button"
        onClick={() => onDelete(product.id)}
        className={`${buttonClass} text-[var(--foreground)]/70 hover:text-[var(--foreground)] hover:bg-zinc-200 dark:hover:bg-zinc-800`}
        aria-label={t("deleteProductBtn")}
        title={t("deleteProductBtn")}
      >
        <Trash2 size={17} aria-hidden="true" />
        {mobile && <span>{t("deleteShort")}</span>}
      </button>
    </div>
  );
}
