"use client";

import { useCustomers } from "./hooks/useCustomers";
import { CustomerHeader } from "./components/CustomerHeader";
import { CustomerSearchBar } from "./components/CustomerSearchBar";
import { CustomerGrid } from "./components/CustomerGrid";
import { CustomerModal } from "./components/CustomerModal";
import { EmptyState } from "./components/EmptyState";
import { ConfirmDialog } from "@/components/ui/ui";
import { StaggerContainer, StaggerItem } from "@/components/ui/MotionWrapper";
import { useTranslations } from "next-intl";

export default function CustomersPage() {
  const t = useTranslations("Customers");
  const {
    filteredCustomers, loading, search, showModal, editingCustomer,
    formData, saving, deleteId, deleting, syncingId, offset, totalCustomers,
    setSearch, setShowModal, setFormData, setDeleteId,
    openModal, handleEdit, handleSubmit, handleDelete, handleSyncBalance, loadMoreCustomers, loadData,
  } = useCustomers();

  return (
    <StaggerContainer className="space-y-6">
      <CustomerHeader onAdd={openModal} />

      <StaggerItem className="glass-card overflow-hidden">
        <CustomerSearchBar value={search} onChange={setSearch} />
        <CustomerGrid
          customers={filteredCustomers}
          loading={loading}
          syncingId={syncingId}
          offset={offset}
          totalCustomers={totalCustomers}
          onEdit={handleEdit}
          onDelete={setDeleteId}
          onSyncBalance={handleSyncBalance}
          onLoadMore={loadMoreCustomers}
        />
        <EmptyState visible={!loading && filteredCustomers.length === 0} />
      </StaggerItem>

      <CustomerModal
        open={showModal}
        saving={saving}
        editingCustomer={editingCustomer}
        formData={formData}
        onClose={() => { setShowModal(false); loadData(); }}
        onSubmit={handleSubmit}
        onFormChange={data => setFormData(prev => ({ ...prev, ...data }))}
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
