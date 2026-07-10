"use client";

import { useTranslations } from "next-intl";
import { INDIAN_STATES, INDUSTRY_OPTIONS } from "@/lib/constants";
import type { IndustryType } from "@/lib/types";

function isIndustryType(v: string): v is IndustryType {
  return ["mobile", "pharmacy", "kirana", "garments", "electronics", "custom"].includes(v);
}

interface Props {
  data: {
    name: string; phone: string; industryType: IndustryType;
    address: string; gstin: string; state: string; pincode: string;
  };
  errors: { gstin?: string; phone?: string; pincode?: string };
  onChange: (key: string, value: string | IndustryType) => void;
}

export function BusinessProfileSection({ data, errors, onChange }: Props) {
  const t = useTranslations("Settings");
  const inputClass = "w-full px-4 py-3 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 text-[var(--foreground)] transition-all";

  return (
    <div className="glass-card p-5 sm:p-8">
      <h2 className="text-lg font-semibold text-[var(--foreground)] mb-6">{t("businessName")}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">{t("businessName")} *</label>
          <input type="text" required value={data.name} onChange={e => onChange("name", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">{t("phone")}</label>
          <input type="tel" value={data.phone} onChange={e => onChange("phone", e.target.value)} className={`${inputClass} ${errors.phone ? "border-[var(--color-danger)]/50" : ""}`} placeholder="+91 9876543210" />
          {errors.phone && <p className="text-xs text-[var(--color-danger)] mt-1">{errors.phone}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">{t("industryType")}</label>
          <select value={data.industryType} onChange={e => onChange("industryType", isIndustryType(e.target.value) ? e.target.value : "custom")} className={inputClass}>
            {INDUSTRY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">{t("address")} *</label>
          <textarea required value={data.address} onChange={e => onChange("address", e.target.value)} rows={2} className={inputClass} placeholder="Shop No., Building Name, Street, Area" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">{t("gstin")}</label>
          <input type="text" value={data.gstin} onChange={e => onChange("gstin", e.target.value.toUpperCase())} className={`${inputClass} ${errors.gstin ? "border-[var(--color-danger)]/50" : ""}`} placeholder="27AABCU9603R1ZM" maxLength={15} />
          {errors.gstin && <p className="text-xs text-[var(--color-danger)] mt-1">{errors.gstin}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">{t("state")}</label>
          <select value={data.state} onChange={e => onChange("state", e.target.value)} className={inputClass}>
            <option value="">{t("nothingSelected")}</option>
            {INDIAN_STATES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">{t("pincode")}</label>
          <input type="text" value={data.pincode} onChange={e => onChange("pincode", e.target.value)} className={`${inputClass} ${errors.pincode ? "border-[var(--color-danger)]/50" : ""}`} placeholder="400001" maxLength={6} inputMode="numeric" pattern="[0-9]{6}" />
          {errors.pincode && <p className="text-xs text-[var(--color-danger)] mt-1">{errors.pincode}</p>}
        </div>
      </div>
    </div>
  );
}
