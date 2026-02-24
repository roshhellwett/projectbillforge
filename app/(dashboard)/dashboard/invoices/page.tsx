"use client";

import { useState, useEffect, useMemo } from "react";
import { getProducts } from "@/lib/actions/products";
import { getCustomers } from "@/lib/actions/customers";
import { getInvoices, createInvoice, cancelInvoice } from "@/lib/actions/invoices";
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
}

export default function InvoicesPage() {
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
  });

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [productsResult, customersResult, invoicesResult] = await Promise.all([
      getProducts(),
      getCustomers(),
      getInvoices(),
    ]);
    if (productsResult.success) setProducts(productsResult.products);
    if (customersResult.success) setCustomers(customersResult.customers);
    if (invoicesResult.success) setInvoices(invoicesResult.invoices.map(inv => ({
      ...inv,
      invoiceDate: new Date(inv.invoiceDate)
    })));
    setLoading(false);
  };

  const addItem = () => {
    if (!selectedProduct) return;
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    const amount = product.rate * itemQuantity;
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
      quantity: itemQuantity,
      rate: product.rate,
      gstRate: gstRate,
      amount,
      cgst,
      sgst,
      igst,
    };

    setItems([...items, newItem]);
    setSelectedProduct("");
    setItemQuantity(1);
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
    });

    if (result.error) {
      setError(result.error);
    } else {
      setShowNewInvoice(false);
      resetForm();
      loadData();
    }
    setSaving(false);
  };

  const handleCancelInvoice = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this invoice?")) return;
    const result = await cancelInvoice(id);
    if (result.success) {
      loadData();
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: "",
      customerName: "",
      customerGstin: "",
      customerAddress: "",
      invoiceDate: new Date().toISOString().split('T')[0],
      notes: "",
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
          <div className="p-8 text-center text-slate-500">Loading...</div>
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
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${invoice.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {invoice.status === 'active' && (
                        <button
                          onClick={() => handleCancelInvoice(invoice.id)}
                          className="p-1 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
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
              <button onClick={() => setShowNewInvoice(false)} className="p-1 hover:bg-slate-100 rounded-lg">
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
                  <input
                    type="number"
                    min="1"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                    className="w-20 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Qty"
                  />
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
    </div>
  );
}
