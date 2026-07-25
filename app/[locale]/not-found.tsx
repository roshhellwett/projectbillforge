"use client";

import { Link } from "@/i18n/routing";
import { useEffect, useState } from "react";
import { Compass, ArrowLeft, Home, Copy, Check, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  const [path, setPath] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") setPath(window.location.pathname + window.location.search);
  }, []);

  async function copyPath() {
    try {
      await navigator.clipboard.writeText(typeof window !== "undefined" ? window.location.href : path);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--background)] px-6 py-12 relative overflow-hidden">
      {/* Subtle ambient background */}
      <div className="absolute inset-0 pointer-events-none aurora-mesh opacity-70 -z-10" />
      <div className="absolute inset-0 pointer-events-none bg-grid-pattern opacity-50 -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg text-center"
      >
        {/* Compass Illustration */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 rounded-3xl bg-[var(--surface-elevated)] border border-[var(--border)] shadow-[var(--shadow-elevation)] flex items-center justify-center">
            <Compass size={40} className="text-[var(--foreground)]/70" strokeWidth={1.5} />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[var(--foreground)] text-[var(--background)] text-[10px] font-bold flex items-center justify-center shadow-lg">
            404
          </div>
        </div>

        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--foreground)]/50 mb-3">
          BillForge · Navigation error
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)] mb-3 text-balance">
          We couldn&rsquo;t find that page
        </h1>
        <p className="text-sm sm:text-base text-[var(--foreground)]/60 mb-8 max-w-md mx-auto leading-relaxed text-balance">
          The link may be broken, the page may have moved, or you might not have access. Head back to a safe spot.
        </p>

        {/* Requested path box */}
        {path && (
          <div className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-left shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]/50">
                <Search size={11} /> Requested path
              </span>
              <button
                type="button"
                onClick={copyPath}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-[var(--surface-hover)] hover:bg-[var(--border)] text-[var(--foreground)]/80 transition-colors"
                aria-label="Copy requested URL"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <code className="block w-full font-mono text-xs text-[var(--foreground)]/80 break-all">
              {path}
            </code>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 min-h-11 px-6 py-3 bg-[var(--foreground)] text-[var(--background)] text-sm font-semibold rounded-full hover:opacity-90 transition-all shadow-sm w-full sm:w-auto"
          >
            <Home size={16} />
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 min-h-11 px-6 py-3 bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] text-sm font-semibold rounded-full hover:bg-[var(--surface-hover)] transition-all w-full sm:w-auto"
          >
            <ArrowLeft size={16} />
            Back home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
