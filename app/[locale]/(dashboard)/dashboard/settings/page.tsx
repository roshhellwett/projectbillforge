"use client";

import { useSettingsForm } from "./hooks/useSettingsForm";
import { SettingsHeader } from "./components/SettingsHeader";
import { BusinessProfileSection } from "./components/BusinessProfileSection";
import { TermsSection } from "./components/TermsSection";
import { FineSettingsSection } from "./components/FineSettingsSection";
import { DangerZoneSection } from "./components/DangerZoneSection";
import { AccountPreferencesSection } from "./components/AccountPreferencesSection";
import { AboutSection } from "./components/AboutSection";
import { StaggerContainer, StaggerItem } from "@/components/ui/MotionWrapper";

export default function SettingsPage() {
  const {
    formData, setField, loading, saving, isDirty,
    validationErrors, save,
  } = useSettingsForm();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-[var(--foreground)]/10 animate-pulse rounded" />
        <div className="h-64 bg-[var(--foreground)]/10 animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <StaggerContainer className="space-y-6">
      <SettingsHeader saving={saving} isDirty={isDirty} onSave={save} />

      <form
        onSubmit={e => { e.preventDefault(); save(); }}
        className="space-y-6"
      >
        <StaggerItem>
          <BusinessProfileSection
            data={formData}
            errors={validationErrors}
            onChange={(k, v) => setField(k as any, v as any)}
          />
        </StaggerItem>

        <StaggerItem>
          <TermsSection
            value={formData.termsAndConditions}
            onChange={v => setField("termsAndConditions", v)}
          />
        </StaggerItem>

        <StaggerItem>
          <FineSettingsSection
            redemptionPeriodDays={formData.redemptionPeriodDays}
            finePercentage={formData.finePercentage}
            fineFrequencyDays={formData.fineFrequencyDays}
            onChange={setField}
          />
        </StaggerItem>

        <StaggerItem className="flex justify-end">
          <button
            type="submit"
            disabled={saving || !isDirty}
            className="glass-btn-primary px-8 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </StaggerItem>
      </form>

      <StaggerItem>
        <DangerZoneSection />
      </StaggerItem>

      <StaggerItem>
        <AccountPreferencesSection />
      </StaggerItem>

      <StaggerItem>
        <AboutSection />
      </StaggerItem>
    </StaggerContainer>
  );
}
