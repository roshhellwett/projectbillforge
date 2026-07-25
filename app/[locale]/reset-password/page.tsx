"use client";

import { useState, use } from "react";
import { useRouter, Link } from "@/i18n/routing";
import { resetPassword } from "@/lib/actions/password-reset";
import { Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, KeyRound, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

function getPwdScore(pwd: string) {
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[a-z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  return score;
}

function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pwdScore = getPwdScore(password);
  const matches = confirm.length > 0 && confirm === password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (pwdScore < 4) {
      setError("Password must be at least 8 characters with uppercase, lowercase, and a number.");
      return;
    }
    setLoading(true);
    setError("");

    const result = await resetPassword(token, password);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/login?reset=1");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-[var(--foreground)] mb-1">Set a new password</h2>
      <p className="text-sm text-[var(--foreground)]/60 mb-6 leading-relaxed">
        Choose a strong password. It will be salted and hashed with Bcrypt — never stored in plain text.
      </p>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-xl text-sm font-medium border border-[var(--color-danger)]/30 mb-4 flex items-start gap-2.5"
        >
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50 pointer-events-none" />
          <label htmlFor="rp-pass" className="sr-only">New password</label>
          <input
            id="rp-pass"
            type={show ? "text" : "password"}
            required
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm focus:ring-2 focus:ring-[var(--color-primary)]/40"
            style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
            autoComplete="new-password"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50 hover:text-[var(--foreground)]/80 transition-colors"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Strength meter */}
        {password.length > 0 && (
          <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] space-y-2.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-[var(--foreground)]/70">Password strength</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                  pwdScore === 4
                    ? "bg-[var(--foreground)] text-[var(--background)]"
                    : "bg-[var(--surface-hover)] text-[var(--foreground)]"
                }`}
              >
                {pwdScore === 4 ? "Bank-grade" : pwdScore === 3 ? "Moderate" : "Weak"}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    pwdScore >= level
                      ? pwdScore === 4
                        ? "bg-[var(--foreground)]"
                        : "bg-[var(--foreground)]/60"
                      : "bg-[var(--border)]"
                  }`}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px] text-[var(--foreground)]/60 pt-1">
              <span className={password.length >= 8 ? "text-[var(--foreground)] font-semibold" : ""}>
                {password.length >= 8 ? "✓" : "○"} Min 8 characters
              </span>
              <span className={/[A-Z]/.test(password) ? "text-[var(--foreground)] font-semibold" : ""}>
                {/[A-Z]/.test(password) ? "✓" : "○"} Uppercase letter
              </span>
              <span className={/[a-z]/.test(password) ? "text-[var(--foreground)] font-semibold" : ""}>
                {/[a-z]/.test(password) ? "✓" : "○"} Lowercase letter
              </span>
              <span className={/[0-9]/.test(password) ? "text-[var(--foreground)] font-semibold" : ""}>
                {/[0-9]/.test(password) ? "✓" : "○"} Numeric digit
              </span>
            </div>
          </div>
        )}

        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50 pointer-events-none" />
          <label htmlFor="rp-confirm" className="sr-only">Confirm new password</label>
          <input
            id="rp-confirm"
            type={show ? "text" : "password"}
            required
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={`w-full soft-input min-h-[48px] py-3 text-base sm:text-sm focus:ring-2 focus:ring-[var(--color-primary)]/40 ${
              confirm.length > 0 && !matches ? "border-[var(--color-danger)]/60" : ""
            }`}
            style={{ paddingLeft: "2.75rem" }}
            autoComplete="new-password"
          />
        </div>
        {confirm.length > 0 && (
          <p className={`text-[11px] font-medium ${matches ? "text-[var(--foreground)]/70" : "text-[var(--color-danger)]"}`}>
            {matches ? "✓ Passwords match" : "✗ Passwords don't match yet"}
          </p>
        )}

        <motion.button
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full glass-btn-primary py-3.5 flex items-center justify-center gap-2 text-base font-semibold rounded-xl shadow-lg"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              <span>Resetting…</span>
            </span>
          ) : (
            <>
              <span>Reset password</span>
              <ArrowRight size={16} />
            </>
          )}
        </motion.button>
      </form>

      <div className="mt-6 pt-5 border-t border-[var(--border)] text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)] hover:opacity-80 transition-opacity"
        >
          <ArrowLeft size={15} /> Back to login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = use(searchParams);
  const token = params.token;

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
            <ShieldCheck size={13} />
            <span>256-bit signed reset · Bcrypt 12-round hashing</span>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-1 tracking-tight">BillForge</h1>
          <p className="text-[11px] text-[var(--foreground)]/50 tracking-[0.15em] uppercase font-semibold">
            Zenith Open Source · Secure Reset
          </p>
        </div>

        <div className="rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-elevation)] p-8 sm:p-10">
          {token ? (
            <ResetForm token={token} />
          ) : (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 mx-auto rounded-full bg-[var(--color-warning)]/10 text-[var(--color-warning)] flex items-center justify-center border border-[var(--color-warning)]/20">
                <KeyRound size={30} strokeWidth={1.8} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)] mb-1">Invalid reset link</h2>
                <p className="text-sm text-[var(--foreground)]/60 leading-relaxed max-w-xs mx-auto">
                  This link is missing or malformed. Request a fresh reset link to continue.
                </p>
              </div>
              <Link
                href="/forgot-password"
                className="inline-flex items-center justify-center gap-2 min-h-11 px-6 py-3 bg-[var(--foreground)] text-[var(--background)] text-sm font-semibold rounded-full hover:opacity-90 transition-all"
              >
                Request a new link <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
