"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { resetAllKhataData } from "@/lib/actions/business";
import { ConfirmDialog } from "@/components/ui/ui";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "@/i18n/routing";

interface Props {
  isOAuthUser: boolean;
}

export function DangerZoneSection({ isOAuthUser }: Props) {
  const t = useTranslations("Settings");
  const { addToast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!password) {
      setError(isOAuthUser ? t("resetTypeConfirm") : t("resetEnterPassword"));
      return;
    }
    setLoading(true);
    setError("");
    const result = await resetAllKhataData(password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      addToast(result.message || "Data reset successfully!", "success");
      setLoading(false);
      setOpen(false);
      setPassword("");
      router.refresh();
    }
  };

  return (
    <>
      <div className="glass-card p-8 border border-[var(--color-danger)]/10">
        <h2 className="text-xl font-bold text-[var(--color-danger)] mb-2">{t("dangerZone")}</h2>
        <p className="text-sm font-medium text-[var(--foreground)]/60 mb-6">{t("dangerDescription")}</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-6 py-3.5 bg-[var(--color-danger)]/10 text-[var(--color-danger)] font-bold rounded-full hover:bg-[var(--color-danger)] hover:text-white transition-all hover:-translate-y-1"
        >
          {t("resetButton")}
        </button>
      </div>

      <ConfirmDialog
        open={open}
        title={t("resetConfirm")}
        message={t("resetMessage")}
        confirmLabel={loading ? "Resetting..." : "Yes, Reset Everything"}
        cancelLabel="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => { setOpen(false); setPassword(""); setError(""); }}
        variant="danger"
        loading={loading}
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-1">
            {isOAuthUser ? t("resetTypeConfirm") : t("resetEnterPassword")}
          </label>
          <input
            type={isOAuthUser ? "text" : "password"}
            value={password}
            onChange={e => { setPassword(e.target.value); setError(""); }}
            className="w-full glass-input"
            placeholder={isOAuthUser ? "RESET ALL DATA" : "Your login password"}
          />
          {error && <p className="text-sm text-[var(--color-danger)] mt-1">{error}</p>}
        </div>
      </ConfirmDialog>
    </>
  );
}
