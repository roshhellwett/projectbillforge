"use client";

import { useId, useRef } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { useModalAccessibility } from "@/components/ui/ui";
import type { Customer, CustomerFormData } from "../hooks/useCustomers";

interface Props {
  open: boolean;
  saving: boolean;
  editingCustomer: Customer | null;
  formData: CustomerFormData;
  error: string | null;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onFormChange: (data: Partial<CustomerFormData>) => void;
}

export function CustomerModal({ open, saving, editingCustomer, formData, error, onClose, onSubmit, onFormChange }: Props) {
  const t = useTranslations("Customers");
  const dialogRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const errorId = useId();

  useModalAccessibility({
    open,
    containerRef: dialogRef,
    initialFocusRef: nameRef,
    onClose,
    closeOnEscape: !saving,
  });

  if (!open) return null;

  const set = (key: keyof CustomerFormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onFormChange({ [key]: key === "gstin" ? event.target.value.toUpperCase() : event.target.value });
  };

  return (
    <div className="glass-overlay">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-busy={saving}
        tabIndex={-1}
        className="glass-card glass-modal-panel max-w-lg w-full"
      >
        <div className="flex items-start justify-between gap-4 p-4 sm:p-5 border-b border-[var(--border)]/50">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-[var(--foreground)]">
              {editingCustomer ? t("editCustomer") : t("addCustomer")}
            </h2>
            <p id={descriptionId} className="text-xs text-[var(--foreground)]/55 mt-1">{t("modalHint")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="min-h-[44px] min-w-[44px] p-2 hover:bg-[var(--foreground)]/5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
            aria-label={t("closeDialog")}
          >
            <X size={20} className="text-[var(--foreground)]/60" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={onSubmit} noValidate className="p-5 space-y-4">
          {error && (
            <div id={errorId} className="rounded-xl border border-[var(--color-danger)]/25 bg-[var(--color-danger)]/10 px-3 py-2.5 text-sm text-[var(--foreground)]" role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="customer-name" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("customerName")}</label>
            <input
              ref={nameRef}
              id="customer-name"
              type="text"
              required
              autoComplete="name"
              value={formData.name}
              onChange={set("name")}
              aria-required="true"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              className="w-full glass-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="customer-phone" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("phone")} <span aria-hidden="true">*</span></label>
              <input
                id="customer-phone"
                type="tel"
                required
                inputMode="numeric"
                autoComplete="tel"
                value={formData.phone}
                onChange={set("phone")}
                aria-required="true"
                className="w-full glass-input"
                placeholder={t("phonePlaceholder")}
              />
            </div>
            <div>
              <label htmlFor="customer-email" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("email")}</label>
              <input id="customer-email" type="email" autoComplete="email" value={formData.email} onChange={set("email")} className="w-full glass-input" />
            </div>
          </div>

          <div>
            <label htmlFor="customer-gstin" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("gstin")}</label>
            <input id="customer-gstin" type="text" value={formData.gstin} onChange={set("gstin")} className="w-full glass-input uppercase" placeholder={t("gstinPlaceholder")} />
          </div>

          <div>
            <label htmlFor="customer-address" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("address")} <span aria-hidden="true">*</span></label>
            <textarea id="customer-address" required autoComplete="street-address" value={formData.address} onChange={set("address")} rows={2} aria-required="true" className="w-full glass-input" />
          </div>

          <div>
            <label htmlFor="customer-credit-limit" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("creditLimit")}</label>
            <input id="customer-credit-limit" type="number" min="0" step="0.01" inputMode="decimal" value={formData.creditLimit} onChange={set("creditLimit")} className="w-full glass-input" />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <button type="button" onClick={onClose} disabled={saving} className="glass-btn-secondary flex-1 min-h-[44px] disabled:opacity-50">{t("cancel")}</button>
            <button type="submit" disabled={saving} aria-busy={saving} className="glass-btn-primary flex-1 min-h-[44px] disabled:opacity-60">
              {saving ? t("saving") : editingCustomer ? t("updateCustomer") : t("createCustomer")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
