"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Script from "next/script";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { registerBusiness } from "@/lib/actions/auth";
import { Mail, Lock, Building2, ArrowRight, Eye, EyeOff, Phone, MapPin, Hash } from "lucide-react";

export default function RegisterPage() {
  const t = useTranslations('Auth');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
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
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      setError("");
      setStep(2);
      return;
    }

    setLoading(true);
    setError("");

    // Grab the Turnstile token directly from the hidden input injected by the Cloudflare script
    const turnstileInput = document.querySelector('input[name="cf-turnstile-response"]') as HTMLInputElement;
    const turnstileToken = turnstileInput ? turnstileInput.value : undefined;

    const submitData = {
      ...formData,
      turnstileToken
    };

    const result = await registerBusiness(submitData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      const loginResult = await signIn("credentials", {
        redirect: false,
        email: formData.email.toLowerCase(),
        password: formData.password,
      });
      if (loginResult?.error) {
        router.push("/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  const update = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <>
      {/* Fullscreen Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)]/60 backdrop-blur-md"
          >
            <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-[var(--background)] shadow-2xl border border-[var(--border)]">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-[var(--color-primary)]/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-[var(--color-primary)] rounded-full animate-spin" />
              </div>
              <p className="text-[var(--foreground)] font-medium text-sm animate-pulse">
                {t('signingUp')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen flex relative overflow-hidden">
        {/* ─── Left: Register Form ─── */}
        <div className="w-full lg:w-[480px] xl:w-[520px] flex-shrink-0 flex items-center justify-center p-6 sm:p-10 relative z-10 bg-[var(--background)]">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="w-full max-w-sm"
          >
            {/* Logo */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold gradient-text mb-1">BillForge</h1>
              <p className="text-xs text-[var(--foreground)]/40 tracking-wider uppercase">Zenith Open Source</p>
            </div>

            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-1">{t('createAccount')}</h2>
            <p className="text-sm text-[var(--foreground)]/40 mb-6">
              {step === 1 ? "Step 1 of 2 — Business basics" : "Step 2 of 2 — Optional details"}
            </p>

            {/* Step indicator */}
            <div className="flex gap-2 mb-6">
              <div className={`flex-1 h-1 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-[var(--color-primary)]' : 'bg-[var(--border)]'}`} />
              <div className={`flex-1 h-1 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-[var(--color-primary)]' : 'bg-[var(--border)]'}`} />
            </div>

            {/* Google Sign In (step 1 only) */}
            {step === 1 && (
              <>
                <button
                  onClick={handleGoogleSignIn}
                  className="w-full glass-btn-secondary flex items-center justify-center gap-3 py-3 mb-6 rounded-xl"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span className="font-medium text-[var(--foreground)]">{t('continueGoogle')}</span>
                </button>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-[var(--border)]" />
                  <span className="text-xs font-medium text-[var(--foreground)]/25 uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-[var(--border)]" />
                </div>
              </>
            )}

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-xl text-sm font-medium border border-[var(--color-danger)]/20 mb-4"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 sm:space-y-5">
                  <div className="relative">
                    <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
                    <input type="text" required placeholder={`${t('businessName')} *`} value={formData.name} onChange={(e) => update("name", e.target.value)} className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm" style={{ paddingLeft: '2.75rem' }} />
                  </div>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
                    <input type="email" required placeholder={`${t('emailPlaceholder')} *`} value={formData.email} onChange={(e) => update("email", e.target.value)} className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm" style={{ paddingLeft: '2.75rem' }} autoComplete="email" />
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
                    <input type={showPassword ? "text" : "password"} required placeholder={`${t('passwordPlaceholder')} *`} value={formData.password} onChange={(e) => update("password", e.target.value)} className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm" style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }} autoComplete="new-password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50 hover:text-[var(--foreground)]/70 transition-colors">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
                    <input type={showPassword ? "text" : "password"} required placeholder="Confirm password *" value={formData.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm" style={{ paddingLeft: '2.75rem' }} autoComplete="new-password" />
                  </div>
                  <p className="text-xs text-[var(--foreground)]/35">Min 8 characters with uppercase, lowercase, and a number.</p>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 sm:space-y-5">
                  <div className="relative">
                    <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
                    <input type="text" placeholder="GSTIN (optional)" value={formData.gstin} onChange={(e) => update("gstin", e.target.value.toUpperCase())} className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm" style={{ paddingLeft: '2.75rem' }} />
                  </div>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
                    <input type="tel" placeholder="Phone (optional)" value={formData.phone} onChange={(e) => update("phone", e.target.value)} className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm" style={{ paddingLeft: '2.75rem' }} />
                  </div>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
                    <input type="text" placeholder="Address (optional)" value={formData.address} onChange={(e) => update("address", e.target.value)} className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm" style={{ paddingLeft: '2.75rem' }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="State" value={formData.state} onChange={(e) => update("state", e.target.value)} className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm" />
                    <input type="text" placeholder="Pincode" value={formData.pincode} onChange={(e) => update("pincode", e.target.value)} className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm" />
                  </div>

                  {/* Honeypot Field (Hidden from real users) */}
                  <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
                    <input type="text" name="website_url" tabIndex={-1} autoComplete="off" value={formData.honeypot} onChange={(e) => update("honeypot", e.target.value)} />
                  </div>

                  {/* Cloudflare Turnstile Widget */}
                  {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                    <div className="w-full flex justify-center py-2">
                      <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} data-theme="light"></div>
                    </div>
                  )}
                </motion.div>
              )}

              <div className="flex gap-3 pt-1">
                {step === 2 && (
                  <button type="button" onClick={() => setStep(1)} className="glass-btn-secondary flex-1">Back</button>
                )}
                <motion.button
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="glass-btn-primary py-3 flex-1 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </span>
                  ) : step === 1 ? (
                    <>Continue <ArrowRight size={16} /></>
                  ) : (
                    <>Create Account <ArrowRight size={16} /></>
                  )}
                </motion.button>
              </div>
            </form>

            <p className="mt-6 text-sm text-[var(--foreground)]/40">
              {t('hasAccount')}{" "}
              <Link href="/login" className="text-[var(--color-primary)] hover:text-[var(--color-primary-light)] font-semibold transition-colors">
                {t('signInBtn')}
              </Link>
            </p>
          </motion.div>
        </div>

        {/* ─── Right: Animated Illustration ─── */}
        <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center">
          {/* Rich professional gradient background */}
          <div className="absolute inset-0 grad-purple opacity-90" />

          {/* Subtle radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.08)_0%,transparent_70%)] pointer-events-none" />

          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />

          {/* === Illustration: Dashboard Preview === */}
          <div className="relative z-10 w-full max-w-lg px-8">
            {/* Main dashboard preview card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            >
              <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="white-container p-6 w-full"
              >
                {/* Mini stats row */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: "Revenue", value: "₹4.2L", color: "text-emerald-500", change: "+18%" },
                    { label: "Invoices", value: "256", color: "text-blue-500", change: "+12" },
                    { label: "Customers", value: "89", color: "text-amber-500", change: "+7" },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="bg-slate-50 border border-slate-100 rounded-xl p-3"
                    >
                      <div className="text-[var(--foreground)]/40 text-[10px] mb-1 font-semibold tracking-wider uppercase">{stat.label}</div>
                      <div className="text-[var(--foreground)] font-bold text-lg leading-tight">{stat.value}</div>
                      <div className={`${stat.color} text-[10px] font-bold mt-0.5`}>{stat.change}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Mini chart */}
                <div className="mb-4">
                  <div className="text-[var(--foreground)]/40 text-[10px] font-semibold tracking-wider uppercase mb-3">Weekly Overview</div>
                  <div className="flex items-end gap-1.5 h-16">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: 0.7 + i * 0.08, duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                        className={`flex-1 rounded-t-sm ${i === 6 ? 'bg-blue-600' : 'bg-blue-600/20'}`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1.5">
                    {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                      <span key={i} className={`flex-1 text-center text-[9px] font-medium ${i === 6 ? 'text-blue-600 font-bold' : 'text-[var(--foreground)]/30'}`}>{d}</span>
                    ))}
                  </div>
                </div>

                {/* Recent activity */}
                <div className="text-[var(--foreground)]/40 text-[10px] font-semibold tracking-wider uppercase mb-2 mt-6">Recent Activity</div>
                {[
                  { text: "Invoice #042 generated", time: "2m ago", dot: "bg-emerald-500" },
                  { text: "Payment received ₹8,400", time: "15m ago", dot: "bg-blue-500" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + i * 0.15 }}
                    className="flex items-center gap-2.5 py-2.5 border-b border-slate-100 last:border-0"
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                    <span className="text-[var(--foreground)]/70 text-xs font-medium flex-1">{item.text}</span>
                    <span className="text-[var(--foreground)]/30 font-medium text-[10px]">{item.time}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Floating badges */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
              className="absolute -top-4 -right-2"
            >
              <motion.div
                animate={{ y: [-3, 3, -3] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="white-container px-4 py-3 shadow-xl flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <span className="text-indigo-600 font-bold">%</span>
                </div>
                <div className="text-left">
                  <div className="text-[var(--foreground)] font-bold text-sm">GST Ready</div>
                  <div className="text-[var(--foreground)]/40 text-xs">Auto-calculate</div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="mt-10 text-center"
            >
              <h2 className="text-white text-2xl font-bold mb-2">Start your journey</h2>
              <p className="text-white/50 text-sm leading-relaxed max-w-xs mx-auto">
                Join thousands of Indian businesses using BillForge for seamless billing.
              </p>
              <p className="text-white/25 text-xs mt-4">
                Open source by{" "}
                <a href="https://github.com/roshhellwett" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white/60 underline underline-offset-2 transition-colors">@roshhellwett</a>
              </p>
            </motion.div>

            {/* Floating particles */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ y: [-15, 15, -15], x: [-8, 8, -8], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 3.5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                className="absolute w-1.5 h-1.5 bg-white/25 rounded-full"
                style={{ top: `${20 + i * 15}%`, left: `${12 + i * 16}%` }}
              />
            ))}
          </div>
        </div>
      </div>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
    </>
  );
}
