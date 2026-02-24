"use client";

import { useState, useEffect } from "react";
import { getBusinessProfile, updateBusinessProfile, resetAllKhataData } from "@/lib/actions/business";
import { ConfirmDialog } from "@/lib/components/ui";

const defaultTerms = `1. Goods once sold cannot be returned or exchanged unless damaged or defective at the time of delivery.
2. Payment is due within the agreed credit period.
3. Interest @24% p.a. will be charged on overdue payments.
4. All disputes are subject to local jurisdiction only.
5. E. & O.E.`;

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Manage your business profile</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Business Profile</h2>
          
          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes("success") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Business Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Industry Type</label>
              <select
                value={formData.industryType}
                onChange={(e) => setFormData({ ...formData, industryType: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {industryOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Business Address *</label>
              <textarea
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Shop No., Building Name, Street, Area"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">GSTIN</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="27AABCU9603R1ZM"
                maxLength={15}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Maharashtra"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="400001"
                maxLength={6}
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Default Terms & Conditions</h2>
          <p className="text-sm text-slate-500 mb-4">These terms will appear at the bottom of your invoices.</p>
          
          <textarea
            value={formData.termsAndConditions}
            onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
            rows={6}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Enter terms and conditions..."
          />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Late Payment Fine Settings</h2>
          <p className="text-sm text-slate-500 mb-4">Configure automatic fine calculation for overdue Khata payments.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Redemption Period (Days)</label>
              <input
                type="number"
                min="0"
                value={formData.redemptionPeriodDays}
                onChange={(e) => setFormData({ ...formData, redemptionPeriodDays: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">Days before fines apply</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fine Percentage (%)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.finePercentage}
                onChange={(e) => setFormData({ ...formData, finePercentage: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">% of invoice value per period</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fine Frequency (Days)</label>
              <input
                type="number"
                min="1"
                value={formData.fineFrequencyDays}
                onChange={(e) => setFormData({ ...formData, fineFrequencyDays: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">How often to charge fine</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Example:</strong> With {formData.redemptionPeriodDays} days grace, {formData.finePercentage}% per {formData.fineFrequencyDays} days - 
              A ₹10,000 invoice overdue by 44 days would incur: ₹{Math.round(10000 * (formData.finePercentage / 100) * Math.floor((44 - formData.redemptionPeriodDays) / formData.fineFrequencyDays) * 100) / 100} in fines.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
          <p className="text-sm text-slate-500 mb-4">
            This will permanently delete all invoices, transactions, and reset all customer Khata balances to zero. 
            This action cannot be undone.
          </p>
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
          >
            Reset All Khata Data
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={showResetConfirm}
        title="Reset All Khata Data"
        message="This will permanently delete ALL invoices and transactions, and reset ALL customer balances to zero. Your business profile will be preserved. This cannot be undone. Are you sure?"
        confirmLabel={resetting ? "Resetting..." : "Yes, Reset Everything"}
        onConfirm={async () => {
          setResetting(true);
          const result = await resetAllKhataData();
          if (result.error) {
            setMessage(result.error);
          } else {
            setMessage(result.message || "Data reset successfully!");
          }
          setResetting(false);
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
}
