"use client";

import { useInvoices, type Invoice, type Product, type Customer, type BusinessProfile } from "./hooks/useInvoices";
import { InvoiceHeader } from "./components/InvoiceHeader";
import { InvoiceSearchBar } from "./components/InvoiceSearchBar";
import { InvoiceTable } from "./components/InvoiceTable";
import { InvoiceLoadMore } from "./components/InvoiceLoadMore";
import { EmptyState } from "./components/EmptyState";
import { NewInvoiceModal } from "@/components/invoices/NewInvoiceModal";
import { InvoicePrintModal } from "@/components/invoices/InvoicePrintModal";
import { ConfirmDialog, SkeletonTable } from "@/components/ui/ui";
import { StaggerContainer, StaggerItem } from "@/components/ui/MotionWrapper";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { formatCurrency } from "@/lib/formatters";

export default function InvoicesPageClient({ initialData }: {
  initialData?: {
    products: Product[]; customers: Customer[]; invoices: Invoice[];
    businessProfile: BusinessProfile | null; totalInvoices: number;
  }
}) {
  const t = useTranslations("Invoices");
  const router = useRouter();
  const {
    products, customers, invoices, filteredInvoices, loading, search, showNewInvoice,
    printFormat, saving, cancelId, cancelling, viewInvoice, businessProfile,
    showSettingsPrompt, settingsPromptMessage, offset, totalInvoices,
    statusFilter, loadError, loadMoreError, loadingMore, createError,
    cancelError, refreshing, successMessage,
    setSearch, setShowNewInvoice, setPrintFormat, setCancelId, setStatusFilter,
    setViewInvoice, setShowSettingsPrompt, setCancelError,
    openNewInvoice, loadData, loadMoreInvoices, handleCreateSubmit, handleCancelInvoice,
  } = useInvoices(initialData);

  const handleWhatsAppShare = (invoice: Invoice, customerPhone: string | null) => {
    const amount = formatCurrency(invoice.total);
    const vars = { businessName: businessProfile?.name || "", customerName: invoice.customerName, invoiceNumber: invoice.invoiceNumber, amount };
    const message = t("whatsappMessage", vars);
    const encoded = encodeURIComponent(message);
    let phone = customerPhone?.replace(/\D/g, "") || "";
    if (phone.length === 10 && /^[6-9]/.test(phone)) phone = "91" + phone;
    window.open(`https://wa.me/${phone}?text=${encoded}`, "_blank");
  };

  return (
    <StaggerContainer className="space-y-4 sm:space-y-6">
      <InvoiceHeader onAdd={openNewInvoice} disabled={loading || refreshing || (Boolean(loadError) && invoices.length === 0)} invoiceCount={totalInvoices} />

      {(refreshing || successMessage) && (
        <div className="flex flex-wrap items-center gap-2 text-sm" role="status" aria-live="polite">
          {refreshing && <span className="text-[var(--foreground)]/60">{t("refreshingInvoices")}</span>}
          {successMessage && <span className="font-semibold text-[var(--color-success)]">{successMessage}</span>}
        </div>
      )}

      <StaggerItem className="glass-card overflow-hidden">
        <InvoiceSearchBar
          value={search}
          onChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          resultCount={filteredInvoices.length}
        />

        {loadError && (
          <div className="m-4 sm:m-6 p-4 rounded-xl border border-[var(--color-danger)]/25 bg-[var(--color-danger)]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3" role="alert">
            <div>
              <p className="font-semibold text-sm text-[var(--foreground)]">{t("loadErrorTitle")}</p>
              <p className="text-sm text-[var(--foreground)]/65 mt-1">{loadError}</p>
            </div>
             <button type="button" onClick={() => void loadData()} disabled={loading || refreshing} className="glass-btn-secondary min-h-[44px] shrink-0 disabled:opacity-50">
               {loading || refreshing ? t("refreshingInvoices") : t("retryLabel")}
            </button>
          </div>
        )}

        {loading || (refreshing && invoices.length === 0) ? (
          <div className="p-4"><SkeletonTable rows={5} /></div>
        ) : loadError && invoices.length === 0 && !initialData ? (
          <div className="p-8 text-center text-sm text-[var(--foreground)]/60">{t("loadErrorMessage")}</div>
        ) : filteredInvoices.length === 0 ? (
          <EmptyState
            visible
            filtered={search.trim().length > 0 || statusFilter !== "all"}
            onClear={() => { setSearch(""); setStatusFilter("all"); }}
            onCreate={openNewInvoice}
          />
        ) : (
          <InvoiceTable
            invoices={filteredInvoices}
            customers={customers}
            canView={Boolean(businessProfile)}
            onView={(inv) => { if (businessProfile) setViewInvoice(inv); }}
            onWhatsApp={handleWhatsAppShare}
            onCancel={setCancelId}
          />
        )}

        {!loading && !refreshing && (
          <InvoiceLoadMore
            remaining={Math.max(0, totalInvoices - offset)}
            onLoadMore={loadMoreInvoices}
            loading={loadingMore}
            error={loadMoreError}
          />
        )}
      </StaggerItem>

      {showNewInvoice && (
        <NewInvoiceModal
          onClose={() => setShowNewInvoice(false)}
          onSubmit={handleCreateSubmit}
          customers={customers}
          products={products}
          saving={saving}
          error={createError || ""}
        />
      )}

      <ConfirmDialog
        open={!!cancelId}
        title={t("cancelInvoiceTitle")}
        message={cancelError || t("cancelInvoiceMessage")}
        onConfirm={handleCancelInvoice}
        onCancel={() => { setCancelId(null); setCancelError(null); }}
        loading={cancelling}
      />

      <ConfirmDialog
        open={showSettingsPrompt}
        title={t("settingsPromptTitle")}
        message={settingsPromptMessage + t("settingsPromptSuffix")}
        onConfirm={() => { setShowSettingsPrompt(false); router.push("/dashboard/settings"); }}
        onCancel={() => { setShowSettingsPrompt(false); }}
      />

      {viewInvoice && businessProfile && (
        <InvoicePrintModal
          invoice={viewInvoice}
          businessProfile={businessProfile}
          printFormat={printFormat}
          onFormatChange={setPrintFormat}
          onClose={() => setViewInvoice(null)}
        />
      )}
    </StaggerContainer>
  );
}
