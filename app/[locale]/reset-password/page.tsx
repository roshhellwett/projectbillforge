"use client";

import { useState, use, Suspense } from "react";
import { useRouter, Link } from "@/i18n/routing";
import { resetPassword } from "@/lib/actions/password-reset";
import { Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match."); return; }
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-sm"
    >
      <h1 className="text-3xl font-bold gradient-text mb-1">BillForge</h1>
      <p className="text-xs text-[var(--foreground)]/40 tracking-wider uppercase mb-8">Zenith Open Source</p>

      <h2 className="text-2xl font-bold text-[var(--foreground)] mb-1">Set new password</h2>
      <p className="text-sm text-[var(--foreground)]/40 mb-8">Must be at least 8 characters with uppercase, lowercase, and a number.</p>

      {error && (
        <div className="p-3 bg-[var(--color-danger)]/10 text-[var(--color-danger)] rounded-xl text-sm font-medium border border-[var(--color-danger)]/20 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
          <input
            type={show ? "text" : "password"}
            required
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm"
            style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
            autoComplete="new-password"
          />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50 hover:text-[var(--foreground)]/70 transition-colors">
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/50" />
          <input
            type={show ? "text" : "password"}
            required
            placeholder="Confirm new password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="w-full soft-input min-h-[48px] py-3 text-base sm:text-sm"
            style={{ paddingLeft: "2.75rem" }}
            autoComplete="new-password"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full glass-btn-primary py-3 flex items-center justify-center gap-2"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </motion.button>
      </form>

      <p className="mt-6 text-sm text-[var(--foreground)]/40">
        <Link href="/login" className="text-[var(--color-primary)] hover:text-[var(--color-primary-light)] font-semibold transition-colors">
          Back to login
        </Link>
      </p>
    </motion.div>
  );
}

export default function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = use(searchParams);
  const token = params.token;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Invalid reset link</h2>
          <p className="text-sm text-[var(--foreground)]/60 mb-4">This link is missing or invalid.</p>
          <Link href="/forgot-password" className="text-[var(--color-primary)] hover:text-[var(--color-primary-light)] font-semibold transition-colors">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <ResetForm token={token} />
    </div>
  );
}