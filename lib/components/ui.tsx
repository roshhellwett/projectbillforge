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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">{title}</h2>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 text-white rounded-xl ${buttonColor}`}
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
        <div key={i} className="h-16 bg-slate-200 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-200 rounded-xl animate-pulse w-12 h-12" />
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
          <div className="h-6 bg-slate-200 rounded w-32 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
