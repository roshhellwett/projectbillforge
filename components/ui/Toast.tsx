"use client";

import { createContext, useState, useCallback, useContext, ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}


function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  const icons = {
    success: <CheckCircle size={18} className="text-[var(--foreground)]" />,
    error: <AlertCircle size={18} className="text-[var(--foreground)]" />,
    info: <Info size={18} className="text-[var(--foreground)]" />,
    warning: <AlertTriangle size={18} className="text-[var(--foreground)]" />,
  };

  const backgrounds = {
    success: "bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700",
    error: "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-800 dark:border-zinc-200",
    info: "bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700",
    warning: "bg-zinc-200 dark:bg-zinc-800 border-zinc-400 dark:border-zinc-600",
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-lg shadow-lg animate-slide-in ${backgrounds[toast.type]}`}
        >
          {icons[toast.type]}
          <p className="flex-1 text-sm font-medium text-[var(--foreground)]">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-2 text-[var(--foreground)]/40 hover:text-[var(--foreground)] transition-colors"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
