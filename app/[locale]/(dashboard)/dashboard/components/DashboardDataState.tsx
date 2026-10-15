import { AlertCircle, RotateCcw } from "lucide-react";
import { Link } from "@/i18n/routing";

interface DashboardDataStateProps {
  title: string;
  description: string;
  retryLabel: string;
  compact?: boolean;
}

export function DashboardDataState({
  title,
  description,
  retryLabel,
  compact = false,
}: DashboardDataStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? "min-h-40 py-6" : "min-h-56 py-10"
      } px-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)]`}
      role="status"
      aria-live="polite"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--foreground)]/8 text-[var(--foreground)]/65">
        <AlertCircle size={21} aria-hidden="true" />
      </div>
      <h3 className="mt-3 text-sm font-bold text-[var(--foreground)]">{title}</h3>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-[var(--foreground)]/60">{description}</p>
      <Link
        href="/dashboard?refresh=1"
        className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-bold text-[var(--foreground)] transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-elevated)]"
      >
        <RotateCcw size={14} aria-hidden="true" />
        {retryLabel}
      </Link>
    </div>
  );
}
