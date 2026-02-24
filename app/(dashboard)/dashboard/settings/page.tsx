"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBusinessProfile, updateBusinessProfile, resetAllKhataData } from "@/lib/actions/business";
import { ConfirmDialog } from "@/lib/components/ui";
import { StaggerContainer, StaggerItem, FadeIn } from "@/lib/components/MotionWrapper";

const defaultTerms = `1. Goods once sold cannot be returned or exchanged unless damaged or defective at the time of delivery.
2. Payment is due within the agreed credit period.
3. Interest @24% p.a. will be charged on overdue payments.
4. All disputes are subject to local jurisdiction only.
5. E. & O.E.`;

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    gstin: "",
    address: "",
    phone: "",
    state: "",
    pincode: "",
    termsAndConditions: "",
    redemptionPeriodDays: 30,
    finePercentage: 2,
    fineFrequencyDays: 7,
    industryType: "custom" as "mobile" | "pharmacy" | "kirana" | "garments" | "electronics" | "custom",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const industryOptions = [
    { value: "mobile", label: "Mobile & Accessories" },
    { value: "pharmacy", label: "Pharmacy & Medical" },
    { value: "kirana", label: "Kirana & Grocery" },
    { value: "garments", label: "Garments & Apparel" },
    { value: "electronics", label: "Electronics" },
    { value: "custom", label: "Custom/Other" },
  ];

  const loadProfile = async () => {
    setLoading(true);
    const result = await getBusinessProfile();
    if (result.success && result.business) {
      setFormData({
        name: result.business.name || "",
        gstin: result.business.gstin || "",
        address: result.business.address || "",
        phone: result.business.phone || "",
        state: result.business.state || "",
        pincode: result.business.pincode || "",
        termsAndConditions: result.business.termsAndConditions || defaultTerms,
        redemptionPeriodDays: result.business.redemptionPeriodDays || 30,
        finePercentage: Number(result.business.finePercentage) || 2,
        fineFrequencyDays: result.business.fineFrequencyDays || 7,
        industryType: (result.business.industryType as any) || "custom",
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const result = await updateBusinessProfile({
      name: formData.name,
      gstin: formData.gstin || undefined,
      address: formData.address || undefined,
      phone: formData.phone || undefined,
      state: formData.state || undefined,
      pincode: formData.pincode || undefined,
      termsAndConditions: formData.termsAndConditions || undefined,
      redemptionPeriodDays: formData.redemptionPeriodDays,
      finePercentage: formData.finePercentage,
      fineFrequencyDays: formData.fineFrequencyDays,
      industryType: formData.industryType,
    });

    if (result.error) {
      setMessage(result.error);
    } else {
      setMessage("Business profile updated successfully!");
      router.refresh();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded"></div>
        <div className="h-64 bg-slate-200 animate-pulse rounded-2xl"></div>
      </div>
    );
  }

  return (
    <StaggerContainer className="space-y-6">
      <FadeIn>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Settings</h1>
        <p className="text-[var(--foreground)]/60 mt-1">Manage your business profile</p>
      </FadeIn>

      <form onSubmit={handleSubmit} className="space-y-6">
        <StaggerItem className="neo-clay p-8">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-6">Business Profile</h2>

          {message && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.includes("success") ? "bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20" : "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/20"}`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">Business Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 text-[var(--foreground)] transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-5 py-3.5 neo-input text-[var(--foreground)] transition-all font-medium focus:ring-0"
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">Industry Type</label>
              <select
                value={formData.industryType}
                onChange={(e) => setFormData({ ...formData, industryType: e.target.value as any })}
                className="w-full px-5 py-3.5 neo-input text-[var(--foreground)] transition-all font-medium focus:ring-0"
              >
                {industryOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">Business Address *</label>
              <textarea
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 text-[var(--foreground)] transition-all"
                placeholder="Shop No., Building Name, Street, Area"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">GSTIN</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 text-[var(--foreground)] transition-all"
                placeholder="27AABCU9603R1ZM"
                maxLength={15}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 text-[var(--foreground)] transition-all"
                placeholder="Maharashtra"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">Pincode</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-4 py-3 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 text-[var(--foreground)] transition-all"
                placeholder="400001"
                maxLength={6}
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--border)]/50 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 bg-[var(--color-primary)] text-white font-bold rounded-full hover:-translate-y-1 hover:bg-blue-600 disabled:opacity-50 transition-all neo-soft shadow-[0_10px_20px_rgba(59,130,246,0.3)]"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </StaggerItem>

        <StaggerItem className="neo-clay p-8">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">Default Terms & Conditions</h2>
          <p className="text-sm text-[var(--foreground)]/60 mb-6">These terms will appear at the bottom of your invoices.</p>

          <textarea
            value={formData.termsAndConditions}
            onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
            rows={6}
            className="w-full px-4 py-3 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 text-[var(--foreground)] transition-all"
            placeholder="Enter terms and conditions..."
          />
        </StaggerItem>

        <StaggerItem className="neo-clay p-8">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">Late Payment Fine Settings</h2>
          <p className="text-sm text-[var(--foreground)]/60 mb-6">Configure automatic fine calculation for overdue Khata payments.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">Redemption Period (Days)</label>
              <input
                type="number"
                min="0"
                value={formData.redemptionPeriodDays}
                onChange={(e) => setFormData({ ...formData, redemptionPeriodDays: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 text-[var(--foreground)] transition-all"
              />
              <p className="text-xs text-[var(--foreground)]/50 mt-2">Days before fines apply</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">Fine Percentage (%)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.finePercentage}
                onChange={(e) => setFormData({ ...formData, finePercentage: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 text-[var(--foreground)] transition-all"
              />
              <p className="text-xs text-[var(--foreground)]/50 mt-2">% of invoice value per period</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-2">Fine Frequency (Days)</label>
              <input
                type="number"
                min="1"
                value={formData.fineFrequencyDays}
                onChange={(e) => setFormData({ ...formData, fineFrequencyDays: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 bg-[var(--foreground)]/5 border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 text-[var(--foreground)] transition-all"
              />
              <p className="text-xs text-[var(--foreground)]/50 mt-2">How often to charge fine</p>
            </div>
          </div>

          <div className="mt-6 p-5 bg-[var(--color-primary)]/10 rounded-2xl border-l-4 border-[var(--color-primary)] neo-soft">
            <p className="text-sm font-medium text-[var(--foreground)]/80">
              <span className="font-bold text-[var(--color-primary)] mr-2">Example:</span> With {formData.redemptionPeriodDays} days grace, {formData.finePercentage}% per {formData.fineFrequencyDays} days -
              A ₹10,000 invoice overdue by 44 days would incur: ₹{Math.round(10000 * (formData.finePercentage / 100) * Math.floor((44 - formData.redemptionPeriodDays) / formData.fineFrequencyDays) * 100) / 100} in fines.
            </p>
          </div>
        </StaggerItem>

        <StaggerItem className="neo-clay p-8 border border-[var(--color-danger)]/10">
          <h2 className="text-xl font-bold text-[var(--color-danger)] mb-2">Danger Zone</h2>
          <p className="text-sm font-medium text-[var(--foreground)]/60 mb-6">
            This will permanently delete all invoices, transactions, and reset all customer Khata balances to zero.
            This action cannot be undone.
          </p>
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-6 py-3.5 bg-[var(--color-danger)]/10 text-[var(--color-danger)] font-bold rounded-full hover:bg-[var(--color-danger)] hover:text-white transition-all hover:-translate-y-1"
          >
            Reset All Khata Data
          </button>
        </StaggerItem>
      </form>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Reset All Khata Data</h2>
            <p className="text-sm text-slate-600 mb-4">
              This will permanently delete ALL invoices and transactions, and reset ALL customer balances to zero.
              Your business profile will be preserved. This cannot be undone.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Enter your password to confirm
              </label>
              <input
                type="password"
                value={resetPassword}
                onChange={(e) => {
                  setResetPassword(e.target.value);
                  setResetError("");
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Your login password"
              />
              {resetError && <p className="text-sm text-red-600 mt-1">{resetError}</p>}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false);
                  setResetPassword("");
                  setResetError("");
                }}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!resetPassword) {
                    setResetError("Please enter your password");
                    return;
                  }
                  setResetting(true);
                  setResetError("");
                  const result = await resetAllKhataData(resetPassword);
                  if (result.error) {
                    setResetError(result.error);
                    setResetting(false);
                  } else {
                    setMessage(result.message || "Data reset successfully!");
                    setResetting(false);
                    setShowResetConfirm(false);
                    setResetPassword("");
                    router.refresh();
                  }
                }}
                disabled={resetting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
              >
                {resetting ? "Resetting..." : "Yes, Reset Everything"}
              </button>
            </div>
          </div>
        </div>
      )}
    </StaggerContainer>
  );
}
