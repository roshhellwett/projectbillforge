"use client";

import { useState, useEffect, useCallback } from "react";
import { getBusinessProfile, updateBusinessProfile } from "@/lib/actions/business";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { DEFAULT_TERMS } from "@/lib/constants";
import type { IndustryType } from "@/lib/types";

interface FormData {
  name: string;
  gstin: string;
  address: string;
  phone: string;
  state: string;
  pincode: string;
  termsAndConditions: string;
  redemptionPeriodDays: number;
  finePercentage: number;
  fineFrequencyDays: number;
  industryType: IndustryType;
}

interface ValidationErrors {
  gstin?: string;
  phone?: string;
  pincode?: string;
}

function isIndustryType(v: string): v is IndustryType {
  return ["mobile", "pharmacy", "kirana", "garments", "electronics", "custom"].includes(v);
}

const initialForm: FormData = {
  name: "", gstin: "", address: "", phone: "", state: "", pincode: "",
  termsAndConditions: DEFAULT_TERMS,
  redemptionPeriodDays: 30, finePercentage: 2, fineFrequencyDays: 7,
  industryType: "custom",
};

export function useSettingsForm() {
  const t = useTranslations("Settings");
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [originalData, setOriginalData] = useState<FormData>(initialForm);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isOAuthUser, setIsOAuthUser] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getBusinessProfile();
      if (result.success && result.business) {
        const b = result.business;
        const data: FormData = {
          name: b.name || "",
          gstin: b.gstin || "",
          address: b.address || "",
          phone: b.phone || "",
          state: b.state || "",
          pincode: b.pincode || "",
          termsAndConditions: b.termsAndConditions || DEFAULT_TERMS,
          redemptionPeriodDays: b.redemptionPeriodDays ?? 30,
          finePercentage: Number(b.finePercentage) || 2,
          fineFrequencyDays: b.fineFrequencyDays ?? 7,
          industryType: b.industryType && isIndustryType(b.industryType) ? b.industryType : "custom",
        };
        setFormData(data);
        setOriginalData(data);
        setIsOAuthUser(!b.passwordHash || b.passwordHash.length === 0);
      } else if (result.error) {
        addToast(result.error, "error");
      }
    } catch {
      addToast("Could not load settings. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const setField = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setValidationErrors(prev => ({ ...prev, [key]: undefined }));
  }, []);

  const isDirty = Object.keys(originalData).some(k => {
    const key = k as keyof FormData;
    return String(formData[key]) !== String(originalData[key]);
  });

  const validate = (): boolean => {
    const errs: ValidationErrors = {};
    if (formData.gstin && !/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z]\d$/.test(formData.gstin)) {
      errs.gstin = "Invalid GSTIN format";
    }
    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ""))) {
      errs.phone = "Enter a valid 10-digit Indian mobile number";
    }
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      errs.pincode = "Pincode must be 6 digits";
    }
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    const changed: Record<string, unknown> = {};
    (Object.keys(formData) as (keyof FormData)[]).forEach(k => {
      if (String(formData[k]) !== String(originalData[k])) {
        changed[k] = formData[k];
      }
    });
    if (Object.keys(changed).length === 0) {
      addToast("No changes to save", "info");
      setSaving(false);
      return;
    }
    try {
      const result = await updateBusinessProfile(changed as Parameters<typeof updateBusinessProfile>[0]);
      if (result.error) {
        addToast(result.error, "error");
      } else {
        addToast(t("successMessage"), "success");
        setOriginalData({ ...formData });
        router.refresh();
      }
    } catch {
      addToast("Could not save settings. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  return {
    formData, setField, loading, saving, isDirty, validationErrors, isOAuthUser,
    validate, save, loadProfile,
  };
}
