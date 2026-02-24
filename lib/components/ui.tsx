"use client";

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

  const buttonColor = {
    danger: "bg-red-600 hover:bg-red-700",
    warning: "bg-orange-500 hover:bg-orange-600",
    default: "bg-blue-600 hover:bg-blue-700",
  }[variant];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[var(--card)] rounded-2xl w-full max-w-md p-6 shadow-2xl border border-[var(--border)]">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2 tracking-tight">{title}</h2>
        <p className="text-[var(--foreground)]/70 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-[var(--border)] text-[var(--foreground)] rounded-xl hover:bg-[var(--foreground)]/5 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 text-white rounded-xl transition-all shadow-sm active:scale-95 ${buttonColor}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-16 bg-[var(--border)] rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-[var(--border)] rounded-xl animate-pulse w-12 h-12" />
        <div className="space-y-2">
          <div className="h-4 bg-[var(--border)] rounded w-24 animate-pulse" />
          <div className="h-6 bg-[var(--border)] rounded w-32 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
