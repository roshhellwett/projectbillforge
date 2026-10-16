"use client";

import { useState, useEffect, useCallback } from "react";
import { getBusinessProfile, updateBusinessProfile } from "@/lib/actions/business";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
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
  name?: string;
  address?: string;
  gstin?: string;
  phone?: string;
  pincode?: string;
}

function isIndustryType(v: string): v is IndustryType {
  return ["mobile", "pharmacy", "kirana", "garments", "electronics", "custom"].includes(v);
}

const initialForm: FormData = {
  name: "", gstin: "", address: "", phone: "", state: "", pincode: "",
  termsAndConditions: "",
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setSaveError(null);
    setSaveSuccess(null);
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
          termsAndConditions: b.termsAndConditions ?? "",
          redemptionPeriodDays: b.redemptionPeriodDays ?? 30,
          finePercentage: Number(b.finePercentage) || 2,
          fineFrequencyDays: b.fineFrequencyDays ?? 7,
          industryType: b.industryType && isIndustryType(b.industryType) ? b.industryType : "custom",
        };
        setFormData(data);
        setOriginalData(data);
         setIsOAuthUser(!result.hasPassword);
      } else {
        const message = t("loadError");
        setLoadError(message);
        addToast(message, "error");
      }
    } catch {
      const message = t("loadError");
      setLoadError(message);
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [addToast, t]);

  useEffect(() => { void loadProfile(); }, [loadProfile]);

  const setField = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setValidationErrors(prev => ({ ...prev, [key]: undefined }));
    setSaveError(null);
    setSaveSuccess(null);
  }, []);

  const isDirty = Object.keys(originalData).some(k => {
    const key = k as keyof FormData;
    return String(formData[key]) !== String(originalData[key]);
  });

  const validate = (): boolean => {
    const errs: ValidationErrors = {};
    if (!formData.name.trim()) {
      errs.name = t("validationName");
    }
    if (!formData.address.trim()) {
      errs.address = t("validationAddress");
    }
    if (formData.gstin && !/^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z]\d$/.test(formData.gstin)) {
      errs.gstin = t("validationGstin");
    }
    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ""))) {
      errs.phone = t("validationPhone");
    }
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      errs.pincode = t("validationPincode");
    }
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const save = async () => {
    if (saving) return;
    setSaveError(null);
    setSaveSuccess(null);
    if (!validate()) {
      setSaveError(t("validationSummary"));
      return;
    }

    setSaving(true);
    const changed: Record<string, unknown> = {};
    (Object.keys(formData) as (keyof FormData)[]).forEach(k => {
      if (String(formData[k]) !== String(originalData[k])) {
        changed[k] = formData[k];
      }
    });
    if (Object.keys(changed).length === 0) {
      addToast(t("noChanges"), "info");
      setSaving(false);
      return;
    }
    try {
      const result = await updateBusinessProfile(changed as Parameters<typeof updateBusinessProfile>[0]);
      if ("success" in result && result.success) {
        const message = t("successMessage");
        setSaveSuccess(message);
        addToast(message, "success");
        setOriginalData({ ...formData });
        router.refresh();
      } else {
        const message = t("saveError");
        setSaveError(message);
        addToast(message, "error");
      }
    } catch {
      const message = t("saveError");
      setSaveError(message);
      addToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  return {
    formData, setField, loading, saving, isDirty, validationErrors, isOAuthUser,
    loadError, saveError, saveSuccess, validate, save, loadProfile,
  };
}
