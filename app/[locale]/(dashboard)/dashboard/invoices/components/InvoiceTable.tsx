"use client";

import { useTranslations } from "next-intl";
import { MessageCircle, Printer, Trash2, Receipt } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { Invoice, Customer } from "../hooks/useInvoices";

interface Props {
  invoices: Invoice[];
  customers: Customer[];
  canView?: boolean;
  onView: (invoice: Invoice) => void;
  onWhatsApp: (invoice: Invoice, phone: string | null) => void;
  onCancel: (id: string) => void;
}

export function InvoiceTable({ invoices, customers, canView = true, onView, onWhatsApp, onCancel }: Props) {
  const t = useTranslations("Invoices");

  return (
    <>
      <div className="hidden sm:block overflow-x-auto w-full">
        <table className="w-full min-w-[700px] border-collapse">
          <thead className="bg-[var(--surface-elevated)] border-b border-[var(--border)]">
            <tr>
              <th scope="col" className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">{t("thInvoice")}</th>
              <th scope="col" className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">{t("thDate")}</th>
              <th scope="col" className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">{t("thCustomer")}</th>
              <th scope="col" className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">{t("thAmount")}</th>
              <th scope="col" className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">{t("thStatus")}</th>
              <th scope="col" className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">{t("thActions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-[var(--surface-hover)] transition-colors duration-150 group">
                <td className="px-5 py-4 font-mono font-bold text-[var(--foreground)] text-sm">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]" aria-hidden="true"><Receipt size={15} /></div>
                    <span>{invoice.invoiceNumber}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-[var(--foreground)]/70 text-xs font-medium">{formatDate(invoice.invoiceDate)}</td>
                <td className="px-5 py-4 text-[var(--foreground)] font-bold text-sm">{invoice.customerName}</td>
                <td className="px-5 py-4 font-black font-mono text-base text-[var(--foreground)]">{formatCurrency(invoice.total)}</td>
                <td className="px-5 py-4"><StatusBadge invoice={invoice} /></td>
                  <td className="px-5 py-4 text-right">
                    <ActionButtons invoice={invoice} customers={customers} canView={canView} onView={onView} onWhatsApp={onWhatsApp} onCancel={onCancel} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden divide-y divide-[var(--border)] bg-[var(--surface)]">
        {invoices.map((invoice) => (
          <article key={invoice.id} className="p-4 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Receipt size={16} className="text-[var(--color-primary)] shrink-0" aria-hidden="true" />
                  <p className="font-mono font-bold text-sm truncate">{invoice.invoiceNumber}</p>
                </div>
                <p className="mt-1 text-sm font-semibold truncate">{invoice.customerName}</p>
                <p className="mt-1 text-xs text-[var(--foreground)]/55">{formatDate(invoice.invoiceDate)}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono font-black text-base">{formatCurrency(invoice.total)}</p>
                <div className="mt-2 flex justify-end"><StatusBadge invoice={invoice} /></div>
              </div>
            </div>
            <ActionButtons invoice={invoice} customers={customers} canView={canView} onView={onView} onWhatsApp={onWhatsApp} onCancel={onCancel} mobile />
          </article>
        ))}
      </div>
    </>
  );
}

function StatusBadge({ invoice }: { invoice: Invoice }) {
  const t = useTranslations("Invoices");
  if (invoice.status === "cancelled") {
    return <span role="status" className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-zinc-200 dark:bg-zinc-800 text-[var(--foreground)]/60 border border-zinc-300 dark:border-zinc-700 line-through">{t("statusCancelled")}</span>;
  }
  if (invoice.status === "archived") {
    return <span role="status" className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-[var(--surface-elevated)] text-[var(--foreground)]/60 border border-[var(--border)]">{t("statusArchived")}</span>;
  }
  if (invoice.status !== "active") {
    return <span role="status" className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-[var(--surface-elevated)] text-[var(--foreground)]/60 border border-[var(--border)]">{t("statusUnknown")}</span>;
  }
  if (invoice.paymentStatus === "unpaid") {
    return <span role="status" className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-zinc-100 dark:bg-zinc-900 text-[var(--foreground)] border border-zinc-300 dark:border-zinc-700">{t("statusUnpaid")}</span>;
  }
  if (invoice.paymentStatus === "paid_by_khata") {
    return <span role="status" className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-zinc-200 dark:bg-zinc-800 text-[var(--foreground)] border border-zinc-300 dark:border-zinc-700">{t("statusPaidByKhata")}</span>;
  }
  if (invoice.paymentStatus === "partial") {
    return (
      <div className="flex flex-col gap-1 items-start">
        <span role="status" className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-zinc-200 dark:bg-zinc-800 text-[var(--foreground)] border border-zinc-300 dark:border-zinc-700">{t("statusPartial")}</span>
        {invoice.amountPaid !== null && <span className="text-[10px] text-[var(--foreground)]/60 font-mono font-semibold">{formatCurrency(invoice.amountPaid)} {t("amountPaid")}</span>}
      </div>
    );
  }
  if (invoice.paymentStatus === "paid") {
    return <span role="status" className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-800 dark:border-zinc-200">{t("statusPaid")}</span>;
  }
  return <span role="status" className="inline-flex px-3 py-1 text-xs font-bold rounded-full bg-[var(--surface-elevated)] text-[var(--foreground)]/60 border border-[var(--border)]">{t("statusUnknown")}</span>;
}

function ActionButtons({
  invoice,
  customers,
  onView,
  onWhatsApp,
  onCancel,
  canView = true,
  mobile = false,
}: Omit<Props, "invoices"> & { invoice: Invoice; mobile?: boolean }) {
  const t = useTranslations("Invoices");
  const customer = customers.find((candidate) =>
    (invoice.customerId && candidate.id === invoice.customerId) || candidate.name === invoice.customerName,
  );
  const phone = customer?.phone?.trim() || null;
  const buttonClass = mobile
    ? "min-h-[44px] flex-1 px-3 py-2 text-xs font-semibold rounded-xl border border-[var(--border)] flex items-center justify-center gap-1.5 transition-colors"
    : "p-2 text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-all shadow-sm active:scale-95 border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 flex items-center justify-center";
  const labelClass = mobile ? "" : "sr-only";

  return (
    <div className={mobile ? "flex items-center gap-2" : "flex items-center justify-end gap-1.5"}>
      <button
        type="button"
        onClick={() => phone && onWhatsApp(invoice, phone)}
        disabled={!phone || invoice.status === "cancelled"}
        className={`${buttonClass} text-[var(--foreground)]/70 hover:text-[var(--foreground)] hover:bg-[var(--surface-elevated)] disabled:opacity-40 disabled:cursor-not-allowed`}
        aria-label={phone ? t("whatsappShare") : t("noCustomerPhone")}
        title={phone ? t("whatsappShare") : t("noCustomerPhone")}
      >
        <MessageCircle size={17} aria-hidden="true" />
        <span className={labelClass}>{t("whatsappShort")}</span>
      </button>
      <button
        type="button"
        onClick={() => { if (canView) onView(invoice); }}
        disabled={!canView}
        className={`${buttonClass} text-[var(--foreground)]/70 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/20 disabled:opacity-40 disabled:cursor-not-allowed`}
        aria-label={canView ? t("viewInvoice") : t("previewUnavailable")}
        title={canView ? t("viewInvoice") : t("previewUnavailable")}
      >
        <Printer size={17} aria-hidden="true" />
        <span className={labelClass}>{t("viewShort")}</span>
      </button>
      {invoice.status === "active" && (
        <button
          type="button"
          onClick={() => onCancel(invoice.id)}
          className={`${buttonClass} text-[var(--foreground)]/70 hover:text-[var(--foreground)] hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700`}
          aria-label={t("cancelInvoice")}
          title={t("cancelInvoice")}
        >
          <Trash2 size={17} aria-hidden="true" />
          <span className={labelClass}>{t("cancelShort")}</span>
        </button>
      )}
    </div>
  );
}
