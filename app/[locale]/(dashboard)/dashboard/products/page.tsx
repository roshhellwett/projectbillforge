"use client";

import { useProducts } from "./hooks/useProducts";
import { ProductHeader } from "./components/ProductHeader";
import { ProductSearchBar } from "./components/ProductSearchBar";
import { ProductTable } from "./components/ProductTable";
import { ProductModal } from "./components/ProductModal";
import { EmptyState } from "./components/EmptyState";
import { ConfirmDialog } from "@/components/ui/ui";
import { StaggerContainer, StaggerItem, FadeIn } from "@/components/ui/MotionWrapper";
import { useTranslations } from "next-intl";

export default function ProductsPage() {
  const t = useTranslations("Products");
  const {
    filteredProducts, loading, search, showModal, editingProduct,
    industryType, formData, metadata, saving, deleteId, deleting,
    offset, totalProducts,
    setSearch, setShowModal, setFormData, setMetadata, setDeleteId,
    openModal, handleEdit, handleSubmit, handleDelete, loadMoreProducts,
  } = useProducts();

  return (
    <StaggerContainer className="space-y-6">
      <ProductHeader onAdd={openModal} />

      <StaggerItem className="glass-card overflow-hidden">
        <ProductSearchBar value={search} onChange={setSearch} />
        <ProductTable
          products={filteredProducts}
          loading={loading}
          offset={offset}
          totalProducts={totalProducts}
          onEdit={handleEdit}
          onDelete={setDeleteId}
          onLoadMore={loadMoreProducts}
        />
        <EmptyState visible={!loading && filteredProducts.length === 0} />
      </StaggerItem>

      <ProductModal
        open={showModal}
        saving={saving}
        editingProduct={editingProduct}
        industryType={industryType}
        formData={formData}
        metadata={metadata}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        onFormChange={data => setFormData(prev => ({ ...prev, ...data }))}
        onMetadataChange={setMetadata}
      />

      <ConfirmDialog
        open={!!deleteId}
        title={t("deleteTitle")}
        message={t("deleteMessage")}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </StaggerContainer>
  );
}
