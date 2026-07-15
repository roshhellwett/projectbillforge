"use client";

import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import type { Customer, CustomerFormData } from "../hooks/useCustomers";

interface Props {
  open: boolean;
  saving: boolean;
  editingCustomer: Customer | null;
  formData: CustomerFormData;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormChange: (data: Partial<CustomerFormData>) => void;
}

export function CustomerModal({ open, saving, editingCustomer, formData, onClose, onSubmit, onFormChange }: Props) {
  const t = useTranslations("Customers");
  if (!open) return null;

  const set = (key: keyof CustomerFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onFormChange({ [key]: key === "gstin" ? e.target.value?.toUpperCase() : e.target.value });

  return (
    <div className="glass-overlay" onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}>
      <div className="glass-card glass-modal-panel max-w-lg">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--border)]/50">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {editingCustomer ? t("editCustomer") : t("addCustomer")}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-[var(--foreground)]/5 rounded-lg transition-colors" aria-label="Close">
            <X size={20} className="text-[var(--foreground)]/60" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("customerName")}</label>
            <input type="text" required value={formData.name} onChange={set("name")} className="w-full glass-input" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("phone")} <span className="text-[var(--foreground)] font-bold">*</span></label>
              <input type="tel" required value={formData.phone} onChange={set("phone")} className="w-full glass-input" pattern="^[6-9]\d{9}$" title="10-digit Indian mobile number starting with 6-9" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("email")}</label>
              <input type="email" value={formData.email} onChange={set("email")} className="w-full glass-input" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("gstin")}</label>
            <input type="text" value={formData.gstin} onChange={set("gstin")} className="w-full glass-input uppercase" placeholder="27AABCU9603R1ZM" pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$" title="Valid 15-character GSTIN" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("address")} <span className="text-[var(--foreground)] font-bold">*</span></label>
            <textarea required value={formData.address} onChange={set("address")} rows={2} className="w-full glass-input" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("creditLimit")}</label>
            <input type="number" min="0" step="0.01" value={formData.creditLimit} onChange={set("creditLimit")} className="w-full glass-input" />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="glass-btn-secondary flex-1">{t("cancel")}</button>
            <button type="submit" disabled={saving} className="glass-btn-primary flex-1">
              {saving ? t("saving") : editingCustomer ? t("updateCustomer") : t("createCustomer")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
