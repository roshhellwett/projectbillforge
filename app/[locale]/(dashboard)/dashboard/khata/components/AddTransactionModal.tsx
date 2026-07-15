"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  open: boolean;
  saving: boolean;
  formData: { type: "credit" | "debit"; amount: string; note: string };
  onClose: () => void;
  onChange: (data: { type: "credit" | "debit"; amount: string; note: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AddTransactionModal({ open, saving, formData, onClose, onChange, onSubmit }: Props) {
  const t = useTranslations("Khata");
  if (!open) return null;

  return (
    <div className="glass-overlay" onKeyDown={e => { if (e.key === "Escape") onClose(); }}>
      <div className="glass-card glass-modal-panel max-w-md">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--border)]/50">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">{t("addTransaction")}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-[var(--foreground)]/5 rounded-lg transition-colors" aria-label="Close">
            <X size={20} className="text-[var(--foreground)]/60" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-2">{t("transactionType")}</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => onChange({ ...formData, type: "credit" })}
                className={`flex-1 py-2 rounded-xl border-2 font-bold transition-all ${formData.type === "credit" ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900" : "border-[var(--border)] text-[var(--foreground)]/70 hover:text-[var(--foreground)]"}`}>
                {t("saleOption")}
              </button>
              <button type="button" onClick={() => onChange({ ...formData, type: "debit" })}
                className={`flex-1 py-2 rounded-xl border-2 font-bold transition-all ${formData.type === "debit" ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900" : "border-[var(--border)] text-[var(--foreground)]/70 hover:text-[var(--foreground)]"}`}>
                {t("paymentOption")}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">{t("amountLabel")}</label>
            <input type="number" step="0.01" min="0.01" required value={formData.amount}
              onChange={e => onChange({ ...formData, amount: e.target.value })}
              className="w-full glass-input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">{t("noteOptional")}</label>
            <input type="text" value={formData.note}
              onChange={e => onChange({ ...formData, note: e.target.value })}
              className="w-full glass-input" placeholder={t("notePlaceholderSale")} />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="glass-btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="glass-btn-primary flex-1">
              {saving ? t("saving") || "Saving..." : t("addTransactionBtn")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
