"use client";

import { useState } from "react";
import { useSettingsForm } from "./hooks/useSettingsForm";
import { SettingsHeader } from "./components/SettingsHeader";
import { BusinessProfileSection } from "./components/BusinessProfileSection";
import { TermsSection } from "./components/TermsSection";
import { FineSettingsSection } from "./components/FineSettingsSection";
import { DangerZoneSection } from "./components/DangerZoneSection";
import { AccountPreferencesSection } from "./components/AccountPreferencesSection";
import { PasswordSection } from "./components/PasswordSection";
import { AboutSection } from "./components/AboutSection";
import { StaggerContainer, StaggerItem, FadeIn } from "@/components/ui/MotionWrapper";
import { Building2, Calculator, ShieldCheck, Info } from "lucide-react";

export default function SettingsPage() {
  const {
    formData, setField, loading, saving, isDirty,
    validationErrors, save,
  } = useSettingsForm();

  const [activeTab, setActiveTab] = useState<"profile" | "fines" | "security" | "about">("profile");

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 w-full bg-[var(--surface-elevated)] animate-pulse rounded-3xl" />
        <div className="h-12 w-full max-w-md bg-[var(--surface-elevated)] animate-pulse rounded-2xl" />
        <div className="h-96 bg-[var(--surface-elevated)] animate-pulse rounded-3xl" />
      </div>
    );
  }

  const tabs = [
    { id: "profile" as const, label: "Business Profile", icon: Building2, desc: "Identity & GSTIN" },
    { id: "fines" as const, label: "Udhaar & Fines", icon: Calculator, desc: "Interest & Grace Days" },
    { id: "security" as const, label: "Security & Account", icon: ShieldCheck, desc: "Password & Reset" },
    { id: "about" as const, label: "About BillForge", icon: Info, desc: "Version & Support" },
  ];

  return (
    <StaggerContainer className="space-y-6 sm:space-y-8">
      <SettingsHeader saving={saving} isDirty={isDirty} onSave={save} />

      {/* Tab Pill Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--border)] scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2.5 shrink-0 border cursor-pointer ${
                isActive
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md border-transparent scale-[1.02]"
                  : "bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--foreground)]/70 border-[var(--border)]"
              }`}
            >
              <Icon size={16} />
              <div className="text-left">
                <div className="leading-none">{tab.label}</div>
                <div className={`text-[10px] mt-0.5 font-normal ${isActive ? "text-white/80" : "text-[var(--foreground)]/40"}`}>
                  {tab.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <form
        onSubmit={e => { e.preventDefault(); save(); }}
        className="space-y-6"
      >
        {activeTab === "profile" && (
          <FadeIn className="space-y-6">
            <BusinessProfileSection
              data={formData}
              errors={validationErrors}
              onChange={(k, v) => setField(k as any, v as any)}
            />
            <TermsSection
              value={formData.termsAndConditions}
              onChange={v => setField("termsAndConditions", v)}
            />
          </FadeIn>
        )}

        {activeTab === "fines" && (
          <FadeIn className="space-y-6">
            <FineSettingsSection
              redemptionPeriodDays={formData.redemptionPeriodDays}
              finePercentage={formData.finePercentage}
              fineFrequencyDays={formData.fineFrequencyDays}
              onChange={setField}
            />
          </FadeIn>
        )}

        {activeTab === "security" && (
          <FadeIn className="space-y-6">
            <PasswordSection />
            <AccountPreferencesSection />
            <DangerZoneSection />
          </FadeIn>
        )}

        {activeTab === "about" && (
          <FadeIn className="space-y-6">
            <AboutSection />
          </FadeIn>
        )}

        {/* Global Save Button for Dirty Forms */}
        {isDirty && (activeTab === "profile" || activeTab === "fines") && (
          <div className="sticky bottom-4 z-40 p-4 rounded-2xl glass-card border border-[var(--border)] shadow-2xl flex items-center justify-between bg-[var(--surface-elevated)]/95 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[var(--foreground)]">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100 animate-ping" />
              <span>You have unsaved configuration changes</span>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 hover:brightness-110 text-white dark:text-zinc-900 font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95"
            >
              {saving ? "Saving..." : "Save Changes Now"}
            </button>
          </div>
        )}
      </form>
    </StaggerContainer>
  );
}
