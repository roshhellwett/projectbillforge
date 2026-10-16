"use client";

import { useState, use, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { Link, useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, LockKeyhole, CheckCircle2, Receipt, BookOpen, Users } from "lucide-react";

export default function LoginPage({ searchParams: searchParamsPromise }: { searchParams: Promise<{ registered?: string; reset?: string }> }) {
  const searchParams = use(searchParamsPromise);
  const t = useTranslations('Auth');
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (result?.error) {
        if (result.error.toLowerCase().includes("too many")) {
          setError(t("rateLimitError"));
        } else if (result.error.toLowerCase().includes("not verified")) {
          setError(t("unverifiedError"));
        } else {
          setError(t("invalidCredentials"));
        }
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError(t("signInError"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setOauthLoading(true);
    setError("");
    try {
      const result = await signIn("google", { callbackUrl: `/${locale}/dashboard` });
      if (result?.error) setError(t("signInError"));
    } catch {
      setError(t("signInError"));
    } finally {
      setOauthLoading(false);
    }
  };

  return (
    <>
       <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)]/70 backdrop-blur-md"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-[var(--surface-elevated)] shadow-2xl border border-[var(--border)] max-w-sm text-center">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-[var(--color-primary)]/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-[var(--color-primary)] rounded-full animate-spin" />
                 <LockKeyhole size={20} className="text-[var(--color-primary)] animate-pulse" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[var(--foreground)] font-bold text-base mb-1">
                  {t("checkingSignIn")}
                </p>
                <p className="text-xs text-[var(--foreground)]/50">
                  {t("signInWait")}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

       <div className="min-h-dvh flex relative overflow-hidden bg-[var(--background)]">
        {/* Left Side: Human-Engineered Login Card */}
        <div className="w-full lg:w-[500px] xl:w-[540px] min-h-dvh flex-shrink-0 flex items-center justify-center p-4 sm:p-10 relative z-10 bg-[var(--background)] border-r border-[var(--border)]">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="w-full max-w-sm"
          >
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-200/50 dark:bg-zinc-800/50 border border-zinc-300 dark:border-zinc-700 text-[var(--foreground)] text-xs font-semibold mb-4">
                 <LockKeyhole size={14} aria-hidden="true" />
                 <span>{t("signInSecurityNotice")}</span>
              </div>
              <h1 className="text-3xl font-bold gradient-text mb-1 tracking-tight">BillForge</h1>
              <p className="text-xs text-[var(--foreground)]/50 tracking-wider uppercase font-semibold">
                 {t("openSourceNote")}
              </p>
            </div>

            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-1">{t('welcomeBack')}</h2>
            <p className="text-sm text-[var(--foreground)]/50 mb-6">{t('signInPrompt')}</p>

            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleSignIn}
               type="button"
               disabled={loading || oauthLoading}
               aria-busy={oauthLoading}
              className="w-full glass-btn-secondary flex items-center justify-center gap-3 py-3 mb-6 rounded-xl hover:border-[var(--color-primary)]/40 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="font-medium text-[var(--foreground)]">{oauthLoading ? t("continuingWithGoogle") : t('continueGoogle')}</span>
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-[var(--border)]" />
               <span className="text-xs font-semibold text-[var(--foreground)]/30 uppercase tracking-wider">{t("authMethodDivider")}</span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>

            {searchParams.registered === "true" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                 className="p-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm font-medium border border-zinc-300 dark:border-zinc-700 mb-5 flex items-center gap-3"
                 role="status"
                 aria-live="polite"
              >
                 <CheckCircle2 size={18} className="flex-shrink-0" aria-hidden="true" />
                 <span>{t("accountCreatedNotice")}</span>
              </motion.div>
            )}

            {searchParams.reset === "1" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl text-sm font-medium border border-zinc-300 dark:border-zinc-700 mb-5 flex items-center gap-3"
              >
                 <CheckCircle2 size={18} className="flex-shrink-0" aria-hidden="true" />
                 <span>{t("passwordResetNotice")}</span>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                ref={errorRef}
                id="login-error"
                role="alert"
                aria-live="assertive"
                tabIndex={-1}
                className="p-4 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-xl text-sm font-medium border border-[var(--color-danger)]/30 mb-5 flex items-start gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-danger)]/50"
              >
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" aria-busy={loading}>
              <div className="relative">
                <label htmlFor="login-email" className="sr-only">{t("emailLabel")}</label>
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50 pointer-events-none" aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  inputMode="email"
                  required
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label={t("emailLabel")}
                  aria-describedby={error ? "login-error" : undefined}
                  className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all"
                  style={{ paddingLeft: '2.75rem' }}
                  autoComplete="email"
                />
              </div>

              <div className="relative">
                <label htmlFor="login-password" className="sr-only">{t("passwordLabel")}</label>
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50 pointer-events-none" aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  inputMode="text"
                  required
                  placeholder={t('passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-label={t("passwordLabel")}
                  aria-describedby={error ? "login-error" : undefined}
                  className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all"
                  style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50 hover:text-[var(--foreground)]/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/50 rounded"
                  aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-xs text-[var(--foreground)]/50">
                  <LockKeyhole size={12} className="text-[var(--foreground)]" aria-hidden="true" />
                  <span>{t("passwordStorageNote")}</span>
                </div>
                <Link href="/forgot-password" className="text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/50 rounded">
                  {t("forgotPassword")}
                </Link>
              </div>

              <motion.button
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full glass-btn-primary py-3.5 flex items-center justify-center gap-2 text-base font-semibold rounded-xl shadow-lg shadow-[var(--color-primary)]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/60 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t('signingIn')}</span>
                  </span>
                ) : (
                  <>
                    <span>{t('signInBtn')}</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-8 pt-6 border-t border-[var(--border)]">
              <p className="text-sm text-[var(--foreground)]/50 text-center">
                {t('noAccount')}{" "}
                  <Link href="/register" className="text-[var(--color-primary)] hover:text-[var(--color-primary-light)] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/50 rounded">
                  {t('createOne')} →
                </Link>
              </p>
            </div>

             <div className="mt-6 flex items-center justify-center text-[11px] text-[var(--foreground)]/40 text-center">
               <span>{t("openSourceNote")}</span>
             </div>
          </motion.div>
        </div>

        {/* Right Side: a truthful product overview */}
        <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-12 bg-slate-950">
          <div className="absolute inset-0 grad-blue opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.15)_0%,transparent_70%)] pointer-events-none" />
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />

          <div className="relative z-10 w-full max-w-xl text-white">
            <div className="mb-8 max-w-lg">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-[0.16em] mb-3">{t("openSourceNote")}</p>
              <h2 className="text-3xl xl:text-4xl font-black tracking-tight mb-4">{t("signInFeatureTitle")}</h2>
              <p className="text-white/70 text-sm leading-relaxed">{t("signInPrompt")}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {[
                { icon: Receipt, text: t("signInFeatureInvoices") },
                { icon: BookOpen, text: t("signInFeatureKhata") },
                { icon: Users, text: t("signInFeatureRecords") },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-5 shadow-xl">
                  <div className="w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center mb-4">
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>

            <p className="mt-8 text-white/50 text-xs leading-relaxed">
              {t("passwordStorageNote")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
