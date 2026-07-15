"use client";

import { useState, use } from "react";
import { signIn } from "next-auth/react";
import { Link, useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, Cpu, Zap, LockKeyhole, Activity, CheckCircle2 } from "lucide-react";

export default function LoginPage({ searchParams: searchParamsPromise }: { searchParams: Promise<{ registered?: string; reset?: string }> }) {
  const searchParams = use(searchParamsPromise);
  const t = useTranslations('Auth');
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTabDemo, setActiveTabDemo] = useState<"security" | "live">("security");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email: email.trim().toLowerCase(),
      password,
    });

    if (result?.error) {
      if (result.error.toLowerCase().includes("too many")) {
        setError("🛡️ Rate limit triggered: Too many login attempts. Please wait 60 seconds and try again.");
      } else if (result.error.toLowerCase().includes("not verified")) {
        setError("Account not verified. Please check your email for the verification link.");
      } else {
        setError("Invalid email or password. Please verify your credentials and try again.");
      }
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: `/${locale}/dashboard` });
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
          >
            <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-[var(--surface-elevated)] shadow-2xl border border-[var(--border)] max-w-sm text-center">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-[var(--color-primary)]/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-[var(--color-primary)] rounded-full animate-spin" />
                <LockKeyhole size={20} className="text-[var(--color-primary)] animate-pulse" />
              </div>
              <div>
                <p className="text-[var(--foreground)] font-bold text-base mb-1">
                  Verifying Secure Identity...
                </p>
                <p className="text-xs text-[var(--foreground)]/50">
                  Checking 256-bit session token & Upstash rate limiter
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen flex relative overflow-hidden bg-[var(--background)]">
        {/* Left Side: Human-Engineered Login Card */}
        <div className="w-full lg:w-[500px] xl:w-[540px] flex-shrink-0 flex items-center justify-center p-6 sm:p-10 relative z-10 bg-[var(--background)] border-r border-[var(--border)]">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            className="w-full max-w-sm"
          >
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4">
                <ShieldCheck size={14} className="animate-pulse" />
                <span>256-Bit SSL & Zero-Knowledge Architecture</span>
              </div>
              <h1 className="text-3xl font-bold gradient-text mb-1 tracking-tight">BillForge</h1>
              <p className="text-xs text-[var(--foreground)]/50 tracking-wider uppercase font-semibold">
                Zenith Open Source • Industry Level Security
              </p>
            </div>

            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-1">{t('welcomeBack')}</h2>
            <p className="text-sm text-[var(--foreground)]/50 mb-6">{t('signInPrompt')}</p>

            {/* Google OAuth Button */}
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full glass-btn-secondary flex items-center justify-center gap-3 py-3 mb-6 rounded-xl hover:border-[var(--color-primary)]/40 transition-all shadow-sm"
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
              <span className="text-xs font-semibold text-[var(--foreground)]/30 uppercase tracking-wider">or secure email login</span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>

            {searchParams.registered === "true" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-medium border border-emerald-500/30 mb-5 flex items-center gap-3"
              >
                <CheckCircle2 size={18} className="flex-shrink-0" />
                <span>Account created & secured! Check your email for the verification link.</span>
              </motion.div>
            )}

            {searchParams.reset === "1" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-medium border border-emerald-500/30 mb-5 flex items-center gap-3"
              >
                <CheckCircle2 size={18} className="flex-shrink-0" />
                <span>Password reset successfully. Sign in securely below.</span>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-xl text-sm font-medium border border-[var(--color-danger)]/30 mb-5 flex items-start gap-3"
              >
                <ShieldCheck size={18} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
                <input
                  type="email"
                  inputMode="email"
                  required
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all"
                  style={{ paddingLeft: '2.75rem' }}
                  autoComplete="email"
                />
              </div>

              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
                <input
                  type={showPassword ? "text" : "password"}
                  inputMode="text"
                  required
                  placeholder={t('passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)] transition-all"
                  style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50 hover:text-[var(--foreground)]/80 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-xs text-[var(--foreground)]/50">
                  <LockKeyhole size={12} className="text-emerald-500" />
                  <span>Bcrypt 12-round check</span>
                </div>
                <Link href="/forgot-password" className="text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-light)] transition-colors">
                  Forgot password?
                </Link>
              </div>

              <motion.button
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full glass-btn-primary py-3.5 flex items-center justify-center gap-2 text-base font-semibold rounded-xl shadow-lg shadow-[var(--color-primary)]/20"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{t('signingIn')}</span>
                  </span>
                ) : (
                  <>
                    <span>{t('signInBtn')}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-8 pt-6 border-t border-[var(--border)]">
              <p className="text-sm text-[var(--foreground)]/50 text-center">
                {t('noAccount')}{" "}
                <Link href="/register" className="text-[var(--color-primary)] hover:text-[var(--color-primary-light)] font-bold transition-colors">
                  {t('createOne')} →
                </Link>
              </p>
            </div>

            <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-[var(--foreground)]/40">
              <span className="flex items-center gap-1"><Zap size={11} className="text-amber-500" /> Upstash Guard</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Cpu size={11} className="text-blue-500" /> Zero-Trust Auth</span>
              <span>•</span>
              <span>RBI Audit Ready</span>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Interactive Security & Architecture Bento Showcase */}
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

          <div className="relative z-10 w-full max-w-xl">
            {/* Toggle Switch between Security Posture and Live Command Demo */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-white font-bold text-sm tracking-wide uppercase">BillForge Security Shield</span>
              </div>
              <div className="flex rounded-full bg-white/10 p-1 backdrop-blur-md border border-white/15">
                <button
                  type="button"
                  onClick={() => setActiveTabDemo("security")}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${activeTabDemo === "security" ? "bg-white text-slate-950 shadow-md" : "text-white/70 hover:text-white"}`}
                >
                  Architecture & Defense
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTabDemo("live")}
                  className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${activeTabDemo === "live" ? "bg-white text-slate-950 shadow-md" : "text-white/70 hover:text-white"}`}
                >
                  Live Ledger Demo
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTabDemo === "security" ? (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-2 gap-4"
                >
                  {/* Card 1: Zero-Knowledge Bcrypt */}
                  <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-5 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                        <LockKeyhole size={20} />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase tracking-wider">
                        NIST Best Practice
                      </span>
                    </div>
                    <h3 className="font-bold text-base mb-1">Zero-Knowledge Storage</h3>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Passwords undergo 12 rounds of salted Bcrypt hashing. Even database administrators can never decipher your credentials.
                    </p>
                  </div>

                  {/* Card 2: Upstash Rate Limiter */}
                  <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-5 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                        <Activity size={20} />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 uppercase tracking-wider">
                        Sliding Window
                      </span>
                    </div>
                    <h3 className="font-bold text-base mb-1">Brute-Force Guard</h3>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Powered by Upstash Redis & DB safeguards. Automatons & brute-force script attempts are locked down after 5 rapid failures.
                    </p>
                  </div>

                  {/* Card 3: Session Security & CSRF */}
                  <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-5 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                        <ShieldCheck size={20} />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase tracking-wider">
                        Active Shield
                      </span>
                    </div>
                    <h3 className="font-bold text-base mb-1">CSRF & Session Tokens</h3>
                    <p className="text-xs text-white/70 leading-relaxed">
                      HTTP-Only encrypted cookies ensure zero cross-site scripting (XSS) or session hijacking vulnerabilities across multi-tab workflows.
                    </p>
                  </div>

                  {/* Card 4: Indian Financial Compliance */}
                  <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-5 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                        <Cpu size={20} />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase tracking-wider">
                        Audit Immutable
                      </span>
                    </div>
                    <h3 className="font-bold text-base mb-1">RBI & GSTIN Ledger Lock</h3>
                    <p className="text-xs text-white/70 leading-relaxed">
                      Every invoice and Khata transaction is recorded with immutable reference locking and exact tax rounding algorithms.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="live"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-7 text-white shadow-2xl relative"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="text-white font-bold text-xl">Invoice #BF-2026-001</div>
                      <div className="text-white/60 text-xs mt-0.5">Automated GST Calculation Engine</div>
                    </div>
                    <div className="px-3.5 py-1.5 bg-emerald-500/30 border border-emerald-400/40 rounded-full flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-emerald-300 text-xs font-bold">VERIFIED PAID</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6 bg-black/20 rounded-2xl p-4 border border-white/10">
                    {[
                      { name: "MacBook Air M3 16GB", hsn: "84713010", amount: "₹1,15,000", gst: "18% GST" },
                      { name: "Enterprise BillForge License", hsn: "998314", amount: "₹24,000", gst: "18% GST" },
                    ].map((item, i) => (
                      <div key={item.name} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
                        <div>
                          <span className="text-white/90 text-sm font-medium block">{item.name}</span>
                          <span className="text-white/40 text-[11px]">HSN: {item.hsn} • {item.gst}</span>
                        </div>
                        <span className="text-white font-bold text-sm">{item.amount}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-white/15">
                    <div>
                      <span className="text-white/70 text-xs uppercase tracking-wider font-semibold block">Total Payable</span>
                      <span className="text-emerald-400 text-xs font-medium">Includes CGST & SGST Breakup</span>
                    </div>
                    <span className="text-white font-extrabold text-2xl">₹1,39,000</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 text-center">
              <p className="text-white/60 text-xs">
                Built with human brain architecture for top Indian enterprises and MSMEs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
