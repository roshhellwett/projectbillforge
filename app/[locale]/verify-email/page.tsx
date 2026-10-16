"use client";

import { useState, use, useEffect, useRef } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { verifyEmail } from "@/lib/actions/verify-email";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, MailCheck, ArrowRight, AlertTriangle } from "lucide-react";

function VerifyStatus({ token }: { token: string }) {
  const router = useRouter();
  const t = useTranslations("Auth");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [countdown, setCountdown] = useState(5);
  const statusHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    let mounted = true;
    verifyEmail(token)
      .then((r) => {
        if (!mounted) return;
        setStatus(r?.error ? "error" : "success");
      })
      .catch(() => {
        if (mounted) setStatus("error");
      });
    return () => {
      mounted = false;
    };
  }, [token]);

  useEffect(() => {
    if (status !== "loading") statusHeadingRef.current?.focus();
  }, [status]);

  // Auto-redirect on success
  useEffect(() => {
    if (status !== "success") return;
    if (countdown <= 0) {
      router.push("/login");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [status, countdown, router]);

  return (
    <AnimatePresence mode="wait">
      {status === "loading" && (
        <motion.div
          key="loading"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="text-center space-y-5"
          role="status"
          aria-live="polite"
        >
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-[var(--border)]" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--color-primary)] animate-spin" />
             <MailCheck size={26} className="text-[var(--color-primary)]" aria-hidden="true" />
          </div>
          <div>
             <h2 className="text-xl font-bold text-[var(--foreground)] mb-1">{t("verifyLoadingTitle")}</h2>
             <p className="text-sm text-[var(--foreground)]/60">{t("verifyLoadingDescription")}</p>
          </div>
        </motion.div>
      )}

      {status === "success" && (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="text-center space-y-5"
          role="status"
          aria-live="polite"
        >
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full bg-[var(--foreground)]/10 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-[var(--foreground)] text-[var(--background)] flex items-center justify-center shadow-lg">
               <CheckCircle2 size={36} strokeWidth={2} aria-hidden="true" />
            </div>
          </div>
          <div>
             <h2 ref={statusHeadingRef} tabIndex={-1} className="text-2xl font-bold text-[var(--foreground)] mb-1 focus-visible:outline-none">{t("emailVerifiedTitle")}</h2>
             <p className="text-sm text-[var(--foreground)]/60 leading-relaxed">
               {t("emailVerifiedBody")}
            </p>
          </div>
          <Link
             href="/login"
             className="inline-flex items-center justify-center gap-2 min-h-11 px-6 py-3 bg-[var(--foreground)] text-[var(--background)] text-sm font-semibold rounded-full hover:opacity-90 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/60"
          >
             {t("continueToLogin")} <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <p className="text-[11px] text-[var(--foreground)]/40">
             {t("redirectingToLogin", { countdown })}
          </p>
        </motion.div>
      )}

      {status === "error" && (
        <motion.div
          key="error"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="text-center space-y-5"
          role="alert"
          aria-live="assertive"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-[var(--color-danger)]/10 text-[var(--color-danger)] flex items-center justify-center border border-[var(--color-danger)]/20">
             <XCircle size={40} strokeWidth={1.8} aria-hidden="true" />
          </div>
          <div>
             <h2 ref={statusHeadingRef} tabIndex={-1} className="text-2xl font-bold text-[var(--foreground)] mb-1 focus-visible:outline-none">{t("verificationFailedTitle")}</h2>
             <p className="text-sm text-[var(--foreground)]/60 leading-relaxed max-w-xs mx-auto">
               {t("verificationFailedBody")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 min-h-11 px-6 py-3 bg-[var(--foreground)] text-[var(--background)] text-sm font-semibold rounded-full hover:opacity-90 transition-all w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/60"
            >
               {t("backToLogin")}
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 min-h-11 px-6 py-3 bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] text-sm font-semibold rounded-full hover:bg-[var(--surface-hover)] transition-all w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/60"
            >
               {t("createNewAccount")}
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = use(searchParams);
  const token = params.token;
  const t = useTranslations("Auth");

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
             <MailCheck size={13} aria-hidden="true" />
            <span>{t("emailVerificationEyebrow")}</span>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-1 tracking-tight">BillForge</h1>
          <p className="text-[11px] text-[var(--foreground)]/50 tracking-[0.15em] uppercase font-semibold">
            {t("registerEyebrow")}
          </p>
        </div>

        <div className="rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-elevation)] p-8 sm:p-10">
          {token ? (
            <VerifyStatus token={token} />
          ) : (
             <div className="text-center space-y-4" role="alert" aria-live="assertive">
              <div className="w-16 h-16 mx-auto rounded-full bg-[var(--color-warning)]/10 text-[var(--color-warning)] flex items-center justify-center border border-[var(--color-warning)]/20">
                 <AlertTriangle size={30} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <div>
                 <h2 className="text-xl font-bold text-[var(--foreground)] mb-1">{t("missingVerificationTokenTitle")}</h2>
                 <p className="text-sm text-[var(--foreground)]/60">{t("missingVerificationTokenBody")}</p>
              </div>
              <Link
                 href="/login"
                 className="inline-flex items-center justify-center gap-2 min-h-11 px-6 py-3 bg-[var(--foreground)] text-[var(--background)] text-sm font-semibold rounded-full hover:opacity-90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/60"
              >
                 {t("backToLogin")}
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
