"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
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
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormChange: (data: Partial<Props["formData"]>) => void;
  onMetadataChange: (data: Record<string, string>) => void;
}

export function ProductModal({ open, saving, editingProduct, industryType, formData, metadata, onClose, onSubmit, onFormChange, onMetadataChange }: Props) {
  const t = useTranslations("Products");
  if (!open) return null;

  return (
    <div className="glass-overlay" onKeyDown={e => { if (e.key === "Escape") onClose(); }}>
      <div className="glass-card glass-modal-panel max-w-lg">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--border)]/50">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">{editingProduct ? t("editProduct") : t("addProduct")}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-[var(--foreground)]/5 rounded-lg transition-colors" aria-label="Close">
            <X size={20} className="text-[var(--foreground)]/60" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("productName")}</label>
            <input type="text" required value={formData.name} onChange={e => onFormChange({ name: e.target.value })} className="w-full glass-input" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("sku")}</label>
              <input type="text" value={formData.sku} onChange={e => onFormChange({ sku: e.target.value })} className="w-full glass-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("hsnCode")}</label>
              <input type="text" value={formData.hsnCode} onChange={e => onFormChange({ hsnCode: e.target.value })} className="w-full glass-input" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("unit")}</label>
              <select value={formData.unit} onChange={e => onFormChange({ unit: e.target.value })} className="w-full glass-input">
                {getDefaultUnits(industryType).map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("rate")} *</label>
              <input type="number" step="0.01" min="0.01" required value={formData.rate} onChange={e => onFormChange({ rate: e.target.value })} className="w-full glass-input" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("gstRate")}</label>
              <select value={formData.gstRate} onChange={e => onFormChange({ gstRate: e.target.value })} className="w-full glass-input">
                {gstRates.map(r => <option key={r} value={r}>{r}%</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("initialStock")}</label>
              <input type="number" min="0" step="any" value={formData.stockQuantity} onChange={e => onFormChange({ stockQuantity: e.target.value })} className="w-full glass-input" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("lowStockThreshold")}</label>
            <input type="number" min="0" step="any" value={formData.lowStockThreshold} onChange={e => onFormChange({ lowStockThreshold: e.target.value })} className="w-full glass-input" />
          </div>

          {industryType === "mobile" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("imeiNumber")}</label>
                <input type="text" value={metadata.imei || ""} onChange={e => onMetadataChange({ ...metadata, imei: e.target.value })} className="w-full glass-input" placeholder="15 digit IMEI" pattern="^\d{15}$" title="Valid 15-digit IMEI number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("colorVariant")}</label>
                <input type="text" value={metadata.color || ""} onChange={e => onMetadataChange({ ...metadata, color: e.target.value })} className="w-full glass-input" placeholder="e.g., Black, 128GB" />
              </div>
            </div>
          )}

          {industryType === "pharmacy" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("batchNumber")}</label>
                <input type="text" required={!editingProduct} value={metadata.batchNumber || ""} onChange={e => onMetadataChange({ ...metadata, batchNumber: e.target.value })} className="w-full glass-input" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("expiryDate")}</label>
                <input type="date" required={!editingProduct} value={metadata.expiryDate || ""} onChange={e => onMetadataChange({ ...metadata, expiryDate: e.target.value })} className="w-full glass-input" />
              </div>
            </div>
          )}

          {industryType === "custom" && (
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1.5">{t("customLabel")}</label>
              <input type="text" value={metadata.customLabel || ""} onChange={e => onMetadataChange({ ...metadata, customLabel: e.target.value })} className="w-full glass-input" placeholder="e.g., Brand, Size, Color" />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="glass-btn-secondary flex-1">{t("cancel")}</button>
            <button type="submit" disabled={saving} className="glass-btn-primary flex-1">
              {saving ? t("saving") : editingProduct ? t("updateProduct") : t("createProduct")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
