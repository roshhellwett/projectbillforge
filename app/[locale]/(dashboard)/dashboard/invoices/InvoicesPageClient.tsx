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
    products, customers, filteredInvoices, loading, search, showNewInvoice,
    printFormat, saving, cancelId, cancelling, viewInvoice, businessProfile,
    showSettingsPrompt, settingsPromptMessage, offset, totalInvoices,
    setSearch, setShowNewInvoice, setPrintFormat, setCancelId,
    setViewInvoice, setShowSettingsPrompt,
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
      <InvoiceHeader onAdd={openNewInvoice} />

      <StaggerItem className="glass-card overflow-hidden">
        <InvoiceSearchBar value={search} onChange={setSearch} />

        {loading ? (
          <div className="p-4"><SkeletonTable rows={5} /></div>
        ) : filteredInvoices.length === 0 ? (
          <EmptyState visible />
        ) : (
          <InvoiceTable
            invoices={filteredInvoices}
            customers={customers}
            businessName={businessProfile?.name || ""}
            onView={(inv) => { if (businessProfile) setViewInvoice(inv); }}
            onWhatsApp={handleWhatsAppShare}
            onCancel={setCancelId}
          />
        )}

        {!loading && (
          <InvoiceLoadMore
            remaining={totalInvoices - offset}
            onLoadMore={loadMoreInvoices}
          />
        )}
      </StaggerItem>

      {showNewInvoice && (
        <NewInvoiceModal
          onClose={() => { setShowNewInvoice(false); loadData(); }}
          onSubmit={handleCreateSubmit}
          customers={customers}
          products={products}
          saving={saving}
          error=""
        />
      )}

      <ConfirmDialog
        open={!!cancelId}
        title={t("cancelInvoiceTitle")}
        message={t("cancelInvoiceMessage")}
        onConfirm={handleCancelInvoice}
        onCancel={() => setCancelId(null)}
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
