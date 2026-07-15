"use client";

import type { Customer } from "../hooks/useCustomers";
import { fmt, safeNum } from "../hooks/useCustomers";
import { useTranslations } from "next-intl";
import { Phone, Mail, Edit2, Trash2, RefreshCw, MessageCircle, Wallet } from "lucide-react";

interface Props {
  customer: Customer;
  syncingId: string | null;
  onEdit: (c: Customer) => void;
  onDelete: (id: string) => void;
  onSyncBalance: (id: string) => void;
}

export function CustomerCard({ customer, syncingId, onEdit, onDelete, onSyncBalance }: Props) {
  const t = useTranslations("Customers");
  const bal = safeNum(customer.currentBalance);
  const hasBalance = Math.abs(bal) > 0.01;

  const handleWhatsApp = () => {
    if (!customer.phone) return;
    const cleanPhone = customer.phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
  };

  return (
    <div className="glass-card p-6 border border-[var(--border)] card-hover-lift flex flex-col justify-between group">
      <div>
        {/* Top Header & Actions */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-black text-[var(--foreground)] tracking-tight truncate group-hover:text-[var(--color-primary)] transition-colors">
              {customer.name}
            </h3>
            {customer.phone ? (
              <a
                href={`tel:${customer.phone}`}
                className="text-xs font-mono font-semibold text-[var(--foreground)]/60 hover:text-[var(--color-primary)] flex items-center gap-1.5 mt-1 transition-colors w-fit"
              >
                <Phone size={13} className="text-[var(--color-primary)]" /> {customer.phone}
              </a>
            ) : (
              <p className="text-xs text-[var(--foreground)]/30 mt-1 italic">No phone recorded</p>
            )}
            {customer.email && (
              <a
                href={`mailto:${customer.email}`}
                className="text-xs text-[var(--foreground)]/60 hover:text-[var(--color-primary)] flex items-center gap-1.5 mt-0.5 transition-colors truncate"
              >
                <Mail size={13} className="text-[var(--foreground)]" /> {customer.email}
              </a>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(customer)}
              className="p-2 text-[var(--foreground)]/60 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-xl transition-all shadow-sm active:scale-95"
              aria-label={t("editCustomerBtn")}
              title={t("editCustomerBtn")}
            >
              <Edit2 size={15} />
            </button>
            <button
              onClick={() => onDelete(customer.id)}
              className={`p-2 rounded-xl transition-all shadow-sm active:scale-95 ${
                hasBalance
                  ? "text-[var(--foreground)]/20 cursor-not-allowed"
                  : "text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
              aria-label={t("deleteCustomerBtn")}
              disabled={hasBalance}
              title={hasBalance ? t("deleteBlocked") : t("deleteCustomerBtn")}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Quick Contact Buttons (Mobile & Desktop Friendly) */}
        {customer.phone && (
          <div className="flex items-center gap-2 mb-4 pt-2 border-t border-[var(--border)]/40">
            <a
              href={`tel:${customer.phone}`}
              className="flex-1 py-2 px-3 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--color-primary)]/10 border border-[var(--border)] text-xs font-bold text-[var(--foreground)] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Phone size={13} className="text-[var(--color-primary)]" /> Call
            </a>
            <button
              type="button"
              onClick={handleWhatsApp}
              className="flex-1 py-2 px-3 rounded-xl bg-[var(--surface-elevated)] hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-[var(--border)] text-xs font-bold text-[var(--foreground)] flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageCircle size={13} className="text-[var(--foreground)]" /> WhatsApp
            </button>
          </div>
        )}
      </div>

      {/* Balance & Credit Info Footer */}
      <div className="pt-4 border-t border-[var(--border)] space-y-2">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/60">
          <span className="flex items-center gap-1">
            <Wallet size={13} /> {t("totalOwed")}
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={`text-sm font-black font-mono ${
                bal > 0
                  ? "text-[var(--color-warning)]"
                  : bal < 0
                  ? "text-[var(--color-success)]"
                  : "text-[var(--foreground)]"
              }`}
            >
              {bal < 0 ? "-" : ""}₹{fmt(customer.currentBalance)}
            </span>
            <button
              onClick={() => onSyncBalance(customer.id)}
              disabled={syncingId === customer.id}
              className="p-1 text-[var(--foreground)]/40 hover:text-[var(--color-primary)] disabled:opacity-50 transition-colors"
              title={t("syncBalance")}
            >
              <RefreshCw size={14} className={syncingId === customer.id ? "animate-spin text-[var(--color-primary)]" : ""} />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs text-[var(--foreground)]/70">
          <span>{t("creditLimit")}</span>
          <span className="font-mono font-bold text-[var(--foreground)]">₹{fmt(customer.creditLimit)}</span>
        </div>

        {safeNum(customer.creditLimit) > 0 && (
          <div className="flex justify-between items-center text-xs text-[var(--foreground)]/70 pt-1 border-t border-[var(--border)]/40">
            <span>{t("availableCredit")}</span>
            <span className="font-mono font-bold text-[var(--color-success)]">
              ₹{fmt(Math.max(0, safeNum(customer.creditLimit) - bal))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
