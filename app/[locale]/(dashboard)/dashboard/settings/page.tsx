"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useSettingsForm } from "./hooks/useSettingsForm";
import { SettingsHeader } from "./components/SettingsHeader";
import { BusinessProfileSection } from "./components/BusinessProfileSection";
import { TermsSection } from "./components/TermsSection";
import { FineSettingsSection } from "./components/FineSettingsSection";
import { DangerZoneSection } from "./components/DangerZoneSection";
import { AccountPreferencesSection } from "./components/AccountPreferencesSection";
import { PasswordSection } from "./components/PasswordSection";
import { DataPrivacySection } from "./components/DataPrivacySection";
import { AboutSection } from "./components/AboutSection";
import { StaggerContainer, FadeIn } from "@/components/ui/MotionWrapper";
import { Building2, Calculator, Shield, Info, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

type SettingsTab = "profile" | "fines" | "security" | "about";

export default function SettingsPage() {
  const t = useTranslations("Settings");
  const {
    formData, setField, loading, saving, isDirty,
    validationErrors, save, loadProfile, loadError, saveError, saveSuccess, isOAuthUser,
  } = useSettingsForm();

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const tabRefs = useRef<Record<SettingsTab, HTMLButtonElement | null>>({
    profile: null,
    fines: null,
    security: null,
    about: null,
  });
  const loadErrorRef = useRef<HTMLDivElement>(null);
  const tabPanelPrefix = useId();

  const tabs = [
    { id: "profile" as const, label: t("businessProfileTab"), icon: Building2, desc: t("businessProfileTabDesc") },
    { id: "fines" as const, label: t("billingRulesTab"), icon: Calculator, desc: t("billingRulesTabDesc") },
    { id: "security" as const, label: t("accountSecurityTab"), icon: Shield, desc: t("accountSecurityTabDesc") },
    { id: "about" as const, label: t("aboutTab"), icon: Info, desc: t("aboutTabDesc") },
  ];

  useEffect(() => {
    if (!loadError) return;
    requestAnimationFrame(() => loadErrorRef.current?.focus());
  }, [loadError]);

  useEffect(() => {
    if (!saveError) return;
    requestAnimationFrame(() => {
      document.querySelector<HTMLElement>("[data-settings-save-status]")?.focus();
    });
  }, [saveError]);

  if (loading) {
    return (
      <div className="space-y-6" role="status" aria-live="polite" aria-busy="true">
        <span className="sr-only">{t("loading")}</span>
        <div className="h-24 w-full bg-[var(--surface-elevated)] animate-pulse rounded-3xl" />
        <div className="h-12 w-full max-w-md bg-[var(--surface-elevated)] animate-pulse rounded-2xl" />
        <div className="h-96 bg-[var(--surface-elevated)] animate-pulse rounded-3xl" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        ref={loadErrorRef}
        tabIndex={-1}
        role="alert"
        className="glass-card max-w-2xl p-6 sm:p-8 border border-[var(--color-danger)]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
      >
        <h1 className="text-xl sm:text-2xl font-black text-[var(--foreground)]">{t("loadErrorTitle")}</h1>
        <p className="mt-2 text-sm text-[var(--foreground)]/70">{loadError}</p>
        <button
          type="button"
          onClick={() => void loadProfile()}
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] dark:bg-zinc-100 dark:text-zinc-900"
        >
          <RefreshCw size={16} aria-hidden="true" />
          {t("retry")}
        </button>
      </div>
    );
  }

  const moveToTab = (tab: SettingsTab) => {
    setActiveTab(tab);
    requestAnimationFrame(() => tabRefs.current[tab]?.focus());
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    let nextIndex = currentIndex;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    moveToTab(tabs[nextIndex].id);
  };

  const activePanelId = `${tabPanelPrefix}-panel`;

  return (
    <StaggerContainer className="space-y-6 sm:space-y-8">
      <SettingsHeader
        saving={saving}
        isDirty={isDirty}
        onSave={() => void save()}
        saveError={saveError}
        saveSuccess={saveSuccess}
      />

      <div
        role="tablist"
        aria-label={t("tabListLabel")}
        className="flex items-stretch gap-2 overflow-x-auto border-b border-[var(--border)] pb-2 scrollbar-none"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={element => { tabRefs.current[tab.id] = element; }}
              type="button"
              id={`${tabPanelPrefix}-${tab.id}-tab`}
              role="tab"
              aria-selected={isActive}
              aria-controls={activePanelId}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={handleTabKeyDown}
              className={`min-h-11 px-4 sm:px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2.5 shrink-0 border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] ${
                isActive
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md border-transparent scale-[1.02]"
                  : "bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--foreground)]/70 border-[var(--border)]"
              }`}
            >
              <Icon size={16} aria-hidden="true" />
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

      <div
        id={activePanelId}
        role="tabpanel"
        aria-labelledby={`${tabPanelPrefix}-${activeTab}-tab`}
        tabIndex={-1}
        className="space-y-6 focus-visible:outline-none"
      >
        {activeTab === "profile" && (
          <form onSubmit={event => { event.preventDefault(); void save(); }} className="space-y-6">
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
          </form>
        )}

        {activeTab === "fines" && (
          <form onSubmit={event => { event.preventDefault(); void save(); }} className="space-y-6">
            <FadeIn className="space-y-6">
              <FineSettingsSection
                redemptionPeriodDays={formData.redemptionPeriodDays}
                finePercentage={formData.finePercentage}
                fineFrequencyDays={formData.fineFrequencyDays}
                onChange={setField}
              />
            </FadeIn>
          </form>
        )}

        {activeTab === "security" && (
          <FadeIn className="space-y-6">
            <PasswordSection isOAuthUser={isOAuthUser} />
            <AccountPreferencesSection />
            <DataPrivacySection />
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
          <div className="sticky bottom-4 z-40 p-4 rounded-2xl glass-card border border-[var(--border)] shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--surface-elevated)]/95 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[var(--foreground)]" role="status" aria-live="polite">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 dark:bg-zinc-100 animate-ping" />
              <span>{t("unsavedChanges")}</span>
            </div>
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2.5 bg-zinc-900 dark:bg-zinc-100 hover:brightness-110 text-white dark:text-zinc-900 font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? t("saving") : t("saveChanges")}
            </button>
          </div>
        )}
      </div>
    </StaggerContainer>
  );
}
