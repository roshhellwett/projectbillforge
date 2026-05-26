"use client";

import { Link } from "@/i18n/routing";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-6">
          <FileQuestion size={36} className="text-[var(--color-primary)]" />
        </div>
        <h1 className="text-4xl font-bold text-[var(--foreground)] mb-2">404</h1>
        <p className="text-lg font-semibold text-[var(--foreground)]/70 mb-1">Page not found</p>
        <p className="text-sm text-[var(--foreground)]/40 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white text-sm font-medium rounded-full hover:opacity-90 transition-all"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
