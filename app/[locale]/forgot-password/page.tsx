"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { requestPasswordReset } from "@/lib/actions/password-reset";
import { Mail, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await requestPasswordReset(email, locale);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <h1 className="text-3xl font-bold gradient-text mb-1">BillForge</h1>
        <p className="text-xs text-[var(--foreground)]/40 tracking-wider uppercase mb-8">Zenith Open Source</p>

        {sent ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[var(--foreground)]">Check your email</h2>
            <p className="text-sm text-[var(--foreground)]/60 leading-relaxed">
              If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly.
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-light)] font-semibold transition-colors">
              <ArrowLeft size={16} /> Back to login
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-1">Forgot password?</h2>
            <p className="text-sm text-[var(--foreground)]/40 mb-8">Enter your email and we'll send you a reset link.</p>

            {error && (
              <div className="p-3 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-xl text-sm font-medium border border-[var(--color-danger)]/20 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm"
                  style={{ paddingLeft: "2.75rem" }}
                  autoComplete="email"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full glass-btn-primary py-3 flex items-center justify-center gap-2"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </motion.button>
            </form>

            <p className="mt-6 text-sm text-[var(--foreground)]/40">
              <Link href="/login" className="text-[var(--color-primary)] hover:text-[var(--color-primary-light)] font-semibold transition-colors">
                Back to login
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}