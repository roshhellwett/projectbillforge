"use client";

import { useKhata } from "./hooks/useKhata";
import { CustomerSearchPanel } from "./components/CustomerSearchPanel";
import { CustomerInfoCards } from "./components/CustomerInfoCards";
import { TransactionTable } from "./components/TransactionTable";
import { EmptyState } from "./components/EmptyState";
import { AddTransactionModal } from "./components/AddTransactionModal";
import { RecordPaymentModal } from "./components/RecordPaymentModal";
import { ResetKhataModal } from "./components/ResetKhataModal";
import { ConfirmDialog } from "@/components/ui/ui";
import { StaggerContainer, StaggerItem, FadeIn } from "@/components/ui/MotionWrapper";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";

export default function KhataPage() {
  const t = useTranslations("Khata");
  const {
    customers, customer, statement, loading, statementLoading, customerSearch,
    selectedCustomer, accruedFines, showModal, showPaymentModal, deleteId, deleting, saving, collectingFines,
    overdueIds, resetHistory, showResetModal, resetting, modalFormData, paymentData,
    setCustomerSearch, setShowModal, setShowPaymentModal,
    setModalFormData, setPaymentData, setDeleteId, setShowResetModal,
    handleCustomerSelect, handleSubmit, handleDeleteTransaction, handlePaymentSubmit,
    handleCollectFines, handleResetKhata,
  } = useKhata();

  return (
    <StaggerContainer className="space-y-6">
      <FadeIn className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">{t("title")}</h1>
          <p className="text-[var(--foreground)]/60 mt-1">{t("subtitle")}</p>
        </div>
      </FadeIn>

      <StaggerItem>
        <CustomerSearchPanel
          customers={customers}
          selectedCustomer={selectedCustomer}
          customerSearch={customerSearch}
          overdueIds={overdueIds}
          statementLoading={statementLoading}
          onSearchChange={setCustomerSearch}
          onSelect={handleCustomerSelect}
        />
      </StaggerItem>

      {customer && (
        <>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <button onClick={() => handleCustomerSelect("")} className="text-sm text-[var(--foreground)]/60 hover:text-[var(--color-primary)] flex items-center gap-1 transition-colors">
              {t("backToList")}
            </button>
            <button onClick={() => { setModalFormData({ type: "credit", amount: "", note: "" }); setShowModal(true); }} className="glass-btn-primary flex items-center gap-2">
              <Plus size={20} />
              {t("addTransaction")}
            </button>
          </div>

          <CustomerInfoCards customer={customer} accruedFines={accruedFines} resetHistory={resetHistory} onRecordPayment={() => { setPaymentData({ amount: "", note: "", method: "cash" }); setShowPaymentModal(true); }} onCollectFines={handleCollectFines} onResetKhata={() => setShowResetModal(true)} />

          <TransactionTable statement={statement} loading={statementLoading} onDelete={setDeleteId} />
        </>
      )}

      {!selectedCustomer && <EmptyState loading={loading} />}

      <AddTransactionModal
        open={showModal}
        saving={saving}
        formData={modalFormData}
        onClose={() => setShowModal(false)}
        onChange={setModalFormData}
        onSubmit={handleSubmit}
      />

      <RecordPaymentModal
        open={showPaymentModal}
        saving={saving}
        customer={customer}
        paymentData={paymentData}
        onClose={() => setShowPaymentModal(false)}
        onChange={setPaymentData}
        onSubmit={handlePaymentSubmit}
      />

      <ConfirmDialog
        open={!!deleteId}
        title={t("deleteTitle")}
        message={t("deleteMessage")}
        onConfirm={handleDeleteTransaction}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />

      {customer && (
        <ResetKhataModal
          open={showResetModal}
          customerName={customer.name}
          customerBalance={customer.currentBalance ?? 0}
          loading={resetting}
          onClose={() => setShowResetModal(false)}
          onConfirm={handleResetKhata}
        />
      )}
    </StaggerContainer>
  );
}
