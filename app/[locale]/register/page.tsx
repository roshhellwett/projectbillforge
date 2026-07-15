"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { Link, useRouter } from "@/i18n/routing";
import Script from "next/script";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { registerBusiness } from "@/lib/actions/auth";
import { Mail, Lock, Building2, ArrowRight, Eye, EyeOff, Phone, MapPin, Hash, ShieldCheck, CheckCircle2, AlertCircle, LockKeyhole, Cpu, Zap, Award } from "lucide-react";

export default function RegisterPage() {
  const t = useTranslations('Auth');
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    gstin: "",
    phone: "",
    address: "",
    state: "",
    pincode: "",
    honeypot: "",
  });

  // Real-time password strength calculation
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    return score;
  };

  const pwdScore = getPasswordStrength(formData.password);
  const isPhoneValid = /^[6-9]\d{9}$/.test(formData.phone);
  const isGstinValid = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/.test(formData.gstin);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError("Please fill all required fields.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords don't match.");
        return;
      }
      if (pwdScore < 4) {
        setError("Please ensure your password meets all 4 security requirements (Min 8 chars, Uppercase, Lowercase, Number).");
        return;
      }
      setError("");
      setStep(2);
      return;
    }

    setLoading(true);
    setError("");

    const turnstileInput = document.querySelector('input[name="cf-turnstile-response"]') as HTMLInputElement;
    const turnstileToken = turnstileInput ? turnstileInput.value : undefined;

    const submitData = {
      ...formData,
      turnstileToken
    };

    const result = await registerBusiness(submitData, locale);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else if (result?.exists) {
      setLoading(false);
      router.push("/login?registered=true");
    } else {
      router.push("/login?registered=true");
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: `/${locale}/dashboard` });
  };

  useEffect(() => {
    if (step !== 2) return;
    if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) return;
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    const tryRender = () => {
      if (!turnstileRef.current) return;
      if (typeof window === 'undefined') return;
      const w = window as unknown as { turnstile?: { render: (el: HTMLElement, opts: object) => string; reset: (id: string) => void } };
      if (!w.turnstile) return;
      if (turnstileWidgetId.current) {
        try { w.turnstile.reset(turnstileWidgetId.current); } catch { }
      }
      turnstileWidgetId.current = w.turnstile.render(turnstileRef.current, {
        sitekey: siteKey,
        theme: 'auto',
      });
    };

    const w = window as unknown as { turnstile?: object };
    if (w.turnstile) {
      tryRender();
    } else {
      const interval = setInterval(() => {
        if ((window as unknown as { turnstile?: object }).turnstile) {
          clearInterval(interval);
          tryRender();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [step]);

  const update = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)]/70 backdrop-blur-md"
          >
            <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-[var(--surface-elevated)] shadow-2xl border border-[var(--border)] max-w-sm text-center">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-[var(--color-primary)]/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-[var(--color-primary)] rounded-full animate-spin" />
                <LockKeyhole size={20} className="text-[var(--color-primary)] animate-pulse" />
              </div>
              <div>
                <p className="text-[var(--foreground)] font-bold text-base mb-1">
                  Encrypting Identity & Ledger...
                </p>
                <p className="text-xs text-[var(--foreground)]/50">
                  Generating salted Bcrypt hash & configuring secure business profile
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen flex relative overflow-hidden bg-[var(--background)]">
        {/* Left Side: Human-Engineered Register Card */}
        <div className="w-full lg:w-[520px] xl:w-[560px] flex-shrink-0 flex items-center justify-center p-6 sm:p-10 relative z-10 bg-[var(--background)] border-r border-[var(--border)]">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="w-full max-w-sm"
          >
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-3">
                <ShieldCheck size={14} className="animate-pulse" />
                <span>Unhackable Bcrypt & Cloudflare Turnstile Protected</span>
              </div>
              <h1 className="text-3xl font-bold gradient-text mb-1 tracking-tight">BillForge</h1>
              <p className="text-xs text-[var(--foreground)]/50 tracking-wider uppercase font-semibold">
                Zenith Open Source • Enterprise Architecture
              </p>
            </div>

            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-1">{t('createAccount')}</h2>
            <p className="text-sm text-[var(--foreground)]/50 mb-5 font-medium">
              {step === 1 ? "Step 1 of 2 — Business Identity & Secure Credentials" : "Step 2 of 2 — GSTIN, Mobile & Local Jurisdiction"}
            </p>

            {/* Step Progress Meter */}
            <div className="flex gap-2 mb-6">
              <div className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-[var(--color-primary)] shadow-sm shadow-[var(--color-primary)]/50' : 'bg-[var(--border)]'}`} />
              <div className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-[var(--color-primary)] shadow-sm shadow-[var(--color-primary)]/50' : 'bg-[var(--border)]'}`} />
            </div>

            {step === 1 && (
              <>
                <button
                  onClick={handleGoogleSignIn}
                  type="button"
                  className="w-full glass-btn-secondary flex items-center justify-center gap-3 py-3 mb-5 rounded-xl hover:border-[var(--color-primary)]/40 transition-all shadow-sm"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span className="font-medium text-[var(--foreground)]">{t('continueGoogle')}</span>
                </button>

                <div className="flex items-center gap-4 mb-5">
                  <div className="flex-1 h-px bg-[var(--border)]" />
                  <span className="text-xs font-semibold text-[var(--foreground)]/30 uppercase tracking-wider">or create encrypted account</span>
                  <div className="flex-1 h-px bg-[var(--border)]" />
                </div>
              </>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-xl text-sm font-medium border border-[var(--color-danger)]/30 mb-5 flex items-start gap-3"
              >
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div className="relative">
                    <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
                    <input type="text" required placeholder={`${t('businessName')} *`} value={formData.name} onChange={(e) => update("name", e.target.value)} className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all" style={{ paddingLeft: '2.75rem' }} />
                  </div>

                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
                    <input type="email" inputMode="email" required placeholder={`${t('emailPlaceholder')} *`} value={formData.email} onChange={(e) => update("email", e.target.value)} className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all" style={{ paddingLeft: '2.75rem' }} autoComplete="email" />
                  </div>

                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
                    <input type={showPassword ? "text" : "password"} inputMode="text" required placeholder={`${t('passwordPlaceholder')} *`} value={formData.password} onChange={(e) => update("password", e.target.value)} className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all" style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }} autoComplete="new-password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50 hover:text-[var(--foreground)]/80 transition-colors">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Real-time Password Entropy Score Bar */}
                  {formData.password.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2.5">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-[var(--foreground)]/70">Password Security Meter</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${pwdScore === 4 ? "bg-emerald-500/20 text-emerald-500 dark:text-emerald-400" : pwdScore === 3 ? "bg-amber-500/20 text-amber-500" : "bg-red-500/20 text-red-500"}`}>
                          {pwdScore === 4 ? "🔒 Bank-Grade Unhackable" : pwdScore === 3 ? "Moderate" : "Weak"}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 rounded-full transition-all duration-300 ${pwdScore >= level ? (pwdScore === 4 ? "bg-emerald-500 shadow-sm shadow-emerald-500/50" : pwdScore === 3 ? "bg-amber-500" : "bg-red-500") : "bg-[var(--border)]"}`}
                          />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[11px] text-[var(--foreground)]/60 pt-1">
                        <span className={`flex items-center gap-1 ${formData.password.length >= 8 ? "text-emerald-500 font-semibold" : ""}`}>
                          {formData.password.length >= 8 ? "✓" : "○"} Min 8 characters
                        </span>
                        <span className={`flex items-center gap-1 ${/[A-Z]/.test(formData.password) ? "text-emerald-500 font-semibold" : ""}`}>
                          {/[A-Z]/.test(formData.password) ? "✓" : "○"} Uppercase letter
                        </span>
                        <span className={`flex items-center gap-1 ${/[a-z]/.test(formData.password) ? "text-emerald-500 font-semibold" : ""}`}>
                          {/[a-z]/.test(formData.password) ? "✓" : "○"} Lowercase letter
                        </span>
                        <span className={`flex items-center gap-1 ${/[0-9]/.test(formData.password) ? "text-emerald-500 font-semibold" : ""}`}>
                          {/[0-9]/.test(formData.password) ? "✓" : "○"} Numeric digit
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
                    <input type={showPassword ? "text" : "password"} inputMode="text" required placeholder="Confirm password *" value={formData.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all" style={{ paddingLeft: '2.75rem' }} autoComplete="new-password" />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div className="relative">
                    <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
                    <input type="text" placeholder="GSTIN (optional - e.g. 27AAAAA0000A1Z5)" value={formData.gstin} onChange={(e) => update("gstin", e.target.value.toUpperCase())} className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all" style={{ paddingLeft: '2.75rem' }} />
                  </div>
                  {formData.gstin && (
                    <div className={`text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${isGstinValid ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border border-amber-500/20"}`}>
                      {isGstinValid ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                      <span>{isGstinValid ? "Valid Indian GSTIN format verified" : "Checking GSTIN structure (15 alphanumeric characters)"}</span>
                    </div>
                  )}

                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
                    <input type="tel" inputMode="tel" placeholder="Indian Mobile (optional - 10 digits)" value={formData.phone} onChange={(e) => update("phone", e.target.value)} className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all" style={{ paddingLeft: '2.75rem' }} />
                  </div>
                  {formData.phone && (
                    <div className={`text-xs flex items-center gap-1.5 px-3 py-1 rounded-lg ${isPhoneValid ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600"}`}>
                      {isPhoneValid ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                      <span>{isPhoneValid ? "Valid Indian mobile format" : "Must be 10 digits starting with 6, 7, 8, or 9"}</span>
                    </div>
                  )}

                  <div className="relative">
                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
                    <input type="text" placeholder="Address (optional)" value={formData.address} onChange={(e) => update("address", e.target.value)} className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all" style={{ paddingLeft: '2.75rem' }} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="State" value={formData.state} onChange={(e) => update("state", e.target.value)} className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all" />
                    <input type="text" inputMode="numeric" placeholder="Pincode" value={formData.pincode} onChange={(e) => update("pincode", e.target.value)} className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all" />
                  </div>

                  {/* Honeypot field (hidden from humans, traps bots) */}
                  <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
                    <input type="text" name="website_url" tabIndex={-1} autoComplete="off" value={formData.honeypot} onChange={(e) => update("honeypot", e.target.value)} />
                  </div>

                  {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                    <div className="w-full flex justify-center py-2">
                      <div ref={turnstileRef} />
                    </div>
                  )}
                </motion.div>
              )}

              <div className="flex gap-3 pt-2">
                {step === 2 && (
                  <button type="button" onClick={() => setStep(1)} className="glass-btn-secondary py-3.5 px-6 rounded-xl font-semibold">Back</button>
                )}
                <motion.button
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="glass-btn-primary py-3.5 flex-1 flex items-center justify-center gap-2 text-base font-semibold rounded-xl shadow-lg shadow-[var(--color-primary)]/20"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Securing Account...</span>
                    </span>
                  ) : step === 1 ? (
                    <><span>Continue to Verification</span> <ArrowRight size={16} /></>
                  ) : (
                    <><span>Create Encrypted Account</span> <ArrowRight size={16} /></>
                  )}
                </motion.button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-[var(--border)]">
              <p className="text-sm text-[var(--foreground)]/50 text-center">
                {t('hasAccount')}{" "}
                <Link href="/login" className="text-[var(--color-primary)] hover:text-[var(--color-primary-light)] font-bold transition-colors">
                  {t('signInBtn')} →
                </Link>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Interactive Identity & Cloud Khata Security Engine Bento Dock */}
        <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-12 bg-slate-950">
          <div className="absolute inset-0 grad-purple opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.15)_0%,transparent_70%)] pointer-events-none" />
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />

          <div className="relative z-10 w-full max-w-xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-purple-400 animate-pulse" />
                <span className="text-white font-bold text-sm tracking-wide uppercase">Zero-Trust Enterprise Identity</span>
              </div>
              <span className="text-xs text-white/60 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                Bcrypt 12 • Honeypot Shield
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Card 1: Anti-Bot Defense */}
              <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-5 text-white shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                    <ShieldCheck size={20} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase tracking-wider">
                    Scrape Protected
                  </span>
                </div>
                <h3 className="font-bold text-base mb-1">Honeypot & Turnstile</h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  Invisible honeypot traps automatically quarantine bots, while Cloudflare Turnstile validates legitimate human interactions.
                </p>
              </div>

              {/* Card 2: Ledger Isolation */}
              <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-5 text-white shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                    <Cpu size={20} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 uppercase tracking-wider">
                    PostgreSQL Isolation
                  </span>
                </div>
                <h3 className="font-bold text-base mb-1">Tenant Data Isolation</h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  Your customer directory, products, and Udhaar ledgers are strictly scoped to your encrypted `businessId` across every query.
                </p>
              </div>
            </div>

            {/* Live Ledger Activity Showcase Card */}
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-6 text-white shadow-2xl relative">
              <div className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-4 flex items-center justify-between">
                <span>Simulated Secure Ledger Engine</span>
                <span className="text-emerald-400 font-bold">✓ 0 Security Warnings</span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Revenue Protected", value: "₹4.2L", color: "text-emerald-400" },
                  { label: "Encrypted Invoices", value: "256", color: "text-blue-400" },
                  { label: "Khata Customers", value: "89", color: "text-purple-400" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-black/25 border border-white/10 rounded-xl p-3 text-center">
                    <div className="text-white/50 text-[10px] font-semibold tracking-wider uppercase mb-1">{stat.label}</div>
                    <div className="text-white font-extrabold text-lg leading-tight">{stat.value}</div>
                    <div className={`${stat.color} text-[10px] font-bold mt-0.5`}>🔒 Secure</div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {[
                  { text: "Khata payment received ₹12,000 (FIFO settlement)", time: "Just now", badge: "VERIFIED" },
                  { text: "New GST invoice #BF-042 locked with HSN codes", time: "12m ago", badge: "IMMUTABLE" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 px-3.5 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-white/80 text-xs font-medium">{item.text}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">{item.badge}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-white/60 text-xs">
                Engineered from scratch to withstand modern attacks while providing blazingly fast human usability.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />
    </>
  );
}
