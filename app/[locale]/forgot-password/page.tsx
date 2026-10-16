"use client";

import { useState, useEffect, useRef } from "react";
import { Link } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { requestPasswordReset } from "@/lib/actions/password-reset";
import { Mail, ArrowLeft, ArrowRight, MailCheck, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const t = useTranslations("Auth");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await requestPasswordReset(email.trim(), locale);
      if (result?.error) {
        const message = result.error.toLowerCase();
        setError(message.includes("too many") ? t("rateLimitError") : t("passwordRecoveryError"));
      } else {
        setSent(true);
      }
    } catch {
      setError(t("passwordRecoveryError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--background)] px-6 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none aurora-mesh opacity-70 -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
       <div className="text-center mb-8">
         <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)]/70 text-xs font-semibold mb-4">
            <Mail size={13} aria-hidden="true" />
            <span>{t("resetLinkNotice")}</span>
         </div>
         <h1 className="text-3xl font-bold gradient-text mb-1 tracking-tight">BillForge</h1>
         <p className="text-[11px] text-[var(--foreground)]/50 tracking-[0.15em] uppercase font-semibold">
            {t("passwordRecoveryEyebrow")}
          </p>
        </div>

        <div className="rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-elevation)] p-8 sm:p-10">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0 }}
                 className="text-center space-y-5"
                 role="status"
                 aria-live="polite"
               >
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 rounded-full bg-[var(--foreground)]/10 animate-ping" />
                  <div className="relative w-20 h-20 rounded-full bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center shadow-lg">
                    <MailCheck size={34} strokeWidth={2} />
                  </div>
                </div>
                <div>
                   <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">{t("checkInboxTitle")}</h2>
                   <p className="text-sm text-[var(--foreground)]/60 leading-relaxed">
                     {t("checkInboxBody", { email })}
                   </p>
                 </div>
                 <div className="pt-2 border-t border-[var(--border)] space-y-2">
                   <p className="text-[11px] text-[var(--foreground)]/50">
                     {t("resetInboxHint")}
                  </p>
                   <Link
                     href="/login"
                     className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/50 rounded"
                  >
                     <ArrowLeft size={15} aria-hidden="true" /> {t("backToLogin")}
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                 <h2 className="text-2xl font-bold text-[var(--foreground)] mb-1">{t("passwordRecoveryTitle")}</h2>
                 <p className="text-sm text-[var(--foreground)]/60 mb-6 leading-relaxed">
                   {t("passwordRecoveryDescription")}
                 </p>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                     ref={errorRef}
                     id="forgot-password-error"
                     role="alert"
                     aria-live="assertive"
                     tabIndex={-1}
                     className="p-3.5 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-xl text-sm font-medium border border-[var(--color-danger)]/30 mb-4 flex items-start gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-danger)]/50"
                  >
                     <AlertCircle size={16} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{error}</span>
                  </motion.div>
                )}

                 <form onSubmit={handleSubmit} className="space-y-4" aria-busy={loading}>
                  <div className="relative">
                     <Mail
                       size={16}
                       className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50 pointer-events-none"
                       aria-hidden="true"
                     />
                     <label htmlFor="fp-email" className="sr-only">{t("emailLabel")}</label>
                    <input
                      id="fp-email"
                      type="email"
                      inputMode="email"
                      required
                       placeholder={t("emailPlaceholder")}
                       aria-label={t("emailLabel")}
                       aria-describedby={error ? "forgot-password-error" : undefined}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm focus:ring-2 focus:ring-[var(--color-primary)]/40"
                      style={{ paddingLeft: "2.75rem" }}
                      autoComplete="email"
                      autoFocus
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                     className="w-full glass-btn-primary py-3.5 flex items-center justify-center gap-2 text-base font-semibold rounded-xl shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/60 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                         <span>{t("sendingResetLink")}</span>
                      </span>
                    ) : (
                      <>
                         <span>{t("sendResetLink")}</span>
                         <ArrowRight size={16} aria-hidden="true" />
                      </>
                    )}
                  </motion.button>
                </form>

                <div className="mt-6 pt-5 border-t border-[var(--border)] text-center">
                  <Link
                    href="/login"
                     className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)] hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/50 rounded"
                  >
                     <ArrowLeft size={15} aria-hidden="true" /> {t("backToLogin")}
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

         <p className="text-[11px] text-[var(--foreground)]/40 text-center mt-6">
           {t("workspaceEmailHint")}
         </p>
      </motion.div>
    </div>
  );
}
