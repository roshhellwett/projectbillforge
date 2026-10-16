"use client";

import { useId, useRef } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useModalAccessibility } from "@/components/ui/ui";
import { gstRates, getDefaultUnits, type IndustryType } from "../hooks/useProducts";
import type { Product } from "../hooks/useProducts";

interface Props {
  open: boolean;
  saving: boolean;
  editingProduct: Product | null;
  industryType: IndustryType;
  formData: {
    name: string; sku: string; hsnCode: string; unit: string;
    rate: string; gstRate: string; stockQuantity: string; lowStockThreshold: string;
  };
  metadata: Record<string, string>;
  error: string | null;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onFormChange: (data: Partial<Props["formData"]>) => void;
  onMetadataChange: (data: Record<string, string>) => void;
}

export function ProductModal({ open, saving, editingProduct, industryType, formData, metadata, error, onClose, onSubmit, onFormChange, onMetadataChange }: Props) {
  const t = useTranslations("Products");
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
            <h2 id={titleId} className="text-lg font-semibold text-[var(--foreground)]">{editingProduct ? t("editProduct") : t("addProduct")}</h2>
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
            <label htmlFor="product-name" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("productName")}</label>
            <input ref={nameRef} id="product-name" type="text" required autoComplete="off" value={formData.name} onChange={e => onFormChange({ name: e.target.value })} aria-required="true" aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} className="w-full glass-input" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="product-sku" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("sku")}</label>
              <input id="product-sku" type="text" autoComplete="off" value={formData.sku} onChange={e => onFormChange({ sku: e.target.value })} className="w-full glass-input" />
            </div>
            <div>
              <label htmlFor="product-hsn" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("hsnCode")}</label>
              <input id="product-hsn" type="text" autoComplete="off" value={formData.hsnCode} onChange={e => onFormChange({ hsnCode: e.target.value })} className="w-full glass-input" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="product-unit" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("unit")}</label>
              <select id="product-unit" value={formData.unit} onChange={e => onFormChange({ unit: e.target.value })} className="w-full glass-input">
                {getDefaultUnits(industryType).map(unit => <option key={unit} value={unit}>{unit}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="product-rate" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("rate")} <span aria-hidden="true">*</span></label>
              <input id="product-rate" type="number" step="0.01" min="0.01" required inputMode="decimal" value={formData.rate} onChange={e => onFormChange({ rate: e.target.value })} aria-required="true" className="w-full glass-input" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="product-gst" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("gstRate")}</label>
              <select id="product-gst" value={formData.gstRate} onChange={e => onFormChange({ gstRate: e.target.value })} className="w-full glass-input">
                {gstRates.map(rate => <option key={rate} value={rate}>{rate}%</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="product-stock" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("initialStock")}</label>
              <input id="product-stock" type="number" min="0" step="any" inputMode="decimal" value={formData.stockQuantity} onChange={e => onFormChange({ stockQuantity: e.target.value })} className="w-full glass-input" />
            </div>
          </div>

          <div>
            <label htmlFor="product-threshold" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("lowStockThreshold")}</label>
            <input id="product-threshold" type="number" min="0" step="any" inputMode="decimal" value={formData.lowStockThreshold} onChange={e => onFormChange({ lowStockThreshold: e.target.value })} className="w-full glass-input" />
            <p className="text-xs text-[var(--foreground)]/50 mt-1">{t("thresholdHint")}</p>
          </div>

          {industryType === "mobile" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="product-imei" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("imeiNumber")}</label>
                <input id="product-imei" type="text" inputMode="numeric" value={metadata.imei || ""} onChange={e => onMetadataChange({ ...metadata, imei: e.target.value })} className="w-full glass-input" placeholder={t("imeiPlaceholder")} />
              </div>
              <div>
                <label htmlFor="product-color" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("colorVariant")}</label>
                <input id="product-color" type="text" value={metadata.color || ""} onChange={e => onMetadataChange({ ...metadata, color: e.target.value })} className="w-full glass-input" placeholder={t("colorPlaceholder")} />
              </div>
            </div>
          )}

          {industryType === "pharmacy" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="product-batch" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("batchNumber")} <span aria-hidden="true">*</span></label>
                <input id="product-batch" type="text" required={!editingProduct} value={metadata.batchNumber || ""} onChange={e => onMetadataChange({ ...metadata, batchNumber: e.target.value })} aria-required={!editingProduct} className="w-full glass-input" />
              </div>
              <div>
                <label htmlFor="product-expiry" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("expiryDate")} <span aria-hidden="true">*</span></label>
                <input id="product-expiry" type="date" required={!editingProduct} value={metadata.expiryDate || ""} onChange={e => onMetadataChange({ ...metadata, expiryDate: e.target.value })} aria-required={!editingProduct} className="w-full glass-input" />
              </div>
            </div>
          )}

          {industryType === "custom" && (
            <div>
              <label htmlFor="product-custom-label" className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("customLabel")}</label>
              <input id="product-custom-label" type="text" value={metadata.customLabel || ""} onChange={e => onMetadataChange({ ...metadata, customLabel: e.target.value })} className="w-full glass-input" placeholder={t("customLabelPlaceholder")} />
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <button type="button" onClick={onClose} disabled={saving} className="glass-btn-secondary flex-1 min-h-[44px] disabled:opacity-50">{t("cancel")}</button>
            <button type="submit" disabled={saving} aria-busy={saving} className="glass-btn-primary flex-1 min-h-[44px] disabled:opacity-60">
              {saving ? t("saving") : editingProduct ? t("updateProduct") : t("createProduct")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
