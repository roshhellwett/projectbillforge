import React from "react";
import { X, Printer } from "lucide-react";
import { formatCurrency, formatDate, formatReceiptDate } from "@/lib/formatters";

interface InvoiceItem {
    productId: string;
    productName: string;
    quantity: number;
    rate: number;
    gstRate: number;
    amount: number;
    cgst: number;
    sgst: number;
    igst: number;
}

interface Invoice {
    id: string;
    invoiceNumber: string;
    customerName: string;
    invoiceDate: Date;
    total: number | null;
    status: string | null;
    paymentMode: string | null;
    paymentStatus: string | null;
    amountPaid: number | null;
    items: InvoiceItem[] | null;
    customerGstin: string | null;
    customerAddress: string | null;
    notes: string | null;
}

interface BusinessProfile {
    name: string;
    gstin: string | null;
    address: string | null;
    phone: string | null;
    state: string;
    pincode: string | null;
    termsAndConditions: string | null;
}

interface InvoicePrintModalProps {
    invoice: Invoice;
    businessProfile: BusinessProfile;
    printFormat: "a4" | "thermal";
    onFormatChange: (format: "a4" | "thermal") => void;
    onClose: () => void;
}

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function getItemTotals(items: InvoiceItem[]) {
    return items.reduce(
        (acc, item) => {
            acc.subtotal += item.amount;
            acc.cgst += item.cgst;
            acc.sgst += item.sgst;
            acc.igst += item.igst;
            return acc;
        },
        { subtotal: 0, cgst: 0, sgst: 0, igst: 0 }
    );
}

export function InvoicePrintModal({
    invoice,
    businessProfile,
    printFormat,
    onFormatChange,
    onClose
}: InvoicePrintModalProps) {
    const invoiceItems = invoice.items ?? [];
    const itemTotals = getItemTotals(invoiceItems);
    const hasIgst = invoiceItems.some((item) => item.igst > 0);
    const safeTotal = Number(invoice.total ?? 0).toFixed(2);
    const safeAmountPaid = Number(invoice.amountPaid ?? 0).toFixed(2);

    const handlePrintThermal = () => {
        const safeBusinessName = escapeHtml(businessProfile.name);
        const safeBusinessAddress = businessProfile.address ? escapeHtml(businessProfile.address).replace(/\n/g, "<br>") : "";
        const safeBusinessPhone = businessProfile.phone ? escapeHtml(businessProfile.phone) : "";
        const safeBusinessGstin = businessProfile.gstin ? escapeHtml(businessProfile.gstin) : "";
        const safeInvoiceDate = formatDate(invoice.invoiceDate);
        const safeInvoiceNumber = escapeHtml(invoice.invoiceNumber);
        const safeCustomerName = escapeHtml(invoice.customerName);
        const thermalItemsRows = invoiceItems.map((item) => `
                <tr>
                  <td colspan="4" class="font-bold pb-0">${escapeHtml(item.productName)}</td>
                </tr>
                <tr>
                  <td></td>
                  <td class="text-right">${Number(item.quantity)}</td>
                  <td class="text-right">${Number(item.rate).toFixed(2)}</td>
                  <td class="text-right">${Number(item.amount).toFixed(2)}</td>
                </tr>
              `).join("");

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
        <html><head><title>Receipt ${safeInvoiceNumber}</title>
        <style>
          @page { margin: 0; }
          body { font-family: 'Courier New', Courier, monospace; margin: 0; padding: 10px; width: 80mm; font-size: 12px; color: #000; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .text-left { text-align: left; }
          .font-bold { font-weight: bold; }
          .mb-2 { margin-bottom: 8px; }
          .mb-4 { margin-bottom: 16px; }
          .mt-2 { margin-top: 8px; }
          .mt-4 { margin-top: 16px; }
          .border-b { border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
          .border-t { border-top: 1px dashed #000; padding-top: 8px; margin-top: 8px; }
          .w-full { width: 100%; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 4px 0; font-size: 11px; }
          th { border-bottom: 1px dashed #000; text-align: left; }
          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; }
        </style></head><body>
          <div class="text-center mb-4">
            <h2 class="font-bold" style="font-size: 16px; margin: 0 0 4px 0;">${safeBusinessName}</h2>
            ${safeBusinessAddress ? `<div>${safeBusinessAddress}</div>` : ''}
            ${safeBusinessPhone ? `<div>Ph: ${safeBusinessPhone}</div>` : ''}
            ${safeBusinessGstin ? `<div>GSTIN: ${safeBusinessGstin}</div>` : ''}
          </div>
          
          <div class="border-b">
            <div><span class="font-bold">Date:</span> ${safeInvoiceDate}</div>
            <div><span class="font-bold">Inv No:</span> ${safeInvoiceNumber}</div>
            <div><span class="font-bold">To:</span> ${safeCustomerName}</div>
          </div>

          <table class="w-full mb-2">
            <thead>
              <tr>
                <th>Item</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Rate</th>
                <th class="text-right">Amt</th>
              </tr>
            </thead>
            <tbody>
              ${thermalItemsRows}
            </tbody>
          </table>

          <div class="border-t">
            <div class="grid-2">
              <div>Subtotal:</div>
              <div class="text-right">${formatCurrency(itemTotals.subtotal)}</div>
            </div>
            <div class="grid-2">
              <div>GST:</div>
              <div class="text-right">${formatCurrency(itemTotals.cgst + itemTotals.sgst + itemTotals.igst)}</div>
            </div>
            <div class="grid-2 font-bold mt-2" style="font-size: 14px;">
              <div>Total:</div>
              <div class="text-right">${formatCurrency(invoice.total)}</div>
            </div>
          </div>

          <div class="text-center mt-4 pt-4 border-t">
            <div class="mb-2">*** Thank You ***</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body></html>
      `);
            printWindow.document.close();
        }
    };

    const handlePrintA4 = () => {
        const safeBusinessName = escapeHtml(businessProfile.name);
        const safeBusinessAddress = businessProfile.address ? escapeHtml(businessProfile.address).replace(/\n/g, "<br>") : "";
        const safeBusinessPhone = businessProfile.phone ? escapeHtml(businessProfile.phone) : "";
        const safeBusinessGstin = businessProfile.gstin ? escapeHtml(businessProfile.gstin) : "";
        const safeInvoiceDate = formatReceiptDate(invoice.invoiceDate);
        const safeInvoiceNumber = escapeHtml(invoice.invoiceNumber);
        const safeCustomerName = escapeHtml(invoice.customerName);
        const safeCustomerAddress = invoice.customerAddress ? escapeHtml(invoice.customerAddress).replace(/\n/g, "<br>") : "";
        const safeCustomerGstin = invoice.customerGstin ? escapeHtml(invoice.customerGstin) : "";
        const safeInvoiceNotes = invoice.notes ? escapeHtml(invoice.notes).replace(/\n/g, "<br>") : "";
        const safeTerms = businessProfile.termsAndConditions ? escapeHtml(businessProfile.termsAndConditions).replace(/\n/g, "<br>") : "";
        const a4ItemsRows = invoiceItems.map((item, i) => `
                  <tr>
                    <td class="text-center" style="color: #64748b;">${i + 1}</td>
                    <td class="text-left font-semibold">${escapeHtml(item.productName)}</td>
                    <td class="text-right">${Number(item.quantity)}</td>
                    <td class="text-right">${formatCurrency(item.rate)}</td>
                    <td class="text-right" style="color: #64748b; font-size: 12px;">
                      ${item.igst > 0 ? `IGST (${item.gstRate}%)<br>${formatCurrency(item.igst)}` : `C+S (${item.gstRate}%)<br>${formatCurrency(item.cgst + item.sgst)}`}
                    </td>
                    <td class="text-right font-semibold">${formatCurrency(item.amount + item.cgst + item.sgst + item.igst)}</td>
                  </tr>
                `).join("");

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
        <html><head><title>Invoice ${safeInvoiceNumber}</title>
        <style>
          @page { size: A4; margin: 20mm; }
          body { font-family: 'Inter', -apple-system, sans-serif; margin: 0; padding: 0; color: #1e293b; background: #fff; }
          .invoice-box { max-width: 800px; margin: auto; padding: 30px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; }
          .header-left h1 { margin: 0 0 5px 0; color: #0f172a; font-size: 28px; }
          .header-left p { margin: 2px 0; color: #64748b; font-size: 14px; }
          .header-right { text-align: right; }
          .header-right h2 { margin: 0 0 10px 0; color: #2563eb; font-size: 32px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
          .invoice-details { background: #f8fafc; padding: 15px; border-radius: 8px; display: inline-block; text-align: left; min-width: 200px; }
          .invoice-details p { margin: 5px 0; font-size: 14px; }
          .invoice-details strong { color: #334155; display: inline-block; width: 80px; }
          .bill-to { margin-bottom: 40px; }
          .bill-to h3 { margin: 0 0 10px 0; color: #64748b; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
          .bill-to p { margin: 4px 0; font-size: 15px; }
          table { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 40px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
          th { background: #f8fafc; color: #475569; font-weight: 600; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; padding: 12px 15px; border-bottom: 1px solid #e2e8f0; }
          td { padding: 12px 15px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
          tr:last-child td { border-bottom: none; }
          .text-right { text-align: right; }
          .text-left { text-align: left; }
          .text-center { text-align: center; }
          .summary { width: 350px; float: right; margin-bottom: 40px; }
          .summary-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #475569; }
          .summary-row.total { font-weight: 700; font-size: 18px; color: #0f172a; border-bottom: none; border-top: 2px solid #e2e8f0; padding-top: 15px; margin-top: 5px; }
          .footer { clear: both; margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; }
          .notes { margin-bottom: 15px; font-size: 13px; line-height: 1.5; }
          .notes strong { color: #334155; display: block; margin-bottom: 4px; }
          .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-bottom: 10px; }
          .badge-paid { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
          .badge-unpaid { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
          .badge-partial { background: #e0e7ff; color: #3730a3; border: 1px solid #c7d2fe; }
          .font-semibold { font-weight: 600; }
        </style></head><body>
          <div class="invoice-box">
            <div class="header">
              <div class="header-left">
                <h1>${safeBusinessName}</h1>
                ${safeBusinessAddress ? `<p>${safeBusinessAddress}</p>` : ''}
                ${safeBusinessPhone ? `<p>Phone: ${safeBusinessPhone}</p>` : ''}
                ${safeBusinessGstin ? `<p>GSTIN: ${safeBusinessGstin}</p>` : ''}
              </div>
              <div class="header-right">
                <h2>INVOICE</h2>
                <div class="invoice-details">
                  <p><strong>Inv No:</strong> ${safeInvoiceNumber}</p>
                  <p><strong>Date:</strong> ${safeInvoiceDate}</p>
                  ${invoice.paymentMode === 'khata' ? '<p><strong>Type:</strong> Khata (Credit)</p>' : ''}
                </div>
              </div>
            </div>

            <div class="bill-to">
              <h3>Billed To</h3>
              <p class="font-semibold" style="font-size: 18px; color: #0f172a;">${safeCustomerName}</p>
              ${safeCustomerAddress ? `<p style="color: #475569;">${safeCustomerAddress}</p>` : ''}
              ${safeCustomerGstin ? `<p style="color: #475569; margin-top: 8px;"><strong>GSTIN:</strong> ${safeCustomerGstin}</p>` : ''}
            </div>

            <table>
              <thead>
                <tr>
                  <th class="text-center" style="width: 5%">#</th>
                  <th class="text-left" style="width: 40%">Item Description</th>
                  <th class="text-right" style="width: 10%">Qty</th>
                  <th class="text-right" style="width: 15%">Rate</th>
                  <th class="text-right" style="width: 15%">GST</th>
                  <th class="text-right" style="width: 15%">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${a4ItemsRows}
              </tbody>
            </table>

            <div class="summary">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>${formatCurrency(itemTotals.subtotal)}</span>
              </div>
              ${hasIgst ? `
                <div class="summary-row">
                  <span>IGST</span>
                  <span>${formatCurrency(itemTotals.igst)}</span>
                </div>
              ` : `
                <div class="summary-row">
                  <span>CGST</span>
                  <span>${formatCurrency(itemTotals.cgst)}</span>
                </div>
                <div class="summary-row">
                  <span>SGST</span>
                  <span>${formatCurrency(itemTotals.sgst)}</span>
                </div>
              `}
              <div class="summary-row total">
                <span>Total Amount</span>
                <span>${formatCurrency(invoice.total)}</span>
              </div>
              
              <div style="text-align: right; margin-top: 15px;">
                ${invoice.paymentStatus === 'paid' ? `<span class="badge badge-paid">Fully Paid</span>` : ''}
                ${invoice.paymentStatus === 'unpaid' ? `<span class="badge badge-unpaid">Unpaid / Khata</span>` : ''}
                ${invoice.paymentStatus === 'partial' ? `<span class="badge badge-partial">Partially Paid (${formatCurrency(invoice.amountPaid)})</span>` : ''}
              </div>
            </div>

            <div class="footer">
              ${safeInvoiceNotes ? `
                <div class="notes">
                  <strong>Notes:</strong>
                  ${safeInvoiceNotes}
                </div>
              ` : ''}
              ${safeTerms ? `
                <div class="notes">
                  <strong>Terms & Conditions:</strong>
                  ${safeTerms}
                </div>
              ` : ''}
              <div style="text-align: right; margin-top: 50px;">
                <p style="margin: 0; font-weight: 600; color: #000;">For ${safeBusinessName}</p>
                <div style="margin-top: 40px; border-top: 1px solid #94a3b8; width: 150px; display: inline-block;"></div>
                <p style="margin: 5px 0 0 0; color: #64748b; font-size: 11px;">Authorized Signatory</p>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body></html>
      `);
            printWindow.document.close();
        }
    };

    return (
        <div className="glass-overlay">
            <div className="glass-card glass-modal-panel w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-4 sm:p-5 md:p-6 border-b border-[var(--border)]/50">
                    <h2 className="text-lg font-semibold text-[var(--foreground)]">Invoice</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-[var(--foreground)]/5 p-1 rounded-lg">
                            <button
                                onClick={() => onFormatChange("a4")}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${printFormat === "a4" ? "bg-[var(--color-primary)] text-white shadow-sm" : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"}`}
                            >
                                A4 Size
                            </button>
                            <button
                                onClick={() => onFormatChange("thermal")}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${printFormat === "thermal" ? "bg-[var(--color-primary)] text-white shadow-sm" : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"}`}
                            >
                                80mm Thermal
                            </button>
                        </div>
                        <button
                            onClick={() => {
                                if (printFormat === "thermal") {
                                    handlePrintThermal();
                                } else {
                                    handlePrintA4();
                                }
                            }}
                            className="glass-btn-primary flex items-center gap-2 py-2 px-4"
                        >
                            <Printer size={16} /> Print
                        </button>
                        <button onClick={onClose} className="p-1.5 hover:bg-[var(--foreground)]/5 rounded-lg transition-colors">
                            <X size={20} className="text-[var(--foreground)]/60" />
                        </button>
                    </div>
                </div>

                {/* View content section (same for both formats, just a visual preview) */}
                <div className="p-4 sm:p-5 md:p-8 bg-white dark:bg-slate-900 overflow-x-auto min-h-[400px]">
                    {printFormat === 'a4' ? (
                        <div className="max-w-[800px] mx-auto min-w-[600px]">
                            <div className="flex justify-between items-start mb-10 pb-6 border-b-2 border-slate-100 dark:border-slate-800">
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{businessProfile.name}</h1>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">{businessProfile.address}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Phone: {businessProfile.phone}</p>
                                    {businessProfile.gstin && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">GSTIN: {businessProfile.gstin}</p>}
                                </div>
                                <div className="text-right">
                                    <h2 className="text-3xl font-extrabold text-blue-600 dark:text-blue-500 uppercase tracking-wider mb-4">INVOICE</h2>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg inline-block text-left border border-slate-100 dark:border-slate-700">
                                        <p className="text-sm mb-1"><strong className="text-slate-700 dark:text-slate-300 inline-block w-20">Inv No:</strong> <span className="text-slate-900 dark:text-white font-medium">{invoice.invoiceNumber}</span></p>
                                        <p className="text-sm"><strong className="text-slate-700 dark:text-slate-300 inline-block w-20">Date:</strong> <span className="text-slate-900 dark:text-white font-medium">{formatReceiptDate(invoice.invoiceDate)}</span></p>
                                        {invoice.paymentMode === 'khata' && (
                                            <p className="text-sm mt-1 text-orange-600 dark:text-orange-400 font-medium">Khata (Credit) Payment</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 inline-block min-w-[300px]">
                                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Billed To</h3>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{invoice.customerName}</p>
                                {invoice.customerAddress && <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 whitespace-pre-line">{invoice.customerAddress}</p>}
                                {invoice.customerGstin && <p className="text-sm text-slate-600 dark:text-slate-400 mt-2"><strong>GSTIN:</strong> {invoice.customerGstin}</p>}
                            </div>

                            <table className="w-full mb-8 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                <thead className="bg-slate-50 dark:bg-slate-800">
                                    <tr>
                                        <th className="py-3 px-4 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 w-12 text-center">#</th>
                                        <th className="py-3 px-4 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">Item Description</th>
                                        <th className="py-3 px-4 text-right text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 w-20">Qty</th>
                                        <th className="py-3 px-4 text-right text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 w-28">Rate</th>
                                        <th className="py-3 px-4 text-right text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 w-32">GST</th>
                                        <th className="py-3 px-4 text-right text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 w-32">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {invoiceItems.map((item, i) => (
                                        <tr key={i}>
                                            <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400 text-center">{i + 1}</td>
                                            <td className="py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white">{item.productName}</td>
                                            <td className="py-3 px-4 text-sm text-right text-slate-700 dark:text-slate-300">{item.quantity}</td>
                                            <td className="py-3 px-4 text-sm text-right text-slate-700 dark:text-slate-300">{formatCurrency(item.rate)}</td>
                                            <td className="py-3 px-4 text-xs text-right text-slate-500 dark:text-slate-400">
                                                {item.igst > 0 ? (
                                                    <>IGST ({item.gstRate}%)<br />{formatCurrency(item.igst)}</>
                                                ) : (
                                                    <>C+S ({item.gstRate}%)<br />{formatCurrency(item.cgst + item.sgst)}</>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-right font-bold text-slate-900 dark:text-white">{formatCurrency(item.amount + item.cgst + item.sgst + item.igst)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex justify-end mb-12">
                                <div className="w-80">
                                    <div className="flex justify-between py-2 text-sm text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                        <span>Subtotal</span>
                                        <span className="font-medium text-slate-900 dark:text-slate-300">₹{itemTotals.subtotal.toFixed(2)}</span>
                                    </div>
                                    {hasIgst ? (
                                        <div className="flex justify-between py-2 text-sm text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                            <span>IGST</span>
                                            <span className="font-medium text-slate-900 dark:text-slate-300">₹{itemTotals.igst.toFixed(2)}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex justify-between py-2 text-sm text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                                <span>CGST</span>
                                                <span className="font-medium text-slate-900 dark:text-slate-300">₹{itemTotals.cgst.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between py-2 text-sm text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                                                <span>SGST</span>
                                                <span className="font-medium text-slate-900 dark:text-slate-300">₹{itemTotals.sgst.toFixed(2)}</span>
                                            </div>
                                        </>
                                    )}
                                    <div className="flex justify-between py-4 text-lg font-bold text-slate-900 dark:text-white border-t-2 border-slate-200 dark:border-slate-700 mt-2">
                                        <span>Total Amount</span>
                                        <span className="text-blue-600 dark:text-blue-500">₹{(invoice.total ?? 0).toFixed(2)}</span>
                                    </div>
                                    <div className="text-right mt-2">
                                        {invoice.paymentStatus === 'paid' && (
                                            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold uppercase tracking-wider rounded border border-green-200 dark:border-green-800/50">Fully Paid</span>
                                        )}
                                        {invoice.paymentStatus === 'unpaid' && (
                                            <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs font-bold uppercase tracking-wider rounded border border-yellow-200 dark:border-yellow-800/50">Unpaid / Khata</span>
                                        )}
                                        {invoice.paymentStatus === 'partial' && (
                                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold uppercase tracking-wider rounded border border-blue-200 dark:border-blue-800/50">Partially Paid (₹{safeAmountPaid})</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 flex justify-between items-end">
                                <div className="max-w-[60%]">
                                    {invoice.notes && (
                                        <div className="mb-4">
                                            <strong className="block text-slate-900 dark:text-slate-300 font-bold mb-1">Notes:</strong>
                                            <p className="whitespace-pre-line bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-100 dark:border-slate-700">{invoice.notes}</p>
                                        </div>
                                    )}
                                    {businessProfile.termsAndConditions && (
                                        <div>
                                            <strong className="block text-slate-900 dark:text-slate-300 font-bold mb-1">Terms & Conditions:</strong>
                                            <p className="whitespace-pre-line text-xs">{businessProfile.termsAndConditions}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="text-right pb-4">
                                    <p className="font-bold text-slate-900 dark:text-slate-300 mb-12">For {businessProfile.name}</p>
                                    <div className="w-40 border-t border-slate-400 dark:border-slate-600 inline-block"></div>
                                    <p className="text-xs mt-2">Authorized Signatory</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-[320px] mx-auto bg-white dark:bg-slate-50 border border-slate-200 dark:border-slate-300 p-6 font-mono text-sm text-black shadow-lg">
                            <div className="text-center mb-6">
                                <h2 className="font-bold text-xl mb-1">{businessProfile.name}</h2>
                                {businessProfile.address && <div className="text-xs mb-1 whitespace-pre-line leading-tight">{businessProfile.address}</div>}
                                {businessProfile.phone && <div className="text-xs">Ph: {businessProfile.phone}</div>}
                                {businessProfile.gstin && <div className="text-xs">GSTIN: {businessProfile.gstin}</div>}
                            </div>

                            <div className="border-b-2 border-dashed border-slate-300 pb-3 mb-3 text-xs leading-loose">
                                <div><span className="font-bold inline-block w-16">Date:</span> {formatDate(invoice.invoiceDate)}</div>
                                <div><span className="font-bold inline-block w-16">Inv No:</span> {invoice.invoiceNumber}</div>
                                <div><span className="font-bold inline-block w-16">To:</span> {invoice.customerName}</div>
                            </div>

                            <table className="w-full mb-3 text-xs">
                                <thead>
                                    <tr className="border-b-2 border-dashed border-slate-300">
                                        <th className="py-2 text-left font-bold">Item</th>
                                        <th className="py-2 text-right font-bold w-12">Qty</th>
                                        <th className="py-2 text-right font-bold w-16">Rate</th>
                                        <th className="py-2 text-right font-bold w-20">Amt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceItems.map((item, i) => (
                                        <React.Fragment key={i}>
                                            <tr>
                                                <td colSpan={4} className="pt-2 font-bold">{item.productName}</td>
                                            </tr>
                                            <tr>
                                                <td></td>
                                                <td className="text-right">{item.quantity}</td>
                                                <td className="text-right">{item.rate.toFixed(2)}</td>
                                                <td className="text-right">{item.amount.toFixed(2)}</td>
                                            </tr>
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>

                            <div className="border-t-2 border-dashed border-slate-300 pt-3 text-xs">
                                <div className="flex justify-between mb-1">
                                    <span>Subtotal:</span>
                                    <span>{itemTotals.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between mb-2 pb-2 border-b border-dashed border-slate-200">
                                    <span>GST:</span>
                                    <span>{(itemTotals.cgst + itemTotals.sgst + itemTotals.igst).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-sm mb-4">
                                    <span>Total:</span>
                                    <span>Rs. {(invoice.total ?? 0).toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="text-center pt-4 border-t-2 border-dashed border-slate-300 text-xs">
                                <div className="font-bold mb-1">*** Thank You ***</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
