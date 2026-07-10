"use client";

import { useTranslations, useLocale } from "next-intl";
import { Printer, MessageCircle, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { Invoice, Customer } from "../hooks/useInvoices";

interface Props {
  invoices: Invoice[];
  customers: Customer[];
  businessName: string;
  onView: (inv: Invoice) => void;
  onWhatsApp: (inv: Invoice, phone: string | null) => void;
  onCancel: (id: string) => void;
}

export function InvoiceTable({ invoices, customers, businessName, onView, onWhatsApp, onCancel }: Props) {
  const t = useTranslations("Invoices");

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead className="bg-[var(--foreground)]/5 border-b border-[var(--border)]/30">
          <tr>
            <th className="px-3 sm:px-5 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-[var(--foreground)]/70">{t("thInvoice")}</th>
            <th className="px-3 sm:px-5 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-[var(--foreground)]/70">{t("thDate")}</th>
            <th className="px-3 sm:px-5 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-[var(--foreground)]/70">{t("thCustomer")}</th>
            <th className="px-3 sm:px-5 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-[var(--foreground)]/70">{t("thAmount")}</th>
            <th className="px-3 sm:px-5 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-[var(--foreground)]/70">{t("thStatus")}</th>
            <th className="px-3 sm:px-5 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-[var(--foreground)]/70">{t("thActions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]/30">
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="hover:bg-[var(--foreground)]/[0.02] transition-colors">
              <td className="px-3 sm:px-5 py-3 sm:py-4 font-medium text-[var(--foreground)] text-sm">{invoice.invoiceNumber}</td>
              <td className="px-3 sm:px-5 py-3 sm:py-4 text-[var(--foreground)]/70 text-xs sm:text-sm">{formatDate(invoice.invoiceDate)}</td>
              <td className="px-3 sm:px-5 py-3 sm:py-4 text-[var(--foreground)] font-medium text-sm">{invoice.customerName}</td>
              <td className="px-3 sm:px-5 py-3 sm:py-4 font-semibold text-[var(--foreground)]">{formatCurrency(invoice.total)}</td>
              <td className="px-3 sm:px-5 py-3 sm:py-4">
                <StatusBadge invoice={invoice} />
              </td>
              <td className="px-3 sm:px-5 py-3 sm:py-4">
                <ActionButtons
                  invoice={invoice}
                  customers={customers}
                  businessName={businessName}
                  onView={onView}
                  onWhatsApp={onWhatsApp}
                  onCancel={onCancel}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ invoice }: { invoice: Invoice }) {
  const t = useTranslations("Invoices");
  if (invoice.status === "cancelled") {
    return <span className="px-2 sm:px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/20">{t("statusCancelled")}</span>;
  }
  if (invoice.paymentStatus === "unpaid") {
    return <span className="px-2 sm:px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/20">{t("statusUnpaid")}</span>;
  }
  if (invoice.paymentStatus === "paid_by_khata") {
    return <span className="px-2 sm:px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">{t("statusPaidByKhata")}</span>;
  }
  if (invoice.paymentStatus === "partial") {
    return (
      <div className="flex flex-col gap-1 items-start">
        <span className="px-2 sm:px-2.5 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">{t("statusPartial")}</span>
        <span className="text-[10px] text-[var(--foreground)]/50 font-medium px-1">{formatCurrency(invoice.amountPaid)} {t("amountPaid")}</span>
      </div>
    );
  }
  return <span className="px-2 sm:px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20">{t("statusPaid")}</span>;
}

function ActionButtons({ invoice, customers, businessName, onView, onWhatsApp, onCancel }: Omit<Props, "invoices"> & { invoice: Invoice }) {
  const t = useTranslations("Invoices");

  const handleWhatsApp = () => {
    const customer = customers.find(c =>
      (invoice.customerId && c.id === invoice.customerId) || c.name === invoice.customerName
    );
    onWhatsApp(invoice, customer?.phone || null);
  };

  if (invoice.status === "cancelled") {
    return <span className="text-[var(--foreground)]/30 text-xs">—</span>;
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleWhatsApp}
        className="p-2.5 sm:p-2 text-[var(--foreground)]/40 hover:text-[#25D366] hover:bg-[#25D366]/10 rounded-lg transition-colors"
        aria-label={t("whatsappShare")}
        title={t("whatsappShare")}
      >
        <MessageCircle size={16} />
      </button>
      <button
        onClick={() => onView(invoice)}
        className="p-2.5 sm:p-2 text-[var(--foreground)]/40 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors"
        aria-label={t("viewInvoice")}
      >
        <Printer size={16} />
      </button>
      {invoice.status === "active" && (
        <button
          onClick={() => onCancel(invoice.id)}
          className="p-2.5 sm:p-2 text-[var(--foreground)]/40 hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 rounded-lg transition-colors"
          aria-label={t("cancelInvoice")}
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}
