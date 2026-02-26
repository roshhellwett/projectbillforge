"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from "@/lib/actions/customers";
import { recalculateCustomerBalance } from "@/lib/actions/khata";
import { ConfirmDialog, SkeletonCard } from "@/lib/components/ui";
import { useTranslations } from "next-intl";
import { Plus, Search, X, RefreshCw, Trash2, Edit2, Phone, Mail, MapPin } from "lucide-react";
import { StaggerContainer, StaggerItem, FadeIn } from "@/lib/components/MotionWrapper";

// NaN-safe currency formatter
const fmt = (v: any): string => {
  const n = Number(v);
  if (isNaN(n) || !isFinite(n)) return '0.00';
  return Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const safeNum = (v: any): number => {
  const n = Number(v);
  return isNaN(n) || !isFinite(n) ? 0 : n;
};

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  gstin: string | null;
  address: string | null;
  creditLimit: number | null;
  currentBalance: number | null;
}

export default function CustomersPage() {
  const t = useTranslations('Customers');
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    gstin: "",
    address: "",
    creditLimit: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const handleSyncBalance = async (customerId: string) => {
    setSyncingId(customerId);
    const result = await recalculateCustomerBalance(customerId);
    if (result.success) {
      loadCustomers();
      router.refresh();
    } else {
      setError(result.error || "Failed to sync balance");
    }
    setSyncingId(null);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const data = {
      name: formData.name,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      gstin: formData.gstin || undefined,
      address: formData.address || undefined,
      creditLimit: formData.creditLimit ? Number(formData.creditLimit) : 0,
    };

    let result;
    if (editingCustomer) {
      result = await updateCustomer(editingCustomer.id, data);
    } else {
      result = await createCustomer(data);
    }

    if (result.error) {
      setError(result.error);
    } else {
      setShowModal(false);
      setEditingCustomer(null);
      resetForm();
      loadCustomers();
      router.refresh();
    }
    setSaving(false);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setError("");
    setFormData({
      name: customer.name,
      phone: customer.phone || "",
      email: customer.email || "",
      gstin: customer.gstin || "",
      address: customer.address || "",
      creditLimit: customer.creditLimit?.toString() ?? "",
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteCustomer(deleteId);
    if (result.success) {
      loadCustomers();
      router.refresh();
    } else {
      setError(result.error || "Failed to delete customer");
    }
    setDeleting(false);
    setDeleteId(null);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      gstin: "",
      address: "",
      creditLimit: "",
    });
  };

  const openModal = () => {
    resetForm();
    setEditingCustomer(null);
    setError("");
    setShowModal(true);
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  return (
    <StaggerContainer className="space-y-6">
      <FadeIn className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">{t('title')}</h1>
          <p className="text-[var(--foreground)]/60 mt-1">{t('subtitle')}</p>
        </div>
        <button
          onClick={openModal}
          className="glass-btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          {t('addCustomer')}
        </button>
      </FadeIn>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
          <button onClick={() => setError("")} className="float-right text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      <StaggerItem className="glass-card overflow-hidden">
        <div className="p-4 md:p-6 border-b border-[var(--border)]/50">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-[var(--color-primary)]/60 pointer-events-none" size={18} />
            <input
              type="text"
              placeholder={t('searchCustomer')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-4 py-3 glass-input text-[var(--foreground)] placeholder:text-[var(--foreground)]/40 font-medium focus:ring-0"
              style={{ paddingLeft: '2.75rem' }}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-[var(--foreground)]/50 font-medium">{t('noCustomers')}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 md:p-6">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="p-6 bg-[var(--card)] rounded-3xl shadow-[0_5px_15px_rgba(0,0,0,0.02)] border border-[var(--border)]/30 hover:-translate-y-1 hover:shadow-lg transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)]">{customer.name}</h3>
                    {customer.phone && (
                      <p className="text-sm text-[var(--foreground)]/60 flex items-center gap-1.5 mt-1">
                        <Phone size={12} /> {customer.phone}
                      </p>
                    )}
                    {customer.email && (
                      <p className="text-sm text-[var(--foreground)]/60 flex items-center gap-1.5 mt-0.5">
                        <Mail size={12} /> {customer.email}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="p-1.5 text-[var(--foreground)]/40 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors"
                      aria-label="Edit customer"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteId(customer.id)}
                      className={`p-1.5 rounded-lg transition-colors ${(customer.currentBalance ?? 0) > 0 ? 'text-[var(--foreground)]/20 cursor-not-allowed' : 'text-[var(--foreground)]/40 hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10'}`}
                      aria-label="Delete customer"
                      disabled={(customer.currentBalance ?? 0) > 0}
                      title={(customer.currentBalance ?? 0) > 0 ? "Cannot delete customer with outstanding balance" : "Delete customer"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="pt-3 border-t border-[var(--border)]/30">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[var(--foreground)]/60">{t('totalOwed')}</span>
                    <div className="flex items-center gap-1">
                      <span className={safeNum(customer.currentBalance) > 0 ? "font-semibold text-[var(--color-warning)]" : safeNum(customer.currentBalance) < 0 ? "font-semibold text-[var(--color-primary)]" : "font-medium text-[var(--foreground)]"}>
                        {safeNum(customer.currentBalance) < 0 ? '-' : ''}₹{fmt(customer.currentBalance)}
                      </span>
                      <button
                        onClick={() => handleSyncBalance(customer.id)}
                        disabled={syncingId === customer.id}
                        className="p-1 text-[var(--foreground)]/40 hover:text-[var(--color-primary)] disabled:opacity-50"
                        title="Recalculate balance from transactions"
                      >
                        <RefreshCw size={14} className={syncingId === customer.id ? "animate-spin" : ""} />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm mt-1.5">
                    <span className="text-[var(--foreground)]/60">{t('creditLimit')}</span>
                    <span className="text-[var(--foreground)] font-medium">₹{fmt(customer.creditLimit)}</span>
                  </div>
                  {safeNum(customer.creditLimit) > 0 && (
                    <div className="flex justify-between text-sm mt-1.5">
                      <span className="text-[var(--foreground)]/60">{t('availableCredit')}</span>
                      <span className="font-semibold text-[var(--color-success)]">
                        ₹{fmt(Math.max(0, safeNum(customer.creditLimit) - safeNum(customer.currentBalance)))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </StaggerItem>

      {showModal && (
        <div className="glass-overlay">
          <div className="glass-card glass-modal-panel max-w-lg">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--border)]/50">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">{editingCustomer ? t('editCustomer') : t('addCustomer')}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-[var(--foreground)]/5 rounded-lg transition-colors" aria-label="Close">
                <X size={20} className="text-[var(--foreground)]/60" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && <div className="p-3 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-xl text-sm font-medium border border-[var(--color-danger)]/20">{error}</div>}

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t('customerName')}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full glass-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t('phone')}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full glass-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t('email')}</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full glass-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t('gstin')}</label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  className="w-full glass-input"
                  placeholder="27AABCU9603R1ZM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t('address')}</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  className="w-full glass-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t('creditLimit')}</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                  className="w-full glass-input"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="glass-btn-secondary flex-1"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="glass-btn-primary flex-1"
                >
                  {saving ? t('saving') : editingCustomer ? t('updateCustomer') : t('createCustomer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Customer"
        message={(() => {
          const customer = customers.find(c => c.id === deleteId);
          if (customer && (customer.currentBalance ?? 0) > 0) {
            return `Cannot delete this customer. They have an outstanding balance of ₹${(customer.currentBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}. Please settle the dues first.`;
          }
          return "Are you sure you want to delete this customer? This action cannot be undone and will also delete all their transactions.";
        })()}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </StaggerContainer>
  );
}
