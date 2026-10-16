"use client";

import { useTranslations } from "next-intl";
import { INDIAN_STATES, INDUSTRY_OPTIONS } from "@/lib/constants";
import type { IndustryType } from "@/lib/types";
import { Building2, Phone, MapPin, Hash } from "lucide-react";
import { useId } from "react";

function isIndustryType(v: string): v is IndustryType {
  return ["mobile", "pharmacy", "kirana", "garments", "electronics", "custom"].includes(v);
}

interface Props {
  data: {
    name: string; phone: string; industryType: IndustryType;
    address: string; gstin: string; state: string; pincode: string;
  };
  errors: { name?: string; address?: string; gstin?: string; phone?: string; pincode?: string };
  onChange: (key: string, value: string | IndustryType) => void;
}

export function BusinessProfileSection({ data, errors, onChange }: Props) {
  const t = useTranslations("Settings");
  const idPrefix = useId();
  const inputClass = "w-full px-4 py-3 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--color-primary)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20 text-sm text-[var(--foreground)] transition-all min-h-[44px] shadow-sm";
  const industryLabels: Record<IndustryType, string> = {
    mobile: t("industryMobile"),
    pharmacy: t("industryPharmacy"),
    kirana: t("industryKirana"),
    garments: t("industryGarments"),
    electronics: t("industryElectronics"),
    custom: t("industryCustom"),
  };

  const fieldError = (field: "name" | "address" | "phone" | "gstin" | "pincode") => errors[field] ? `${idPrefix}-${field}-error` : undefined;

  return (
    <section aria-labelledby={`${idPrefix}-title`} className="glass-card p-5 sm:p-8 border border-[var(--border)]">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="p-2.5 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          <Building2 size={18} aria-hidden="true" />
        </div>
        <div>
          <h2 id={`${idPrefix}-title`} className="text-lg font-black text-[var(--foreground)] tracking-tight">{t("businessProfileTitle")}</h2>
          <p className="text-xs text-[var(--foreground)]/60">{t("businessProfileDescription")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor={`${idPrefix}-name`} className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/70 mb-2">
            {t("businessName")} *
          </label>
          <input
            id={`${idPrefix}-name`}
            type="text"
            required
            aria-required="true"
            value={data.name}
            onChange={e => onChange("name", e.target.value)}
            className={`${inputClass} ${errors.name ? "border-[var(--color-danger)] ring-1 ring-[var(--color-danger)]/30" : ""}`}
            placeholder={t("businessNamePlaceholder")}
            autoComplete="organization"
            maxLength={200}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={fieldError("name")}
          />
          {errors.name && <p id={fieldError("name")} role="alert" className="text-xs text-[var(--color-danger)] font-semibold mt-1.5">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor={`${idPrefix}-phone`} className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/70 mb-2">
            {t("phone")}
          </label>
          <div className="relative">
            <Phone size={16} aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40 pointer-events-none" />
            <input
              id={`${idPrefix}-phone`}
              type="tel"
              inputMode="numeric"
              value={data.phone}
              onChange={e => onChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
              className={`${inputClass} pl-10 ${errors.phone ? "border-[var(--color-danger)] ring-1 ring-[var(--color-danger)]/30" : ""}`}
              placeholder={t("phonePlaceholder")}
              autoComplete="tel-national"
              maxLength={10}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={fieldError("phone")}
            />
          </div>
          {errors.phone && <p id={fieldError("phone")} role="alert" className="text-xs text-[var(--color-danger)] font-semibold mt-1.5">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor={`${idPrefix}-industry`} className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/70 mb-2">
            {t("industryType")}
          </label>
          <select
            id={`${idPrefix}-industry`}
            value={data.industryType}
            onChange={e => onChange("industryType", isIndustryType(e.target.value) ? e.target.value : "custom")}
            className={inputClass}
          >
            {INDUSTRY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{industryLabels[opt.value]}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${idPrefix}-gstin`} className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/70 mb-2">
            {t("gstin")}
          </label>
          <div className="relative">
            <Hash size={16} aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40 pointer-events-none" />
            <input
              id={`${idPrefix}-gstin`}
              type="text"
              value={data.gstin}
              onChange={e => onChange("gstin", e.target.value.toUpperCase())}
              className={`${inputClass} pl-10 font-mono font-bold ${errors.gstin ? "border-[var(--color-danger)] ring-1 ring-[var(--color-danger)]/30" : ""}`}
              placeholder={t("gstinPlaceholder")}
              maxLength={15}
              autoComplete="off"
              spellCheck={false}
              aria-invalid={Boolean(errors.gstin)}
              aria-describedby={fieldError("gstin")}
            />
          </div>
          {errors.gstin && <p id={fieldError("gstin")} role="alert" className="text-xs text-[var(--color-danger)] font-semibold mt-1.5">{errors.gstin}</p>}
        </div>

        <div className="md:col-span-2">
          <label htmlFor={`${idPrefix}-address`} className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/70 mb-2">
            {t("address")} *
          </label>
          <div className="relative">
            <MapPin size={16} aria-hidden="true" className="absolute left-3.5 top-3.5 text-[var(--foreground)]/40 pointer-events-none" />
            <textarea
              id={`${idPrefix}-address`}
              required
              aria-required="true"
              value={data.address}
              onChange={e => onChange("address", e.target.value)}
              rows={2}
              className={`${inputClass} pl-10 py-3 ${errors.address ? "border-[var(--color-danger)] ring-1 ring-[var(--color-danger)]/30" : ""}`}
              placeholder={t("addressPlaceholder")}
              autoComplete="street-address"
              maxLength={500}
              aria-invalid={Boolean(errors.address)}
              aria-describedby={fieldError("address")}
            />
          </div>
          {errors.address && <p id={fieldError("address")} role="alert" className="text-xs text-[var(--color-danger)] font-semibold mt-1.5">{errors.address}</p>}
        </div>

        <div>
          <label htmlFor={`${idPrefix}-state`} className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/70 mb-2">
            {t("state")}
          </label>
          <select
            id={`${idPrefix}-state`}
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
          <label htmlFor={`${idPrefix}-pincode`} className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/70 mb-2">
            {t("pincode")}
          </label>
          <input
            id={`${idPrefix}-pincode`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={data.pincode}
            onChange={e => onChange("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
            className={`${inputClass} font-mono font-bold ${errors.pincode ? "border-[var(--color-danger)] ring-1 ring-[var(--color-danger)]/30" : ""}`}
            placeholder={t("pincodePlaceholder")}
            maxLength={6}
            autoComplete="postal-code"
            aria-invalid={Boolean(errors.pincode)}
            aria-describedby={fieldError("pincode")}
          />
          {errors.pincode && <p id={fieldError("pincode")} role="alert" className="text-xs text-[var(--color-danger)] font-semibold mt-1.5">{errors.pincode}</p>}
        </div>
      </div>
    </section>
  );
}
