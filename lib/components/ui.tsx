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
}: ConfirmDialogProps) {
  if (!open) return null;

  const buttonStyle = {
    danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-[0_4px_20px_rgba(239,68,68,0.3)]",
    warning: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-[0_4px_20px_rgba(245,158,11,0.3)]",
    default: "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-[0_4px_20px_rgba(99,102,241,0.3)]",
  }[variant];

  return (
    <div className="glass-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
        className="glass-heavy w-full max-w-md p-6"
      >
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2 tracking-tight">{title}</h2>
        <p className="text-[var(--foreground)]/70 text-sm leading-relaxed mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="glass-btn-secondary flex-1"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 text-white rounded-full font-semibold transition-all active:scale-95 ${buttonStyle}`}
          >
            {confirmLabel}
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
