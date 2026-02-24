"use client";

import { useState, useEffect } from "react";
import { getCustomers } from "@/lib/actions/customers";
import { getKhataStatement, createKhataTransaction, deleteKhataTransaction } from "@/lib/actions/khata";
import { ConfirmDialog } from "@/lib/components/ui";
import { Plus, Search, X, ArrowUpCircle, ArrowDownCircle, Trash2 } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  currentBalance: number | null;
}

interface Transaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  note: string | null;
  createdAt: Date;
  referenceInvoiceId: string | null;
}

export default function KhataPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [customer, setCustomer] = useState<any>(null);
  const [statement, setStatement] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: "credit" as "credit" | "debit",
    amount: "",
    note: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [accruedFines, setAccruedFines] = useState(0);
  const [totalBalanceDue, setTotalBalanceDue] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    note: "",
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    const result = await getCustomers();
    if (result.success) {
      setCustomers(result.customers);
    }
    setLoading(false);
  };

  const loadStatement = async (customerId: string) => {
    const result = await getKhataStatement(customerId);
    if (result.success) {
      setCustomer(result.customer);
      setStatement(result.statement.map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt)
      })));
      setAccruedFines(result.accruedFines || 0);
      setTotalBalanceDue(result.totalBalanceDue || 0);
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomer(customerId);
    setAccruedFines(0);
    setTotalBalanceDue(0);
    if (customerId) {
      loadStatement(customerId);
    } else {
      setCustomer(null);
      setStatement([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    setError("");
    setSaving(true);

    const result = await createKhataTransaction({
      customerId: selectedCustomer,
      type: formData.type,
      amount: Number(formData.amount) || 0,
      note: formData.note || undefined,
    });

    if (result.error) {
      setError(result.error);
    } else {
      setShowModal(false);
      setFormData({ type: "credit", amount: "", note: "" });
      loadStatement(selectedCustomer);
      loadCustomers();
    }
    setSaving(false);
  };

  const handleDeleteTransaction = async () => {
    if (!deleteId) return;
    const result = await deleteKhataTransaction(deleteId);
    if (result.success && selectedCustomer) {
      loadStatement(selectedCustomer);
      loadCustomers();
    }
    setDeleteId(null);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    
    const amount = Number(paymentData.amount);
    if (!amount || amount <= 0) {
      setError("Please enter a valid payment amount");
      return;
    }

    setError("");
    setSaving(true);

    const result = await createKhataTransaction({
      customerId: selectedCustomer,
      type: "debit",
      amount: amount,
      note: paymentData.note || "Payment received",
    });

    if (result.error) {
      setError(result.error);
    } else {
      setShowPaymentModal(false);
      setPaymentData({ amount: "", note: "" });
      loadStatement(selectedCustomer);
      loadCustomers();
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Khata Ledger</h1>
          <p className="text-slate-500">Track customer credit and payments</p>
        </div>
        {selectedCustomer && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Transaction
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">Select Customer</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search customers..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mt-2 max-h-60 overflow-y-auto border border-slate-200 rounded-xl">
          {customers
            .filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
              (c.phone && c.phone.includes(customerSearch)))
            .length === 0 ? (
            <div className="p-3 text-sm text-slate-500 text-center">No customers found</div>
          ) : (
            customers
              .filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
                (c.phone && c.phone.includes(customerSearch)))
              .map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCustomerSelect(c.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 ${
                    selectedCustomer === c.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="font-medium text-slate-900">{c.name}</div>
                  <div className="text-sm text-slate-500">
                    {c.phone || 'No phone'} • Balance: ₹{Math.abs(c.currentBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </button>
              ))
          )}
        </div>
      </div>

      {customer && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-500">Customer Name</p>
              <p className="text-xl font-bold text-slate-900">{customer.name}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-500">Phone</p>
              <p className="text-xl font-bold text-slate-900">{customer.phone || "-"}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Current Balance</p>
                  <p className={`text-xl font-bold ${(customer.currentBalance ?? 0) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                    ₹{Math.abs(customer.currentBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                {(customer.currentBalance ?? 0) > 0 && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                  >
                    Record Payment
                  </button>
                )}
              </div>
            </div>
            {accruedFines > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-sm">
                <p className="text-sm text-red-500">Accrued Fines</p>
                <p className="text-xl font-bold text-red-600">
                  ₹{accruedFines.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-500">Total Balance Due</p>
              <p className="text-xl font-bold text-red-600">
                ₹{totalBalanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">Transaction History</h2>
            </div>
            
            {statement.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No transactions found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Note</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600">Amount</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-600" title="Running balance after this transaction">
                        Balance <span className="text-xs font-normal text-slate-400">(Running)</span>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {statement.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {t.createdAt.toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1 text-sm font-medium ${t.type === 'credit' ? 'text-orange-600' : 'text-green-600'}`}>
                            {t.type === 'credit' ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}
                            {t.type === 'credit' ? 'Credit' : 'Payment'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{t.note || "-"}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">
                          ₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          <span className={(t as any).runningBalance >= 0 ? 'text-orange-600' : 'text-green-600'}>
                            ₹{Math.abs((t as any).runningBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {!t.referenceInvoiceId && (
                            <button
                              onClick={() => setDeleteId(t.id)}
                              className="p-1 text-slate-400 hover:text-red-600"
                              aria-label="Delete transaction"
                            >
                              <Trash2 size={16} />
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
        </>
      )}

      {!selectedCustomer && !loading && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <p className="text-slate-500">Select a customer to view their khata ledger</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold">Add Transaction</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded-lg" aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Transaction Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "credit" })}
                    className={`flex-1 py-2 rounded-xl border-2 ${formData.type === 'credit' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200'}`}
                  >
                    Credit (Give)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "debit" })}
                    className={`flex-1 py-2 rounded-xl border-2 ${formData.type === 'debit' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200'}`}
                  >
                    Payment (Take)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Note (Optional)</label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Cash payment, Partial payment"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Add Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This will adjust the customer's balance."
        onConfirm={handleDeleteTransaction}
        onCancel={() => setDeleteId(null)}
      />

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold">Record Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="p-1 hover:bg-slate-100 rounded-lg" aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePaymentSubmit} className="p-4 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
              
              <div className="bg-green-50 p-4 rounded-xl">
                <p className="text-sm text-green-700">
                  Recording payment for <strong>{customer?.name}</strong>
                </p>
                <p className="text-lg font-bold text-green-800 mt-1">
                  Current Due: ₹{(customer?.currentBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setPaymentData({ ...paymentData, amount: String(customer?.currentBalance ?? 0) })}
                    className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded"
                  >
                    Pay Full
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentData({ ...paymentData, amount: String(Math.round((customer?.currentBalance ?? 0) / 2)) })}
                    className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded"
                  >
                    Pay Half
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                <select
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Note (Optional)</label>
                <input
                  type="text"
                  value={paymentData.note}
                  onChange={(e) => setPaymentData({ ...paymentData, note: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Cash received, UPI payment"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? "Processing..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
