"use client";

import { useState } from "react";
import { useId } from "react";
import { useTranslations } from "next-intl";
import { changePassword } from "@/lib/actions/auth";
import { useToast } from "@/components/ui/Toast";
import { Lock, Eye, EyeOff } from "lucide-react";

interface Props {
  isOAuthUser?: boolean;
}

export function PasswordSection({ isOAuthUser = false }: Props) {
  const t = useTranslations("Settings");
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const idPrefix = useId();
  const requirementsId = `${idPrefix}-requirements`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setStatus(null);
    setLoading(true);
    try {
      const result = await changePassword(form);
      if (result?.error) {
        setStatus({ type: "error", message: result.error });
        addToast(result.error, "error");
      } else {
        const message = t("passwordSuccess");
        setStatus({ type: "success", message });
        addToast(message, "success");
        setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch {
      const message = t("passwordError");
      setStatus({ type: "error", message });
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "currentPassword" as const, label: t("currentPassword"), autoComplete: "current-password" },
    { key: "newPassword" as const, label: t("newPassword"), autoComplete: "new-password" },
    { key: "confirmPassword" as const, label: t("confirmPassword"), autoComplete: "new-password" },
  ];

  if (isOAuthUser) {
    return (
      <section aria-labelledby={`${idPrefix}-title`} className="glass-card p-5 sm:p-8">
        <div>
          <h2 id={`${idPrefix}-title`} className="text-lg font-semibold text-[var(--foreground)] mb-1">{t("passwordTitle")}</h2>
          <p className="text-sm text-[var(--foreground)]/60">{t("passwordDescription")}</p>
        </div>
        <p role="status" className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 text-sm text-[var(--foreground)]/75">
          {t("passwordUnavailable")}
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby={`${idPrefix}-title`} className="glass-card p-5 sm:p-8">
      <h2 id={`${idPrefix}-title`} className="text-lg font-semibold text-[var(--foreground)] mb-1">{t("passwordTitle")}</h2>
      <p className="text-sm text-[var(--foreground)]/60 mb-6">{t("passwordDescription")}</p>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        {fields.map(field => {
          const fieldId = `${idPrefix}-${field.key}`;
          return (
            <div key={field.key}>
              <label htmlFor={fieldId} className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/70 mb-2">
                {field.label}
              </label>
              <div className="relative">
                <Lock size={16} aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
                <input
                  id={fieldId}
                  type={show ? "text" : "password"}
                  required
                  minLength={field.key === "currentPassword" ? undefined : 8}
                  value={form[field.key]}
                  onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                  className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm"
                  style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                  autoComplete={field.autoComplete}
                  aria-describedby={requirementsId}
                />
                <button
                  type="button"
                  onClick={() => setShow(value => !value)}
                  aria-label={show ? t("hidePassword") : t("showPassword")}
                  aria-pressed={show}
                  className="absolute right-3 top-1/2 -translate-y-1/2 min-h-9 min-w-9 inline-flex items-center justify-center rounded-lg text-[var(--foreground)]/50 hover:text-[var(--foreground)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                >
                  {show ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                </button>
              </div>
            </div>
          );
        })}

        <p id={requirementsId} className="text-xs text-[var(--foreground)]/50">{t("passwordRequirements")}</p>

        {status && (
          <p role={status.type === "error" ? "alert" : "status"} aria-live={status.type === "error" ? "assertive" : "polite"} className={`rounded-xl border p-3 text-sm ${status.type === "error" ? "border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 text-[var(--color-danger)]" : "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--foreground)]/80"}`}>
            {status.message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="glass-btn-primary min-h-11 px-6 py-3 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
        >
          {loading ? t("passwordUpdating") : t("changePassword")}
        </button>
      </form>
    </section>
  );
}
