"use client";

import { useTranslations } from "next-intl";
import { Printer, MessageCircle, Trash2, Receipt } from "lucide-react";
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
    <div className="overflow-x-auto w-full">
      <table className="w-full min-w-[700px] border-collapse">
        <thead className="bg-[var(--surface-elevated)] border-b border-[var(--border)]">
          <tr>
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
              {t("thInvoice")}
            </th>
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
              {t("thDate")}
            </th>
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
              {t("thCustomer")}
            </th>
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
              {t("thAmount")}
            </th>
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
              {t("thStatus")}
            </th>
            <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
              {t("thActions")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
          {invoices.map((invoice) => (
            <tr
              key={invoice.id}
              className="hover:bg-[var(--surface-hover)] transition-colors duration-150 group"
            >
              <td className="px-5 py-4 font-mono font-bold text-[var(--foreground)] text-sm">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    <Receipt size={15} />
                  </div>
                  <span>{invoice.invoiceNumber}</span>
                </div>
              </td>
              <td className="px-5 py-4 text-[var(--foreground)]/70 text-xs font-medium">
                {formatDate(invoice.invoiceDate)}
              </td>
              <td className="px-5 py-4 text-[var(--foreground)] font-bold text-sm">
                {invoice.customerName}
              </td>
              <td className="px-5 py-4 font-black font-mono text-base text-[var(--foreground)]">
                {formatCurrency(invoice.total)}
              </td>
              <td className="px-5 py-4">
                <StatusBadge invoice={invoice} />
              </td>
              <td className="px-5 py-4 text-right">
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
    return (
      <span className="px-3 py-1 text-xs font-bold rounded-full bg-zinc-200 dark:bg-zinc-800 text-[var(--foreground)]/60 border border-zinc-300 dark:border-zinc-700 line-through">
        {t("statusCancelled")}
      </span>
    );
  }
  if (invoice.paymentStatus === "unpaid") {
    return (
      <span className="px-3 py-1 text-xs font-bold rounded-full bg-zinc-100 dark:bg-zinc-900 text-[var(--foreground)] border border-zinc-300 dark:border-zinc-700">
        {t("statusUnpaid")}
      </span>
    );
  }
  if (invoice.paymentStatus === "paid_by_khata") {
    return (
      <span className="px-3 py-1 text-xs font-bold rounded-full bg-zinc-200 dark:bg-zinc-800 text-[var(--foreground)] border border-zinc-300 dark:border-zinc-700">
        {t("statusPaidByKhata")}
      </span>
    );
  }
  if (invoice.paymentStatus === "partial") {
    return (
      <div className="flex flex-col gap-1 items-start">
        <span className="px-3 py-1 text-xs font-bold rounded-full bg-zinc-200 dark:bg-zinc-800 text-[var(--foreground)] border border-zinc-300 dark:border-zinc-700">
          {t("statusPartial")}
        </span>
        <span className="text-[10px] text-[var(--foreground)]/60 font-mono font-semibold">
          {formatCurrency(invoice.amountPaid)} {t("amountPaid")}
        </span>
      </div>
    );
  }
  return (
    <span className="px-3 py-1 text-xs font-bold rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-800 dark:border-zinc-200">
      {t("statusPaid")}
    </span>
  );
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
    return <span className="text-[var(--foreground)]/30 text-xs font-mono">—</span>;
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        onClick={handleWhatsApp}
        className="p-2 text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-all shadow-sm active:scale-95 border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 flex items-center justify-center"
        aria-label={t("whatsappShare")}
        title={t("whatsappShare")}
      >
        <MessageCircle size={17} />
      </button>
      <button
        onClick={() => onView(invoice)}
        className="p-2 text-[var(--foreground)]/60 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-xl transition-all shadow-sm active:scale-95 border border-transparent hover:border-[var(--color-primary)]/20 flex items-center justify-center"
        aria-label={t("viewInvoice")}
      >
        <Printer size={17} />
      </button>
      {invoice.status === "active" && (
        <button
          onClick={() => onCancel(invoice.id)}
          className="p-2 text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-all shadow-sm active:scale-95 border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 flex items-center justify-center"
          aria-label={t("cancelInvoice")}
        >
          <Trash2 size={17} />
        </button>
      )}
    </div>
  );
}
