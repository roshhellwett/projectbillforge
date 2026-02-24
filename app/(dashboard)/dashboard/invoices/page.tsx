"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getProducts } from "@/lib/actions/products";
import { getCustomers } from "@/lib/actions/customers";
import { getInvoices, createInvoice, cancelInvoice } from "@/lib/actions/invoices";
import { getBusinessProfile } from "@/lib/actions/business";
import { ConfirmDialog, SkeletonTable } from "@/lib/components/ui";
import { Plus, Search, X, Trash2, FileText, Printer, Download } from "lucide-react";

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
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [isInterState, setIsInterState] = useState(false);
  
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
    const result = await cancelInvoice(cancelId);
    if (result.success) {
      loadData();
      router.refresh();
    }
    setCancelId(null);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
          <p className="text-slate-500">Create and manage invoices</p>
        </div>
        <button
          onClick={() => setShowNewInvoice(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          <Plus size={20} />
          New Invoice
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <SkeletonTable rows={5} />
        ) : filteredInvoices.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No invoices found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Invoice #</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{invoice.invoiceNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{invoice.invoiceDate.toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-slate-900">{invoice.customerName}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">₹{(invoice.total ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3">
                      {invoice.status === 'cancelled' ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                          Cancelled
                        </span>
                      ) : invoice.paymentStatus === 'unpaid' ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                          Unpaid
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          Paid
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewInvoice(invoice)}
                          className="p-1 text-slate-400 hover:text-blue-600"
                          aria-label="View invoice"
                        >
                          <Printer size={18} />
                        </button>
                        {invoice.status === 'active' && (
                          <button
                            onClick={() => setCancelId(invoice.id)}
                            className="p-1 text-slate-400 hover:text-red-600"
                            aria-label="Cancel invoice"
                          >
                            <Trash2 size={18} />
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
      </div>

      {showNewInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold">New Invoice</h2>
              <button onClick={() => setShowNewInvoice(false)} className="p-1 hover:bg-slate-100 rounded-lg" aria-label="Close">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-6">
              {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
                  <select
                    value={formData.customerId}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Customer (Optional)</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={formData.customerGstin}
                    onChange={(e) => setFormData({ ...formData, customerGstin: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Invoice Date</label>
                  <input
                    type="date"
                    required
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="isInterState"
                  checked={isInterState}
                  onChange={(e) => setIsInterState(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="isInterState" className="text-sm text-slate-700">Inter-State (IGST instead of CGST+SGST)</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Payment Mode</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMode"
                      value="cash"
                      checked={formData.paymentMode === 'cash'}
                      onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as "cash" })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-slate-700">Cash</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMode"
                      value="upi"
                      checked={formData.paymentMode === 'upi'}
                      onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as "upi" })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-slate-700">UPI/Online</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMode"
                      value="khata"
                      checked={formData.paymentMode === 'khata'}
                      onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as "khata" })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-slate-700">Khata (Credit)</span>
                  </label>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4">
                <h3 className="font-semibold text-slate-900 mb-4">Items</h3>
                
                <div className="flex gap-2 mb-4">
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Product</option>
                    {products.filter(p => p.isActive).map(p => (
                      <option key={p.id} value={p.id}>{p.name} - ₹{p.rate} ({p.gstRate}% GST)</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => window.location.href = '/dashboard/products'}
                    className="px-3 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-sm"
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
                      className="w-24 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                    {selectedProduct && products.find(p => p.id === selectedProduct)?.unit && (
                      <span className="absolute right-3 text-xs text-slate-400 pointer-events-none">
                        {products.find(p => p.id === selectedProduct)?.unit}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={addItem}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>

                {items.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Item</th>
                          <th className="px-3 py-2 text-right">Qty</th>
                          <th className="px-3 py-2 text-right">Rate</th>
                          <th className="px-3 py-2 text-right">Amount</th>
                          <th className="px-3 py-2 text-right">GST</th>
                          <th className="px-3 py-2 text-right">Total</th>
                          <th className="px-3 py-2"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-2">{item.productName}</td>
                            <td className="px-3 py-2 text-right">{item.quantity}</td>
                            <td className="px-3 py-2 text-right">₹{item.rate.toFixed(2)}</td>
                            <td className="px-3 py-2 text-right">₹{item.amount.toFixed(2)}</td>
                            <td className="px-3 py-2 text-right">
                              {isInterState 
                                ? `IGST ₹${item.igst.toFixed(2)}`
                                : `C ₹${item.cgst.toFixed(2)} S ₹${item.sgst.toFixed(2)}`
                              }
                            </td>
                            <td className="px-3 py-2 text-right font-medium">
                              ₹{(item.amount + item.cgst + item.sgst + item.igst).toFixed(2)}
                            </td>
                            <td className="px-3 py-2">
                              <button type="button" onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700">
                                <X size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-4">No items added</p>
                )}
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-medium">₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">CGST:</span>
                    <span className="font-medium">₹{totals.cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">SGST:</span>
                    <span className="font-medium">₹{totals.sgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">IGST:</span>
                    <span className="font-medium">₹{totals.igst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewInvoice(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || items.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create Invoice"}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold">Invoice</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  <Printer size={18} />
                  Print
                </button>
                <button onClick={() => setViewInvoice(null)} className="p-1 hover:bg-slate-100 rounded-lg" aria-label="Close">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-8" id="invoice-print" style={{ fontFamily: 'Arial, sans-serif' }}>
              {/* Header */}
              <div className="border-b-2 border-slate-800 pb-4 mb-6">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-wide">{businessProfile.name}</h1>
                  <p className="text-slate-600 mt-1">
                    {businessProfile.address}
                    {businessProfile.state && `, ${businessProfile.state}`}
                    {businessProfile.pincode && ` - ${businessProfile.pincode}`}
                  </p>
                  <p className="text-slate-600">
                    {businessProfile.phone && <span>Ph: {businessProfile.phone}</span>}
                    {businessProfile.phone && businessProfile.gstin && <span> | </span>}
                    {businessProfile.gstin && <span>GSTIN: {businessProfile.gstin}</span>}
                  </p>
                </div>
              </div>

              {/* Document Title */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 uppercase">
                  {businessProfile.gstin ? 'Tax Invoice' : 'Invoice'}
                </h2>
                <p className="text-slate-600 mt-1">Invoice No: {viewInvoice.invoiceNumber}</p>
                <p className="text-slate-600">Date: {viewInvoice.invoiceDate.toLocaleDateString('en-IN')}</p>
              </div>

              {/* Customer Details */}
              <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-slate-700 mb-2 border-b border-slate-300 pb-1">Bill To:</h3>
                <p className="font-bold text-slate-900">{viewInvoice.customerName}</p>
                {viewInvoice.customerGstin && <p className="text-slate-600">GSTIN: {viewInvoice.customerGstin}</p>}
                {viewInvoice.customerAddress && <p className="text-slate-600">{viewInvoice.customerAddress}</p>}
              </div>

              {/* Items Table */}
              <table className="w-full mb-6 border-collapse border border-slate-300">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="px-3 py-2 text-left text-sm font-medium border border-slate-300">#</th>
                    <th className="px-3 py-2 text-left text-sm font-medium border border-slate-300">Item Description</th>
                    <th className="px-3 py-2 text-right text-sm font-medium border border-slate-300">Qty</th>
                    <th className="px-3 py-2 text-right text-sm font-medium border border-slate-300">Rate (₹)</th>
                    <th className="px-3 py-2 text-right text-sm font-medium border border-slate-300">Amount (₹)</th>
                    <th className="px-3 py-2 text-right text-sm font-medium border border-slate-300">GST (₹)</th>
                    <th className="px-3 py-2 text-right text-sm font-medium border border-slate-300">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {viewInvoice.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 text-slate-900 border border-slate-300 text-center">{idx + 1}</td>
                      <td className="px-3 py-2 text-slate-900 border border-slate-300">{item.productName}</td>
                      <td className="px-3 py-2 text-right text-slate-900 border border-slate-300">{item.quantity}</td>
                      <td className="px-3 py-2 text-right text-slate-900 border border-slate-300">{item.rate.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right text-slate-900 border border-slate-300">{item.amount.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right text-slate-900 border border-slate-300">
                        {item.igst > 0 ? item.igst.toFixed(2) : (item.cgst + item.sgst).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-slate-900 border border-slate-300">
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
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="font-medium">₹{viewInvoice.items?.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">CGST:</span>
                    <span className="font-medium">₹{viewInvoice.items?.reduce((sum, item) => sum + item.cgst, 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">SGST:</span>
                    <span className="font-medium">₹{viewInvoice.items?.reduce((sum, item) => sum + item.sgst, 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600">IGST:</span>
                    <span className="font-medium">₹{viewInvoice.items?.reduce((sum, item) => sum + item.igst, 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t-2 border-slate-800 font-bold text-lg">
                    <span>Grand Total:</span>
                    <span>₹{(viewInvoice.total ?? 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className="text-center mb-6">
                <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${viewInvoice.paymentStatus === 'unpaid' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                  {viewInvoice.paymentStatus === 'unpaid' ? 'UNPAID' : 'PAID'} - {viewInvoice.paymentMode?.toUpperCase()}
                </span>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-start pt-4 border-t border-slate-300">
                <div className="w-1/2 pr-4">
                  <h4 className="font-semibold text-slate-700 mb-2">Terms & Conditions:</h4>
                  <p className="text-xs text-slate-500 whitespace-pre-line">
                    {businessProfile.termsAndConditions || "1. Goods once sold cannot be returned.\n2. Payment is due within agreed period."}
                  </p>
                </div>
                <div className="w-1/2 text-right">
                  <div className="mb-8">
                    <div className="border-b border-slate-400 w-48 ml-auto mb-2"></div>
                    <p className="text-sm font-medium text-slate-700">Authorized Signatory</p>
                  </div>
                  <p className="font-semibold text-slate-900">{businessProfile.name}</p>
                </div>
              </div>

              {viewInvoice.notes && (
                <div className="mt-4 pt-2 border-t">
                  <p className="text-sm text-slate-500"><strong>Notes:</strong> {viewInvoice.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
