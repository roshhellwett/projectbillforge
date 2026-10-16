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
import { ArrowLeft, Plus, ShieldCheck } from "lucide-react";
import { safeNum } from "./hooks/useKhata";

export default function KhataPage() {
  const t = useTranslations("Khata");
  const {
    customers, customer, statement, loading, statementLoading, customerSearch,
    customersError, statementError, successState,
    customerTotal, loadingMoreCustomers, loadMoreCustomersError,
    selectedCustomer, accruedFines, showModal, showPaymentModal, cancelId, cancelling, saving, collectingFines,
    totalBalanceDue, overdueIds, resetHistory, showResetModal, resetting, modalFormData, paymentData,
    setCustomerSearch, setShowModal, setShowPaymentModal,
    setModalFormData, setPaymentData, setCancelId, setShowResetModal,
    handleCustomerSelect, handleSubmit, handleCancelTransaction, handlePaymentSubmit,
    handleCollectFines, handleResetKhata, loadCustomers, loadMoreCustomers, retryStatement,
  } = useKhata();

  const dueCustomerCount = customers.filter(candidate => safeNum(candidate.currentBalance) > 0).length;
  const dueCustomerLabel = customerTotal > customers.length
    ? t("dueCustomersLoaded", { count: dueCustomerCount })
    : t("dueCustomers", { count: dueCustomerCount });
  const successMessage = successState === "transaction"
    ? t("successTransaction")
    : successState === "payment"
    ? t("successPayment")
    : successState === "cancel"
    ? t("successCancel")
    : successState === "fine"
    ? t("successFine")
    : successState === "reset"
    ? t("successReset")
    : null;

  return (
    <StaggerContainer className="space-y-6">
      <FadeIn className="flex flex-col gap-4 rounded-3xl border border-[var(--border)] bg-[var(--surface-elevated)]/60 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-primary)]">{t("headerEyebrow")}</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-[var(--foreground)] sm:text-3xl">{t("title")}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--foreground)]/60">{t("headerDescription")}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 text-xs font-semibold">
          {loading || customersError ? (
            <span role="status" className="inline-flex h-9 w-36 items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 text-[var(--foreground)]/45">
              <span className="h-3 w-24 rounded skeleton" />
              <span className="sr-only">{customersError ? t("customerLoadErrorTitle") : t("loadingCustomers")}</span>
            </span>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]/65">
                <ShieldCheck size={14} className="text-[var(--color-primary)]" aria-hidden="true" />
                {t("customerCount", { count: customerTotal || customers.length })}
              </span>
              <span className="rounded-full border border-[var(--color-warning)]/25 bg-[var(--color-warning)]/10 px-3 py-2 text-[var(--color-warning)]">
                {dueCustomerLabel}
              </span>
            </>
          )}
        </div>
      </FadeIn>

      {successMessage && (
        <div role="status" aria-live="polite" className="flex items-start gap-2.5 rounded-2xl border border-[var(--color-success)]/25 bg-[var(--color-success)]/10 px-4 py-3 text-sm font-semibold text-[var(--color-success)]">
          <ShieldCheck size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}

      <StaggerItem>
        <CustomerSearchPanel
          customers={customers}
          totalCustomers={customerTotal}
          selectedCustomer={selectedCustomer}
          customerSearch={customerSearch}
          overdueIds={overdueIds}
          loading={loading}
          loadingMore={loadingMoreCustomers}
          loadMoreError={loadMoreCustomersError}
          error={customersError}
          statementLoading={statementLoading}
          onSearchChange={setCustomerSearch}
          onSelect={handleCustomerSelect}
          onRetry={() => { void loadCustomers(); }}
          onLoadMore={() => { void loadMoreCustomers(); }}
        />
      </StaggerItem>

      {customer && (
        <>
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={() => handleCustomerSelect("")} className="inline-flex min-h-11 min-w-0 items-center gap-2 rounded-xl px-2 text-sm font-semibold text-[var(--foreground)]/60 transition-colors hover:bg-[var(--surface-elevated)] hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]">
              <ArrowLeft size={16} aria-hidden="true" />
              {t("backToList")}
            </button>
            <button
              type="button"
              onClick={() => { setModalFormData({ type: "credit", amount: "", note: "" }); setShowModal(true); }}
              className="glass-btn-secondary min-h-11 shrink-0 gap-2 px-4 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            >
              <Plus size={18} aria-hidden="true" />
              <span>{t("addTransaction")}</span>
            </button>
          </div>

          <CustomerInfoCards customer={customer} accruedFines={accruedFines} totalBalanceDue={totalBalanceDue} resetHistory={resetHistory} onRecordPayment={() => { setPaymentData({ amount: "", note: "", method: "cash" }); setShowPaymentModal(true); }} onCollectFines={handleCollectFines} collectingFines={collectingFines} onResetKhata={() => setShowResetModal(true)} />

          <TransactionTable statement={statement} loading={statementLoading} error={statementError} onRetry={retryStatement} onCancel={setCancelId} onAddTransaction={() => { setModalFormData({ type: "credit", amount: "", note: "" }); setShowModal(true); }} />
        </>
      )}

      {!selectedCustomer && !customersError && <EmptyState loading={loading} hasCustomers={customerTotal > 0 || customers.length > 0} />}

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
        open={!!cancelId}
        title={t("cancelTransactionTitle")}
        message={t("cancelTransactionMessage")}
        confirmLabel={t("cancelTransactionConfirm")}
        cancelLabel={t("cancel")}
        onConfirm={handleCancelTransaction}
        onCancel={() => setCancelId(null)}
        variant="warning"
        loading={cancelling}
        loadingLabel={t("processing")}
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
