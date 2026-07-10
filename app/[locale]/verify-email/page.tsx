"use client";

import { useState, use, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { verifyEmail } from "@/lib/actions/verify-email";
import { motion } from "framer-motion";

function VerifyStatus({ token }: { token: string }) {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    verifyEmail(token).then(r => {
      setStatus(r?.error ? "error" : "success");
    });
  }, [token]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      {status === "loading" && (
        <p className="text-[var(--foreground)] font-medium">Verifying your email...</p>
      )}
      {status === "success" && (
        <div className="space-y-4">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl text-emerald-600">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Email verified!</h2>
          <p className="text-sm text-[var(--foreground)]/60">Your email has been successfully verified.</p>
          <Link href="/dashboard" className="inline-block mt-4 glass-btn-primary px-6 py-3 font-medium">
            Go to Dashboard
          </Link>
        </div>
      )}
      {status === "error" && (
        <div className="space-y-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl text-red-600">✗</span>
          </div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Verification failed</h2>
          <p className="text-sm text-[var(--foreground)]/60">This link is invalid or expired.</p>
          <Link href="/login" className="inline-block mt-4 text-[var(--color-primary)] hover:text-[var(--color-primary-light)] font-semibold transition-colors">
            Back to login
          </Link>
        </div>
      )}
    </motion.div>
  );
}

export default function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = use(searchParams);
  const token = params.token;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-sm w-full">
        <h1 className="text-3xl font-bold gradient-text mb-1 text-center">BillForge</h1>
        <p className="text-xs text-[var(--foreground)]/40 tracking-wider uppercase mb-8 text-center">Zenith Open Source</p>
        {token ? <VerifyStatus token={token} /> : (
          <div className="text-center">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Invalid link</h2>
            <p className="text-sm text-[var(--foreground)]/60">No verification token provided.</p>
          </div>
        )}
      </div>
    </div>
  );
}