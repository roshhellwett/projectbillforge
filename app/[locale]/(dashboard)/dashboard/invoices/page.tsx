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

  const addItem = () => {
    if (!selectedProduct) return;
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const qty = parseFloat(itemQuantity) || 1;
    const amount = product.rate * qty;
    const gstRate = product.gstRate ?? 0;
    const gstAmount = amount * (gstRate / 100);

    let cgst = 0, sgst = 0, igst = 0;
    if (isInterState) {
      igst = gstAmount;
    } else {
      cgst = gstAmount / 2;
      sgst = gstAmount / 2;
    }

    const newItem: InvoiceItem = {
      productId: product.id,
      productName: product.name,
      quantity: qty,
      rate: product.rate,
      gstRate: gstRate,
      amount,
      cgst,
      sgst,
      igst,
    };

    setItems([...items, newItem]);
    setSelectedProduct("");
    setItemQuantity("");
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Recalculate GST for all items when inter-state toggle changes
  const handleInterStateToggle = (checked: boolean) => {
    setIsInterState(checked);
    setItems(prevItems => prevItems.map(item => {
      const gstAmount = item.amount * (item.gstRate / 100);
      if (checked) {
        return { ...item, cgst: 0, sgst: 0, igst: gstAmount };
      } else {
        return { ...item, cgst: gstAmount / 2, sgst: gstAmount / 2, igst: 0 };
      }
    }));
  };

  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => ({
        subtotal: acc.subtotal + item.amount,
        cgst: acc.cgst + item.cgst,
        sgst: acc.sgst + item.sgst,
        igst: acc.igst + item.igst,
      }),
      { subtotal: 0, cgst: 0, sgst: 0, igst: 0 }
    );
  }, [items]);

  const grandTotal = totals.subtotal + totals.cgst + totals.sgst + totals.igst;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError("Add at least one item");
      return;
    }
    if (!formData.customerName) {
      setError("Customer name is required");
      return;
    }

    setError("");
    setSaving(true);

    const result = await createInvoice({
      customerId: formData.customerId || undefined,
      customerName: formData.customerName,
      customerGstin: formData.customerGstin || undefined,
      customerAddress: formData.customerAddress || undefined,
      invoiceDate: formData.invoiceDate,
      items,
      notes: formData.notes || undefined,
      isInterState,
      paymentMode: formData.paymentMode,
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
      resetForm();
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

  const resetForm = () => {
    setFormData({
      customerId: "",
      customerName: "",
      customerGstin: "",
      customerAddress: "",
      invoiceDate: new Date().toISOString().split('T')[0],
      notes: "",
      paymentMode: "cash",
    });
    setItems([]);
    setIsInterState(false);
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
        <div className="glass-overlay">
          <div className="glass-card glass-modal-panel w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-5 md:p-6 border-b border-[var(--border)]/50">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">{t('newInvoice')}</h2>
              <button onClick={() => setShowNewInvoice(false)} className="p-1.5 hover:bg-[var(--foreground)]/5 rounded-lg transition-colors" aria-label="Close">
                <X size={20} className="text-[var(--foreground)]/60" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
              {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">Customer</label>
                  <select
                    value={formData.customerId}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                    className="w-full glass-input"
                  >
                    <option value="">Select Customer (Optional)</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">{t('customerName')}</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full glass-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={formData.customerGstin}
                    onChange={(e) => setFormData({ ...formData, customerGstin: e.target.value })}
                    className="w-full glass-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">{t('invoiceDate')}</label>
                  <input
                    type="date"
                    required
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                    className="w-full glass-input"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <input
                  type="checkbox"
                  id="isInterState"
                  checked={isInterState}
                  onChange={(e) => handleInterStateToggle(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="isInterState" className="text-sm text-[var(--foreground)]/70">Inter-State (IGST instead of CGST+SGST)</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-2">{t('paymentMode')}</label>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMode"
                      value="cash"
                      checked={formData.paymentMode === 'cash'}
                      onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as "cash" })}
                      className="w-4 h-4 text-[var(--color-primary)] bg-[var(--background)] border border-[var(--border)] focus:ring-[var(--color-primary)]"
                    />
                    <span className="text-sm text-[var(--foreground)]/70">{t('cash')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMode"
                      value="upi"
                      checked={formData.paymentMode === 'upi'}
                      onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as "upi" })}
                      className="w-4 h-4 text-[var(--color-primary)] bg-[var(--background)] border border-[var(--border)] focus:ring-[var(--color-primary)]"
                    />
                    <span className="text-sm text-[var(--foreground)]/70">{t('upi')}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMode"
                      value="khata"
                      checked={formData.paymentMode === 'khata'}
                      onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as "khata" })}
                      className="w-4 h-4 text-[var(--color-primary)] bg-[var(--background)] border border-[var(--border)] focus:ring-[var(--color-primary)]"
                    />
                    <span className="text-sm text-[var(--foreground)]/70">{t('khataCredit')}</span>
                  </label>
                </div>
              </div>

              <div className="border border-[var(--border)] rounded-xl p-3 sm:p-4">
                <h3 className="font-semibold text-[var(--foreground)] mb-3 sm:mb-4">{t('items')}</h3>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 mb-3 sm:mb-4">
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="flex-1 glass-input min-h-[44px]"
                  >
                    <option value="">{t('selectProduct')}</option>
                    {products.filter(p => p.isActive).map(p => (
                      <option key={p.id} value={p.id}>{p.name} - ₹{p.rate} ({p.gstRate}% GST)</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard/products')}
                    className="px-3 py-2 border border-[var(--border)] text-[var(--foreground)]/60 rounded-xl hover:bg-[var(--foreground)]/5 text-sm min-h-[44px]"
                    title="Add new product"
                  >
                    + New
                  </button>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(e.target.value)}
                      className="w-20 sm:w-24 glass-input min-h-[44px]"
                      placeholder="0"
                    />
                    {selectedProduct && products.find(p => p.id === selectedProduct)?.unit && (
                      <span className="absolute right-3 text-xs text-[var(--foreground)]/40 pointer-events-none">
                        {products.find(p => p.id === selectedProduct)?.unit}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={addItem}
                    className="px-4 py-2 glass-btn-primary rounded-xl min-h-[44px]"
                  >
                    {t('add')}
                  </button>
                </div>

                {items.length > 0 ? (
                  <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                    <table className="w-full text-xs sm:text-sm min-w-[500px]">
                      <thead className="bg-[var(--foreground)]/[0.03] border-b border-[var(--border)]/30 rounded-t-lg">
                        <tr>
                          <th className="px-2 sm:px-3 py-2 text-left">Item</th>
                          <th className="px-2 sm:px-3 py-2 text-right">Qty</th>
                          <th className="px-2 sm:px-3 py-2 text-right">Rate</th>
                          <th className="px-2 sm:px-3 py-2 text-right">Amount</th>
                          <th className="px-2 sm:px-3 py-2 text-right">GST</th>
                          <th className="px-2 sm:px-3 py-2 text-right">Total</th>
                          <th className="px-2 sm:px-3 py-2"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-2 sm:px-3 py-2">{item.productName}</td>
                            <td className="px-2 sm:px-3 py-2 text-right">{item.quantity}</td>
                            <td className="px-2 sm:px-3 py-2 text-right">₹{item.rate.toFixed(2)}</td>
                            <td className="px-2 sm:px-3 py-2 text-right">₹{item.amount.toFixed(2)}</td>
                            <td className="px-2 sm:px-3 py-2 text-right">
                              {isInterState
                                ? `IGST ₹${item.igst.toFixed(2)}`
                                : `C ₹${item.cgst.toFixed(2)} S ₹${item.sgst.toFixed(2)}`
                              }
                            </td>
                            <td className="px-2 sm:px-3 py-2 text-right font-medium">
                              ₹{(item.amount + item.cgst + item.sgst + item.igst).toFixed(2)}
                            </td>
                            <td className="px-2 sm:px-3 py-2">
                              <button type="button" onClick={() => removeItem(idx)} className="text-[var(--color-danger)]/80 hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 p-1.5 rounded-lg transition-colors">
                                <X size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-[var(--foreground)]/50 py-4">No items added</p>
                )}
              </div>

              <div className="flex justify-end">
                <div className="w-full sm:w-64 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--foreground)]/60">{t('subtotal')}</span>
                    <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--foreground)]/60">CGST:</span>
                    <span className="font-medium">₹{totals.cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--foreground)]/60">SGST:</span>
                    <span className="font-medium">₹{totals.sgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--foreground)]/60">IGST:</span>
                    <span className="font-medium">₹{totals.igst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>{t('total')}</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">{t('notes')}</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full glass-input"
                  placeholder="Optional notes..."
                />
              </div>

              <div className="flex gap-3 pt-2 sm:pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewInvoice(false)}
                  className="glass-btn-secondary flex-1 min-h-[44px]"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving || items.length === 0}
                  className="glass-btn-primary flex-1 min-h-[44px]"
                >
                  {saving ? t('creating') : t('createInvoice')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!cancelId}
        title="Cancel Invoice"
        message="Are you sure you want to cancel this invoice? This will restore the stock and adjust the customer's balance."
        onConfirm={handleCancelInvoice}
        onCancel={() => setCancelId(null)}
      />

      {viewInvoice && businessProfile && (
        <div className="glass-overlay">
          <div className="glass-card glass-modal-panel w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-5 md:p-6 border-b border-[var(--border)]/50">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Invoice</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-[var(--foreground)]/5 p-1 rounded-lg">
                  <button
                    onClick={() => setPrintFormat("a4")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${printFormat === "a4" ? "bg-[var(--color-primary)] text-white shadow-sm" : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"}`}
                  >
                    A4 Size
                  </button>
                  <button
                    onClick={() => setPrintFormat("thermal")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${printFormat === "thermal" ? "bg-[var(--color-primary)] text-white shadow-sm" : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"}`}
                  >
                    80mm Thermal
                  </button>
                </div>
                <button
                  onClick={() => {
                    if (printFormat === "thermal") {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <html><head><title>Receipt ${viewInvoice.invoiceNumber}</title>
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
                              <h2 class="font-bold" style="font-size: 16px; margin: 0 0 4px 0;">${businessProfile.name}</h2>
                              ${businessProfile.address ? `<div>${businessProfile.address}</div>` : ''}
                              ${businessProfile.phone ? `<div>Ph: ${businessProfile.phone}</div>` : ''}
                              ${businessProfile.gstin ? `<div>GSTIN: ${businessProfile.gstin}</div>` : ''}
                            </div>
                            
                            <div class="border-b">
                              <div><span class="font-bold">Date:</span> ${viewInvoice.invoiceDate.toLocaleDateString('en-IN')}</div>
                              <div><span class="font-bold">Inv No:</span> ${viewInvoice.invoiceNumber}</div>
                              <div><span class="font-bold">To:</span> ${viewInvoice.customerName}</div>
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
                                ${viewInvoice.items?.map(item => `
                                  <tr>
                                    <td colspan="4" class="font-bold pb-0">${item.productName}</td>
                                  </tr>
                                  <tr>
                                    <td></td>
                                    <td class="text-right">${item.quantity}</td>
                                    <td class="text-right">${item.rate.toFixed(2)}</td>
                                    <td class="text-right">${item.amount.toFixed(2)}</td>
                                  </tr>
                                `).join('')}
                              </tbody>
                            </table>

                            <div class="border-t">
                              <div class="grid-2">
                                <div>Subtotal:</div>
                                <div class="text-right">${viewInvoice.items?.reduce((s, i) => s + i.amount, 0).toFixed(2)}</div>
                              </div>
                              <div class="grid-2">
                                <div>GST:</div>
                                <div class="text-right">${viewInvoice.items?.reduce((s, i) => s + i.cgst + i.sgst + i.igst, 0).toFixed(2)}</div>
                              </div>
                              <div class="grid-2 font-bold mt-2" style="font-size: 14px;">
                                <div>Total:</div>
                                <div class="text-right">Rs. ${(viewInvoice.total ?? 0).toFixed(2)}</div>
                              </div>
                            </div>

                            <div class="text-center mt-4 pt-4 border-t">
                              <div class="mb-2">*** Thank You ***</div>
                              ${businessProfile.termsAndConditions ? `<div style="font-size: 10px; margin-top: 10px; border-top: 1px dotted #ccc; padding-top: 10px;">T&C: ${businessProfile.termsAndConditions.substring(0, 100)}...</div>` : ''}
                              <div style="font-size: 9px; margin-top: 10px;">Generated by BillForge</div>
                            </div>
                          </body></html>
                        `);
                        printWindow.document.close();
                        // Small delay to ensure CSS loads
                        setTimeout(() => printWindow.print(), 200);
                      }
                    } else {
                      const printContent = document.getElementById('invoice-print');
                      if (printContent) {
                        const printWindow = window.open('', '_blank');
                        if (printWindow) {
                          printWindow.document.write(`
                            <html><head><title>Invoice ${viewInvoice.invoiceNumber}</title>
                            <style>
                              body { font-family: Arial, sans-serif; margin: 20px; }
                              table { width: 100%; border-collapse: collapse; }
                              th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                              th { background: #f8f9fa; color: #333; }
                              .text-right { text-align: right; }
                              .text-center { text-align: center; }
                              .font-bold { font-weight: bold; }
                              .font-medium { font-weight: 500; }
                              .mb-6 { margin-bottom: 24px; }
                              .mt-4 { margin-top: 16px; }
                              .pt-4 { padding-top: 16px; }
                              .pb-4 { padding-bottom: 16px; }
                              .border-b { border-bottom: 2px solid #333; }
                              .border-t { border-top: 1px solid #ccc; }
                            </style></head><body>
                            ${printContent.outerHTML}
                            </body></html>
                          `);
                          printWindow.document.close();
                          setTimeout(() => printWindow.print(), 200);
                        }
                      }
                    }
                  }}
                  className="glass-btn-primary flex items-center gap-2 text-sm min-h-[40px]"
                >
                  <Printer size={16} />
                  Print
                </button>
                <button onClick={() => setViewInvoice(null)} className="p-1.5 hover:bg-[var(--foreground)]/5 rounded-lg transition-colors" aria-label="Close">
                  <X size={20} className="text-[var(--foreground)]/60" />
                </button>
              </div>
            </div>

            <div className={`p-4 sm:p-6 md:p-8 ${printFormat === 'thermal' ? 'bg-[#fdfdfd] text-black font-mono w-[380px] mx-auto border border-dashed border-gray-300 my-8 shadow-sm' : ''}`} id="invoice-print" style={printFormat === 'thermal' ? { fontFamily: "'Courier New', Courier, monospace" } : { fontFamily: 'Arial, sans-serif' }}>
              {printFormat === "thermal" ? (
                // 80mm Thermal Preview Layout
                <div className="text-[12px] leading-tight text-center">
                  <h2 className="font-bold text-[16px] mb-1">{businessProfile.name}</h2>
                  {businessProfile.address && <div className="mb-1">{businessProfile.address}</div>}
                  {businessProfile.phone && <div className="mb-1">Ph: {businessProfile.phone}</div>}
                  {businessProfile.gstin && <div className="mb-2">GSTIN: {businessProfile.gstin}</div>}

                  <div className="border-b border-t border-dashed border-black py-2 my-2 text-left">
                    <div><span className="font-bold">Date:</span> {viewInvoice.invoiceDate.toLocaleDateString('en-IN')}</div>
                    <div><span className="font-bold">Inv No:</span> {viewInvoice.invoiceNumber}</div>
                    <div><span className="font-bold">To:</span> {viewInvoice.customerName}</div>
                  </div>

                  <table className="w-full mb-3 text-left">
                    <thead>
                      <tr className="border-b border-dashed border-black">
                        <th className="py-1">Item</th>
                        <th className="py-1 text-right">Qty</th>
                        <th className="py-1 text-right">Rate</th>
                        <th className="py-1 text-right">Amt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewInvoice.items?.map((item, idx) => (
                        <React.Fragment key={idx}>
                          <tr>
                            <td colSpan={4} className="font-bold pt-1 pb-0 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">{item.productName}</td>
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

                  <div className="border-t border-dashed border-black pt-2 text-left">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{viewInvoice.items?.reduce((s, i) => s + i.amount, 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST:</span>
                      <span>{viewInvoice.items?.reduce((s, i) => s + i.cgst + i.sgst + i.igst, 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-[14px] mt-2 mb-4">
                      <span>Total:</span>
                      <span>Rs. {(viewInvoice.total ?? 0).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-black pt-4 pb-4">
                    <div className="font-bold mb-2">*** Thank You ***</div>
                    <div className="text-[9px] mt-4 opacity-70">Generated by BillForge</div>
                  </div>
                </div>
              ) : (
                // A4 Preview Layout
                <>
                  {/* Header */}
                  <div className="border-b-2 border-[var(--foreground)] pb-4 mb-6">
                    <div className="text-center">
                      <h1 className="text-3xl font-bold text-[var(--foreground)] uppercase tracking-wide">{businessProfile.name}</h1>
                      <p className="text-[var(--foreground)]/60 mt-1">
                        {businessProfile.address}
                        {businessProfile.state && `, ${businessProfile.state}`}
                        {businessProfile.pincode && ` - ${businessProfile.pincode}`}
                      </p>
                      <p className="text-[var(--foreground)]/60">
                        {businessProfile.phone && <span>Ph: {businessProfile.phone}</span>}
                        {businessProfile.phone && businessProfile.gstin && <span> | </span>}
                        {businessProfile.gstin && <span>GSTIN: {businessProfile.gstin}</span>}
                      </p>
                    </div>
                  </div>

                  {/* Document Title */}
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-[var(--foreground)] uppercase">
                      {businessProfile.gstin ? 'Tax Invoice' : 'Invoice'}
                    </h2>
                    <p className="text-[var(--foreground)]/60 mt-1">Invoice No: {viewInvoice.invoiceNumber}</p>
                    <p className="text-[var(--foreground)]/60">Date: {viewInvoice.invoiceDate.toLocaleDateString('en-IN')}</p>
                  </div>

                  {/* Customer Details */}
                  <div className="mb-6 p-4 bg-[var(--foreground)]/5 rounded-lg">
                    <h3 className="font-semibold text-[var(--foreground)]/70 mb-2 border-b border-[var(--border)] pb-1">Bill To:</h3>
                    <p className="font-bold text-[var(--foreground)]">{viewInvoice.customerName}</p>
                    {viewInvoice.customerGstin && <p className="text-[var(--foreground)]/60">GSTIN: {viewInvoice.customerGstin}</p>}
                    {viewInvoice.customerAddress && <p className="text-[var(--foreground)]/60">{viewInvoice.customerAddress}</p>}
                  </div>

                  {/* Items Table */}
                  <table className="w-full mb-6 border-collapse border border-[var(--border)]">
                    <thead className="bg-[var(--foreground)]/[0.05]">
                      <tr>
                        <th className="px-3 py-2 text-left text-sm font-semibold text-[var(--foreground)] border border-[var(--border)]">#</th>
                        <th className="px-3 py-2 text-left text-sm font-semibold text-[var(--foreground)] border border-[var(--border)]">Item Description</th>
                        <th className="px-3 py-2 text-right text-sm font-semibold text-[var(--foreground)] border border-[var(--border)]">Qty</th>
                        <th className="px-3 py-2 text-right text-sm font-semibold text-[var(--foreground)] border border-[var(--border)]">Rate (₹)</th>
                        <th className="px-3 py-2 text-right text-sm font-semibold text-[var(--foreground)] border border-[var(--border)]">Amount (₹)</th>
                        <th className="px-3 py-2 text-right text-sm font-semibold text-[var(--foreground)] border border-[var(--border)]">GST (₹)</th>
                        <th className="px-3 py-2 text-right text-sm font-semibold text-[var(--foreground)] border border-[var(--border)]">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {viewInvoice.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 text-[var(--foreground)] border border-[var(--border)] text-center">{idx + 1}</td>
                          <td className="px-3 py-2 text-[var(--foreground)] border border-[var(--border)]">{item.productName}</td>
                          <td className="px-3 py-2 text-right text-[var(--foreground)] border border-[var(--border)]">{item.quantity}</td>
                          <td className="px-3 py-2 text-right text-[var(--foreground)] border border-[var(--border)]">{item.rate.toFixed(2)}</td>
                          <td className="px-3 py-2 text-right text-[var(--foreground)] border border-[var(--border)]">{item.amount.toFixed(2)}</td>
                          <td className="px-3 py-2 text-right text-[var(--foreground)] border border-[var(--border)]">
                            {item.igst > 0 ? item.igst.toFixed(2) : (item.cgst + item.sgst).toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right font-medium text-[var(--foreground)] border border-[var(--border)]">
                            {(item.amount + item.cgst + item.sgst + item.igst).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals */}
                  <div className="flex justify-end mb-6">
                    <div className="w-72">
                      <div className="flex justify-between py-1">
                        <span className="text-[var(--foreground)]/60">Subtotal:</span>
                        <span className="font-medium">₹{viewInvoice.items?.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-[var(--foreground)]/60">CGST:</span>
                        <span className="font-medium">₹{viewInvoice.items?.reduce((sum, item) => sum + item.cgst, 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-[var(--foreground)]/60">SGST:</span>
                        <span className="font-medium">₹{viewInvoice.items?.reduce((sum, item) => sum + item.sgst, 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-[var(--foreground)]/60">IGST:</span>
                        <span className="font-medium">₹{viewInvoice.items?.reduce((sum, item) => sum + item.igst, 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-t-2 border-[var(--foreground)] font-bold text-lg">
                        <span>Grand Total:</span>
                        <span>₹{(viewInvoice.total ?? 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Status */}
                  <div className="text-center mb-6">
                    <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${viewInvoice.paymentStatus === 'unpaid' ? 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border border-[var(--color-warning)]/20'
                      : viewInvoice.paymentStatus === 'partial' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                        : 'bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20'
                      }`}>
                      {viewInvoice.paymentStatus === 'unpaid' ? 'UNPAID'
                        : viewInvoice.paymentStatus === 'partial' ? `PARTIAL (₹${(viewInvoice.amountPaid ?? 0).toFixed(2)} PAID)`
                          : 'PAID'}
                      - {viewInvoice.paymentMode?.toUpperCase()}
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-start pt-4 border-t border-[var(--border)]">
                    <div className="w-1/2 pr-4">
                      <h4 className="font-semibold text-[var(--foreground)]/70 mb-2">Terms & Conditions:</h4>
                      <p className="text-xs text-[var(--foreground)]/50 whitespace-pre-line">
                        {businessProfile.termsAndConditions || "1. Goods once sold cannot be returned.\n2. Payment is due within agreed period."}
                      </p>
                    </div>
                    <div className="w-1/2 text-right">
                      <div className="mb-8">
                        <div className="border-b border-[var(--border)] w-48 ml-auto mb-2"></div>
                        <p className="text-sm font-medium text-[var(--foreground)]/70">Authorized Signatory</p>
                      </div>
                      <p className="font-semibold text-[var(--foreground)]">{businessProfile.name}</p>
                    </div>
                  </div>

                  {viewInvoice.notes && (
                    <div className="mt-4 pt-2 border-t">
                      <p className="text-sm text-[var(--foreground)]/50"><strong>Notes:</strong> {viewInvoice.notes}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </StaggerContainer>
  );
}
