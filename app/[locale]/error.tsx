"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-[var(--color-danger)]/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={36} className="text-[var(--color-danger)]" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Something went wrong</h1>
        <p className="text-sm text-[var(--foreground)]/40 mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white text-sm font-medium rounded-full hover:opacity-90 transition-all"
        >
          <RotateCcw size={16} />
          Try Again
        </button>
      </div>
    </div>
  );
}
