"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "default";
  loading?: boolean;
  children?: React.ReactNode;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "danger",
  loading = false,
  children,
}: ConfirmDialogProps) {
  if (!open) return null;

  const buttonStyle = {
    danger: "bg-zinc-900 dark:bg-zinc-100 hover:brightness-110 text-white dark:text-zinc-900 shadow-sm font-bold",
    warning: "bg-zinc-800 dark:bg-zinc-200 hover:brightness-110 text-white dark:text-zinc-900 shadow-sm font-bold",
    default: "bg-zinc-900 dark:bg-zinc-100 hover:brightness-110 text-white dark:text-zinc-900 shadow-sm font-bold",
  }[variant];

  return (
    <div className="glass-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="white-container w-full max-w-md p-6 border border-[var(--border)] shadow-xl"
      >
        <h2 className="text-lg font-bold text-[var(--foreground)] mb-2 tracking-tight">{title}</h2>
        <p className="text-[var(--foreground)]/70 text-sm leading-relaxed mb-6">{message}</p>
        {children}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="glass-btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${buttonStyle}`}
          >
            {loading && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-14 skeleton" />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 skeleton rounded-xl" />
        <div className="space-y-2 flex-1">
          <div className="h-4 skeleton w-2/3" />
          <div className="h-5 skeleton w-1/2" />
        </div>
      </div>
    </div>
  );
}
