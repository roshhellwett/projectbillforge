"use client";

import { createContext, useState, useCallback, useContext, type ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

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
    success: <CheckCircle size={18} className="text-current" aria-hidden="true" />,
    error: <AlertCircle size={18} className="text-current" aria-hidden="true" />,
    info: <Info size={18} className="text-current" aria-hidden="true" />,
    warning: <AlertTriangle size={18} className="text-current" aria-hidden="true" />,
  };

  const backgrounds = {
    success: "status-success",
    error: "status-danger",
    info: "status-info",
    warning: "status-warning",
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex max-w-sm flex-col gap-2 toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-lg animate-slide-in ${backgrounds[toast.type]}`}
          role={toast.type === "error" ? "alert" : "status"}
          aria-live={toast.type === "error" ? "assertive" : "polite"}
        >
          {icons[toast.type]}
          <p className="flex-1 text-sm font-medium text-current">{toast.message}</p>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg opacity-70 transition-opacity hover:opacity-100 focus-visible:opacity-100"
            aria-label="Dismiss notification"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
