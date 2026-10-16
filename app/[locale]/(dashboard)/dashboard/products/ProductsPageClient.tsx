"use client";

import { useProducts, type Product, type IndustryType } from "./hooks/useProducts";
import { ProductHeader } from "./components/ProductHeader";
import { ProductSearchBar } from "./components/ProductSearchBar";
import { ProductTable } from "./components/ProductTable";
import { ProductModal } from "./components/ProductModal";
import { EmptyState } from "./components/EmptyState";
import { ConfirmDialog } from "@/components/ui/ui";
import { StaggerContainer, StaggerItem } from "@/components/ui/MotionWrapper";
import { useTranslations } from "next-intl";

export default function ProductsPageClient({
  initialData,
  initialError,
}: {
  initialData?: { products: Product[]; totalProducts: number; totalLowStock: number; industryType: IndustryType };
  initialError?: string;
}) {
  const t = useTranslations("Products");
  const {
    products, filteredProducts, totalLowStock, loading, refreshing, search, showModal, editingProduct,
    industryType, formData, metadata, saving, formError, deleteId, deleting, deleteError,
    offset, totalProducts, loadError, loadMoreError, loadingMore, successMessage,
    setSearch, setShowModal, setFormData, setFormError, setMetadata, setDeleteId, setDeleteError,
    openModal, handleEdit, handleSubmit, handleDelete, loadMoreProducts, loadData,
  } = useProducts(initialData, initialError);

  const hasSearch = search.trim().length > 0;

  return (
    <StaggerContainer className="space-y-4 sm:space-y-6">
      <ProductHeader
        onAdd={openModal}
        totalProducts={totalProducts}
        showingProducts={filteredProducts.length}
        lowStockProducts={totalLowStock}
      />

      {(refreshing || successMessage) && (
        <div className="flex flex-wrap items-center gap-2 px-1 text-sm" role="status" aria-live="polite">
          {refreshing && <span className="text-[var(--foreground)]/60">{t("refreshingProducts")}</span>}
          {successMessage && <span className="font-semibold text-[var(--color-success)]">{successMessage}</span>}
        </div>
      )}

      <StaggerItem className="glass-card overflow-hidden">
        <ProductSearchBar
          value={search}
          onChange={setSearch}
          resultCount={filteredProducts.length}
        />

        {loadError && (
          <div className="m-4 sm:m-6 p-4 rounded-xl border border-[var(--color-danger)]/25 bg-[var(--color-danger)]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3" role="alert">
            <div>
              <p className="font-semibold text-sm text-[var(--foreground)]">{t("loadErrorTitle")}</p>
              <p className="text-sm text-[var(--foreground)]/65 mt-1">{loadError}</p>
            </div>
            <button
              type="button"
              onClick={() => void loadData()}
              disabled={loading || refreshing}
              className="glass-btn-secondary min-h-[44px] shrink-0 disabled:opacity-50"
            >
              {loading || refreshing ? t("refreshingProducts") : t("retryLabel")}
            </button>
          </div>
        )}

        {loading ? (
          <ProductTable
            products={[]}
            loading
            offset={offset}
            totalProducts={totalProducts}
            loadingMore={loadingMore}
            loadMoreError={loadMoreError}
            onEdit={handleEdit}
            onDelete={(id) => { setDeleteError(null); setDeleteId(id); }}
            onLoadMore={loadMoreProducts}
          />
        ) : loadError && products.length === 0 ? (
          null
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            visible
            filtered={hasSearch}
            onClear={() => setSearch("")}
            onCreate={openModal}
            hasMore={offset < totalProducts}
            loadingMore={loadingMore}
            loadMoreError={loadMoreError}
            remaining={totalProducts - offset}
            loaded={offset}
            total={totalProducts}
            onLoadMore={loadMoreProducts}
          />
        ) : (
          <ProductTable
            products={filteredProducts}
            loading={false}
            offset={offset}
            totalProducts={totalProducts}
            loadingMore={loadingMore}
            loadMoreError={loadMoreError}
            onEdit={handleEdit}
            onDelete={(id) => { setDeleteError(null); setDeleteId(id); }}
            onLoadMore={loadMoreProducts}
          />
        )}
      </StaggerItem>

      <ProductModal
        open={showModal}
        saving={saving}
        editingProduct={editingProduct}
        industryType={industryType}
        formData={formData}
        metadata={metadata}
        error={formError}
        onClose={() => { setShowModal(false); setFormError(null); }}
        onSubmit={handleSubmit}
        onFormChange={data => { setFormData(prev => ({ ...prev, ...data })); setFormError(null); }}
        onMetadataChange={data => { setMetadata(data); setFormError(null); }}
      />

      <ConfirmDialog
        open={!!deleteId}
        title={t("deleteTitle")}
        message={deleteError || t("deleteMessage")}
        confirmLabel={t("deleteConfirm")}
        cancelLabel={t("cancel")}
        onConfirm={handleDelete}
        onCancel={() => { setDeleteId(null); setDeleteError(null); }}
        loading={deleting}
        loadingLabel={t("processing")}
      />
    </StaggerContainer>
  );
}
