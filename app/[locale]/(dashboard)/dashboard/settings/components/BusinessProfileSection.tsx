"use client";

import { useTranslations } from "next-intl";
import { INDIAN_STATES, INDUSTRY_OPTIONS } from "@/lib/constants";
import type { IndustryType } from "@/lib/types";
import { Building2, Phone, MapPin, Hash } from "lucide-react";

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
  const inputClass = "w-full px-4 py-3 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--color-primary)] text-sm text-[var(--foreground)] transition-all min-h-[44px] shadow-sm";

  return (
    <div className="glass-card p-6 sm:p-8 border border-[var(--border)] card-hover-lift">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="p-2.5 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          <Building2 size={18} />
        </div>
        <div>
          <h2 className="text-lg font-black text-[var(--foreground)] tracking-tight">{t("businessName")}</h2>
          <p className="text-xs text-[var(--foreground)]/60">Manage your core enterprise identity & location details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/70 mb-2">
            {t("businessName")} *
          </label>
          <input
            type="text"
            required
            value={data.name}
            onChange={e => onChange("name", e.target.value)}
            className={inputClass}
            placeholder="My Enterprise Name"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/70 mb-2">
            {t("phone")}
          </label>
          <div className="relative">
            <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40 pointer-events-none" />
            <input
              type="tel"
              inputMode="tel"
              value={data.phone}
              onChange={e => onChange("phone", e.target.value)}
              className={`${inputClass} pl-10 ${errors.phone ? "border-[var(--foreground)] ring-1 ring-[var(--foreground)]" : ""}`}
              placeholder="+91 9876543210"
            />
          </div>
          {errors.phone && <p className="text-xs text-[var(--foreground)] font-bold italic mt-1.5">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/70 mb-2">
            {t("industryType")}
          </label>
          <select
            value={data.industryType}
            onChange={e => onChange("industryType", isIndustryType(e.target.value) ? e.target.value : "custom")}
            className={inputClass}
          >
            {INDUSTRY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/70 mb-2">
            {t("gstin")}
          </label>
          <div className="relative">
            <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40 pointer-events-none" />
            <input
              type="text"
              value={data.gstin}
              onChange={e => onChange("gstin", e.target.value.toUpperCase())}
              className={`${inputClass} pl-10 font-mono font-bold ${errors.gstin ? "border-[var(--foreground)] ring-1 ring-[var(--foreground)]" : ""}`}
              placeholder="27AABCU9603R1ZM"
              maxLength={15}
            />
          </div>
          {errors.gstin && <p className="text-xs text-[var(--foreground)] font-bold italic mt-1.5">{errors.gstin}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/70 mb-2">
            {t("address")} *
          </label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3.5 top-3.5 text-[var(--foreground)]/40 pointer-events-none" />
            <textarea
              required
              value={data.address}
              onChange={e => onChange("address", e.target.value)}
              rows={2}
              className={`${inputClass} pl-10 py-3`}
              placeholder="Shop No., Building Name, Street, Area"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/70 mb-2">
            {t("state")}
          </label>
          <select
            value={data.state}
            onChange={e => onChange("state", e.target.value)}
            className={inputClass}
          >
            <option value="">{t("nothingSelected")}</option>
            {INDIAN_STATES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/70 mb-2">
            {t("pincode")}
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={data.pincode}
            onChange={e => onChange("pincode", e.target.value)}
            className={`${inputClass} font-mono font-bold ${errors.pincode ? "border-[var(--foreground)] ring-1 ring-[var(--foreground)]" : ""}`}
            placeholder="400001"
            maxLength={6}
          />
          {errors.pincode && <p className="text-xs text-[var(--foreground)] font-bold italic mt-1.5">{errors.pincode}</p>}
        </div>
      </div>
    </div>
  );
}
