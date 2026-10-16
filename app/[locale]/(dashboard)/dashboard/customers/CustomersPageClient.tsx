"use client";

import { useCustomers, type Customer } from "./hooks/useCustomers";
import { CustomerHeader } from "./components/CustomerHeader";
import { CustomerSearchBar } from "./components/CustomerSearchBar";
import { CustomerGrid } from "./components/CustomerGrid";
import { CustomerModal } from "./components/CustomerModal";
import { EmptyState } from "./components/EmptyState";
import { ConfirmDialog } from "@/components/ui/ui";
import { StaggerContainer, StaggerItem } from "@/components/ui/MotionWrapper";
import { useTranslations } from "next-intl";

export default function CustomersPageClient({
  initialData,
  initialError,
}: {
  initialData?: { customers: Customer[]; totalCustomers: number; totalDue: number };
  initialError?: string;
}) {
  const t = useTranslations("Customers");
  const {
    customers, filteredCustomers, totalDue, loading, refreshing, search, showModal, editingCustomer,
    formData, saving, formError, deleteId, deleting, deleteError, syncingId,
    offset, totalCustomers, loadError, loadMoreError, loadingMore, successMessage,
    setSearch, setShowModal, setFormData, setFormError, setDeleteId, setDeleteError,
    openModal, handleEdit, handleSubmit, handleDelete, handleSyncBalance,
    loadMoreCustomers, loadData,
  } = useCustomers(initialData, initialError);

  const hasSearch = search.trim().length > 0;

  return (
    <StaggerContainer className="space-y-4 sm:space-y-6">
      <CustomerHeader
        onAdd={openModal}
        totalCustomers={totalCustomers}
        showingCustomers={filteredCustomers.length}
        dueCustomers={totalDue}
      />

      {(refreshing || successMessage) && (
        <div className="flex flex-wrap items-center gap-2 px-1 text-sm" role="status" aria-live="polite">
          {refreshing && <span className="text-[var(--foreground)]/60">{t("refreshingCustomers")}</span>}
          {successMessage && <span className="font-semibold text-[var(--color-success)]">{successMessage}</span>}
        </div>
      )}

      <StaggerItem className="glass-card overflow-hidden">
        <CustomerSearchBar
          value={search}
          onChange={setSearch}
          resultCount={filteredCustomers.length}
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
              {loading || refreshing ? t("refreshingCustomers") : t("retryLabel")}
            </button>
          </div>
        )}

        {loading ? (
          <CustomerGrid
            customers={[]}
            loading
            syncingId={syncingId}
            offset={offset}
            totalCustomers={totalCustomers}
            loadingMore={loadingMore}
            loadMoreError={loadMoreError}
            onEdit={handleEdit}
            onDelete={(id) => { setDeleteError(null); setDeleteId(id); }}
            onSyncBalance={handleSyncBalance}
            onLoadMore={loadMoreCustomers}
          />
        ) : loadError && customers.length === 0 ? (
          null
        ) : filteredCustomers.length === 0 ? (
          <EmptyState
            visible
            filtered={hasSearch}
            onClear={() => setSearch("")}
            onCreate={openModal}
            hasMore={offset < totalCustomers}
            loadingMore={loadingMore}
            loadMoreError={loadMoreError}
            remaining={totalCustomers - offset}
            loaded={offset}
            total={totalCustomers}
            onLoadMore={loadMoreCustomers}
          />
        ) : (
          <CustomerGrid
            customers={filteredCustomers}
            loading={false}
            syncingId={syncingId}
            offset={offset}
            totalCustomers={totalCustomers}
            loadingMore={loadingMore}
            loadMoreError={loadMoreError}
            onEdit={handleEdit}
            onDelete={(id) => { setDeleteError(null); setDeleteId(id); }}
            onSyncBalance={handleSyncBalance}
            onLoadMore={loadMoreCustomers}
          />
        )}
      </StaggerItem>

      <CustomerModal
        open={showModal}
        saving={saving}
        editingCustomer={editingCustomer}
        formData={formData}
        error={formError}
        onClose={() => { setShowModal(false); setFormError(null); }}
        onSubmit={handleSubmit}
        onFormChange={data => { setFormData(prev => ({ ...prev, ...data })); setFormError(null); }}
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
