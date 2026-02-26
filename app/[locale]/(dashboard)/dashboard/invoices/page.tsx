"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "@/i18n/routing";
import { getProducts } from "@/lib/actions/products";
import { getCustomers } from "@/lib/actions/customers";
import { getInvoices, createInvoice, cancelInvoice } from "@/lib/actions/invoices";
import { getBusinessProfile } from "@/lib/actions/business";
import { ConfirmDialog, SkeletonTable } from "@/lib/components/ui";
import { useTranslations, useLocale } from "next-intl";
import { Plus, Search, X, Trash2, Printer, MessageCircle } from "lucide-react";
import { StaggerContainer, StaggerItem, FadeIn } from "@/lib/components/MotionWrapper";
import { NewInvoiceModal } from "./components/NewInvoiceModal";
import { InvoicePrintModal } from "./components/InvoicePrintModal";

interface Product {
  id: string;
  name: string;
  rate: number;
  gstRate: number | null;
  stockQuantity: number | null;
  unit: string | null;
  isActive: boolean | null;
}

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  gstin: string | null;
  address: string | null;
}

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

export default function InvoicesPage() {
  const t = useTranslations('Invoices');
  const locale = useLocale();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [isInterState, setIsInterState] = useState(false);
  const [printFormat, setPrintFormat] = useState<"a4" | "thermal">("a4");

  const [formData, setFormData] = useState({
    customerId: "",
    customerName: "",
    customerGstin: "",
    customerAddress: "",
    invoiceDate: new Date().toISOString().split('T')[0],
    notes: "",
    paymentMode: "cash" as "cash" | "upi" | "khata",
  });

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [productsResult, customersResult, invoicesResult, businessResult] = await Promise.all([
      getProducts(),
      getCustomers(),
      getInvoices(),
      getBusinessProfile(),
    ]);
    if (productsResult.success) setProducts(productsResult.products);
    if (customersResult.success) setCustomers(customersResult.customers);
    if (invoicesResult.success) setInvoices(invoicesResult.invoices.map(inv => ({
      ...inv,
      invoiceDate: new Date(inv.invoiceDate)
    })));
    if (businessResult.success && businessResult.business) {
      setBusinessProfile({
        name: businessResult.business.name || "",
        gstin: businessResult.business.gstin || null,
        address: businessResult.business.address || null,
        phone: businessResult.business.phone || null,
        state: businessResult.business.state || "",
        pincode: businessResult.business.pincode || null,
        termsAndConditions: businessResult.business.termsAndConditions || null,
      });
    }
    setLoading(false);
  };


  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setFormData({
        ...formData,
        customerId,
        customerName: customer.name,
        customerGstin: customer.gstin || "",
        customerAddress: customer.address || "",
      });
    } else {
      setFormData({ ...formData, customerId, customerName: "", customerGstin: "", customerAddress: "" });
    }
  };

  const handleCreateSubmit = async (formDataPayload: any, itemsPayload: InvoiceItem[], isInterStatePayload: boolean) => {
    if (itemsPayload.length === 0) {
      setError("Add at least one item");
      return;
    }
    if (!formDataPayload.customerName) {
      setError("Customer name is required");
      return;
    }

    setError("");
    setSaving(true);

    const result = await createInvoice({
      ...formDataPayload,
      customerId: formDataPayload.customerId || undefined,
      customerGstin: formDataPayload.customerGstin || undefined,
      customerAddress: formDataPayload.customerAddress || undefined,
      notes: formDataPayload.notes || undefined,
      items: itemsPayload,
      isInterState: isInterStatePayload,
    });

    if (result.error) {
      if ((result as any).redirectToSettings) {
        setError(result.error);
        if (confirm(result.error + " Go to Settings now?")) {
          router.push("/dashboard/settings");
        }
      } else {
        setError(result.error);
      }
    } else {
      setShowNewInvoice(false);
      loadData();
      router.refresh();
    }
    setSaving(false);
  };

  const handleCancelInvoice = async () => {
    if (!cancelId) return;
    setCancelling(true);
    const result = await cancelInvoice(cancelId);
    if (result.success) {
      loadData();
      router.refresh();
    }
    setCancelling(false);
    setCancelId(null);
  };

  const handleWhatsAppShare = (invoice: Invoice, customerPhone: string | null) => {
    let message = "";
    const amount = (invoice.total ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

    if (locale === 'hi') {
      message = `*${businessProfile?.name}*\n\nनमस्ते ${invoice.customerName},\nआपका बिल (नंबर: ${invoice.invoiceNumber}) तैयार है।\n*कुल राशि: ₹${amount}*\n\nधन्यवाद!`;
    } else if (locale === 'hi-en') {
      message = `*${businessProfile?.name}*\n\nNamaste ${invoice.customerName},\nAapka invoice (No: ${invoice.invoiceNumber}) tayar hai.\n*Total Amount: ₹${amount}*\n\nDhanyawad!`;
    } else {
      message = `*${businessProfile?.name}*\n\nHello ${invoice.customerName},\nYour invoice (No: ${invoice.invoiceNumber}) is ready.\n*Total Amount: ₹${amount}*\n\nThank you!`;
    }

    const encodedMessage = encodeURIComponent(message);
    let url = `https://wa.me/`;
    if (customerPhone) {
      // Basic sanitization
      const cleanPhone = customerPhone.replace(/\D/g, '');
      url += `${cleanPhone}?text=${encodedMessage}`;
    } else {
      url += `?text=${encodedMessage}`;
    }

    window.open(url, '_blank');
  };


  const filteredInvoices = invoices.filter(inv =>
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    inv.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <StaggerContainer className="space-y-4 sm:space-y-6">
      <FadeIn className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">{t('title')}</h1>
          <p className="text-[var(--foreground)]/60 mt-1 text-sm">{t('subtitle')}</p>
        </div>
        <button
          onClick={() => { setError(""); setShowNewInvoice(true); }}
          className="glass-btn-primary flex items-center gap-2 min-h-[44px] px-4 sm:px-6"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">{t('newInvoice')}</span>
          <span className="sm:hidden">New</span>
        </button>
      </FadeIn>

      <StaggerItem className="glass-card overflow-hidden">
        <div className="p-3 sm:p-4 md:p-6 border-b border-[var(--border)]/50">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-[var(--color-primary)]/60 pointer-events-none" size={18} />
            <input
              type="text"
              placeholder={t('searchInvoices')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-4 py-3 glass-input text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 font-medium focus:ring-0"
              style={{ paddingLeft: '2.75rem' }}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-4"><SkeletonTable rows={5} /></div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-[var(--foreground)]/50 font-medium">{t('noInvoices')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-[var(--foreground)]/5 border-b border-[var(--border)]/30">
                <tr>
                  <th className="px-3 sm:px-5 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-[var(--foreground)]/70">{t('thInvoice')}</th>
                  <th className="px-3 sm:px-5 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-[var(--foreground)]/70">{t('thDate')}</th>
                  <th className="px-3 sm:px-5 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-[var(--foreground)]/70">{t('thCustomer')}</th>
                  <th className="px-3 sm:px-5 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-[var(--foreground)]/70">{t('thAmount')}</th>
                  <th className="px-3 sm:px-5 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-[var(--foreground)]/70">{t('thStatus')}</th>
                  <th className="px-3 sm:px-5 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-[var(--foreground)]/70">{t('thActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/30">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-[var(--foreground)]/[0.02] transition-colors">
                    <td className="px-3 sm:px-5 py-3 sm:py-4 font-medium text-[var(--foreground)] text-sm">{invoice.invoiceNumber}</td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4 text-[var(--foreground)]/70 text-xs sm:text-sm">{invoice.invoiceDate.toLocaleDateString('en-IN')}</td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4 text-[var(--foreground)] font-medium text-sm">{invoice.customerName}</td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4 font-semibold text-[var(--foreground)]">₹{(invoice.total ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4">
                      {invoice.status === 'cancelled' ? (
                        <span className="px-2 sm:px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/20">
                          {t('statusCancelled')}
                        </span>
                      ) : invoice.paymentStatus === 'unpaid' ? (
                        <span className="px-2 sm:px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/20">
                          {t('statusUnpaid')}
                        </span>
                      ) : invoice.paymentStatus === 'partial' ? (
                        <div className="flex flex-col gap-1 items-start">
                          <span className="px-2 sm:px-2.5 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                            {t('statusPartial')}
                          </span>
                          <span className="text-[10px] text-[var(--foreground)]/50 font-medium px-1">
                            ₹{(invoice.amountPaid ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })} paid
                          </span>
                        </div>
                      ) : (
                        <span className="px-2 sm:px-2.5 py-1 text-xs font-medium rounded-full bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20">
                          {t('statusPaid')}
                        </span>
                      )}
                    </td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4">
                      <div className="flex items-center gap-1" style={{ opacity: 1 }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const customer = customers.find(c => c.name === invoice.customerName);
                            handleWhatsAppShare(invoice, customer?.phone || null);
                          }}
                          className="p-1.5 sm:p-2 text-[var(--foreground)]/40 hover:text-[#25D366] hover:bg-[#25D366]/10 rounded-lg transition-colors"
                          aria-label="Share via WhatsApp"
                          title="Share via WhatsApp"
                        >
                          <MessageCircle size={16} />
                        </button>
                        <button
                          onClick={() => setViewInvoice(invoice)}
                          className="p-1.5 sm:p-2 text-[var(--foreground)]/40 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors"
                          aria-label="View invoice"
                        >
                          <Printer size={16} />
                        </button>
                        {invoice.status === 'active' && (
                          <button
                            onClick={() => setCancelId(invoice.id)}
                            className="p-1.5 sm:p-2 text-[var(--foreground)]/40 hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 rounded-lg transition-colors"
                            aria-label="Cancel invoice"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </StaggerItem>

      {showNewInvoice && (
        <NewInvoiceModal
          onClose={() => setShowNewInvoice(false)}
          onSubmit={handleCreateSubmit}
          customers={customers}
          products={products}
          saving={saving}
          error={error}
        />
      )}

      <ConfirmDialog
        open={!!cancelId}
        title="Cancel Invoice"
        message="Are you sure you want to cancel this invoice? This will restore the stock and adjust the customer's balance."
        onConfirm={handleCancelInvoice}
        onCancel={() => setCancelId(null)}
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
