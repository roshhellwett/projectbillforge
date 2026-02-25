"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email: email.toLowerCase(),
      password,
    });

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* ─── Left: Login Form ─── */}
      <div className="w-full lg:w-[480px] xl:w-[520px] flex-shrink-0 flex items-center justify-center p-6 sm:p-10 relative z-10 bg-[var(--background)]">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold gradient-text mb-1">BillForge</h1>
            <p className="text-xs text-[var(--foreground)]/40 tracking-wider uppercase">Zenith Open Source</p>
          </div>

          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-1">Welcome back</h2>
          <p className="text-sm text-[var(--foreground)]/40 mb-8">Sign in to manage your business</p>

          {/* Google Sign In */}
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
            <span className="font-medium text-[var(--foreground)]">Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs font-medium text-[var(--foreground)]/25 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm"
                style={{ paddingLeft: '2.75rem' }}
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm"
                style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50 hover:text-[var(--foreground)]/70 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full glass-btn-primary py-3 flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          <p className="mt-8 text-sm text-[var(--foreground)]/40">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[var(--color-primary)] hover:text-[var(--color-primary-light)] font-semibold transition-colors">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>

      {/* ─── Right: Animated Illustration ─── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center">
        {/* Rich professional gradient background */}
        <div className="absolute inset-0 grad-blue opacity-90" />

        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.08)_0%,transparent_70%)] pointer-events-none" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        {/* === Animated Illustration Content === */}
        <div className="relative z-10 w-full max-w-lg px-8">
          {/* Floating invoice card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
            className="relative"
          >
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="white-container p-6"
            >
              {/* Invoice header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-[var(--foreground)] font-bold text-lg">Invoice #001</div>
                  <div className="text-[var(--foreground)]/50 text-sm">Feb 25, 2026</div>
                </div>
                <div className="px-3 py-1.5 bg-emerald-400/20 border border-emerald-400/30 rounded-full">
                  <span className="text-emerald-600 text-xs font-bold">PAID</span>
                </div>
              </div>

              {/* Mock line items */}
              <div className="space-y-3 mb-6">
                {[
                  { name: "Product Design Kit", amount: "₹12,500" },
                  { name: "UI Components Pack", amount: "₹8,200" },
                  { name: "Annual Subscription", amount: "₹24,000" },
                ].map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.15 }}
                    className="flex justify-between items-center py-2 border-b border-[var(--border)]"
                  >
                    <span className="text-[var(--foreground)]/70 text-sm">{item.name}</span>
                    <span className="text-[var(--foreground)] font-semibold text-sm">{item.amount}</span>
                  </motion.div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-2">
                <span className="text-[var(--foreground)]/60 font-medium">Total</span>
                <span className="text-[var(--foreground)] font-bold text-xl">₹44,700</span>
              </div>
            </motion.div>

            {/* Floating stat badges */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 }}
              className="absolute -top-6 -right-4"
            >
              <motion.div
                animate={{ y: [-3, 3, -3] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="white-container px-4 py-3"
              >
                <div className="text-emerald-500 text-xs font-bold mb-0.5">+ 28%</div>
                <div className="text-[var(--foreground)]/40 text-[10px] uppercase tracking-wider">Revenue</div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1 }}
              className="absolute -bottom-4 -left-6"
            >
              <motion.div
                animate={{ y: [3, -3, 3] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="white-container px-4 py-3"
              >
                <div className="text-blue-500 text-xs font-bold mb-0.5">152</div>
                <div className="text-[var(--foreground)]/40 text-[10px] uppercase tracking-wider">Invoices</div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-12 text-center"
          >
            <h2 className="text-white text-2xl font-bold mb-2">Billing made effortless</h2>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs mx-auto">
              Generate GST invoices, manage khata, and track payments — all in one place.
            </p>
            <p className="text-white/25 text-xs mt-4">
              Open source by{" "}
              <a href="https://github.com/roshhellwett" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white/60 underline underline-offset-2 transition-colors">@roshhellwett</a>
            </p>
          </motion.div>

          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [-20, 20, -20],
                x: [-10, 10, -10],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
              className="absolute w-1.5 h-1.5 bg-white/30 rounded-full"
              style={{
                top: `${15 + i * 14}%`,
                left: `${10 + i * 15}%`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
