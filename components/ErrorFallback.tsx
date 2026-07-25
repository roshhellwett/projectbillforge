"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, RotateCcw, Copy, Check, Home } from "lucide-react";

export default function ErrorFallback({
  error,
  reset,
}: {
  error: (Error & { digest?: string }) | null | undefined;
  reset?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const details = useMemo(() => {
    const lines: string[] = [];
    lines.push(`Message: ${error?.message || "Unknown error"}`);
    if (error?.name) lines.push(`Name: ${error.name}`);
    if (error?.digest) lines.push(`Digest: ${error.digest}`);
    if (typeof window !== "undefined") {
      lines.push(`URL: ${window.location.href}`);
      lines.push(`User-Agent: ${window.navigator.userAgent}`);
    }
    lines.push(`Time: ${new Date().toISOString()}`);
    if (error?.stack) {
      lines.push("");
      lines.push("Stack:");
      lines.push(error.stack);
    }
    return lines.join("\n");
  }, [error]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(details);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select the textarea
      const el = document.getElementById("bf-error-details") as HTMLTextAreaElement | null;
      el?.select();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background,#0b0b0f)] px-6 py-12">
      <div className="w-full max-w-2xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
            <AlertTriangle size={36} className="text-red-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground,#fff)] mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-[var(--foreground,#fff)]/60 max-w-md">
            An unexpected error occurred. You can copy the details below and share them with support to help us fix it.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur p-4 md:p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--foreground,#fff)]/50">
              Error details
            </span>
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-white/10 hover:bg-white/15 text-[var(--foreground,#fff)] transition-colors"
              aria-label="Copy error details"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <textarea
            id="bf-error-details"
            readOnly
            value={details}
            onFocus={(e) => e.currentTarget.select()}
            spellCheck={false}
            className="w-full h-56 md:h-64 resize-none bg-black/40 border border-white/10 rounded-xl p-3 font-mono text-xs leading-relaxed text-[var(--foreground,#fff)]/80 focus:outline-none focus:ring-2 focus:ring-red-500/40 selection:bg-red-500/30"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {reset && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white text-sm font-medium rounded-full hover:opacity-90 transition-all"
            >
              <RotateCcw size={16} />
              Try again
            </button>
          )}
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-[var(--foreground,#fff)] text-sm font-medium rounded-full transition-colors"
          >
            <Home size={16} />
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
