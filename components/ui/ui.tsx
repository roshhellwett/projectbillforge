"use client";

import { useEffect, useId, useRef, type HTMLAttributes, type ReactNode, type RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Inbox, type LucideIcon } from "lucide-react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type=hidden])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "object",
  "embed",
  "[contenteditable='true']",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function isFocusable(element: HTMLElement) {
  if (
    element.hidden ||
    element.getAttribute("aria-hidden") === "true" ||
    !element.matches(FOCUSABLE_SELECTOR)
  ) {
    return false;
  }

  const styles = window.getComputedStyle(element);
  return styles.display !== "none" && styles.visibility !== "hidden";
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isFocusable);
}

function focusElement(element: HTMLElement | null) {
  if (!element) return;

  try {
    element.focus({ preventScroll: true });
  } catch {
    element.focus();
  }
}

let bodyScrollLockCount = 0;
let bodyOverflow = "";
let bodyPaddingRight = "";

function acquireBodyScrollLock() {
  if (typeof document === "undefined") return () => undefined;

  const body = document.body;

  if (bodyScrollLockCount === 0) {
    bodyOverflow = body.style.overflow;
    bodyPaddingRight = body.style.paddingRight;

    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      const currentPadding = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }
  }

  bodyScrollLockCount += 1;
  let released = false;

  return () => {
    if (released) return;
    released = true;
    bodyScrollLockCount = Math.max(0, bodyScrollLockCount - 1);

    if (bodyScrollLockCount === 0) {
      body.style.overflow = bodyOverflow;
      body.style.paddingRight = bodyPaddingRight;
    }
  };
}

interface ModalAccessibilityOptions<T extends HTMLElement> {
  open: boolean;
  containerRef: RefObject<T | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  onClose: () => void;
  closeOnEscape?: boolean;
}

/**
 * Provides the shared lifecycle for modal-like surfaces: focus management,
 * keyboard containment, focus restoration, and body scroll locking.
 */
export function useModalAccessibility<T extends HTMLElement>({
  open,
  containerRef,
  initialFocusRef,
  onClose,
  closeOnEscape = true,
}: ModalAccessibilityOptions<T>) {
  const onCloseRef = useRef(onClose);
  const closeOnEscapeRef = useRef(closeOnEscape);

  useEffect(() => {
    onCloseRef.current = onClose;
    closeOnEscapeRef.current = closeOnEscape;
  }, [closeOnEscape, onClose]);

  useEffect(() => {
    if (!open) return;

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const releaseBodyScrollLock = acquireBodyScrollLock();

    const focusInitialElement = () => {
      const container = containerRef.current;
      if (!container) return;

      const preferredElement = initialFocusRef?.current;
      const firstFocusableElement = getFocusableElements(container)[0] ?? null;
      const target = preferredElement && isFocusable(preferredElement)
        ? preferredElement
        : firstFocusableElement ?? container;

      focusElement(target);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const container = containerRef.current;
      if (!container) return;

      if (event.key === "Escape") {
        if (!closeOnEscapeRef.current || event.defaultPrevented) return;

        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements(container);
      if (focusableElements.length === 0) {
        event.preventDefault();
        focusElement(container);
        return;
      }

      const firstFocusableElement = focusableElements[0];
      const lastFocusableElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (activeElement === container || !container.contains(activeElement)) {
        event.preventDefault();
        focusElement(event.shiftKey ? lastFocusableElement : firstFocusableElement);
      } else if (event.shiftKey && activeElement === firstFocusableElement) {
        event.preventDefault();
        focusElement(lastFocusableElement);
      } else if (!event.shiftKey && activeElement === lastFocusableElement) {
        event.preventDefault();
        focusElement(firstFocusableElement);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const focusFrame = requestAnimationFrame(focusInitialElement);

    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      releaseBodyScrollLock();

      if (previouslyFocusedElement?.isConnected) {
        focusElement(previouslyFocusedElement);
      }
    };
  }, [containerRef, initialFocusRef, open]);
}

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
  loadingLabel?: string;
  children?: ReactNode;
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
  loadingLabel = "Processing...",
  children,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const reduceMotion = useReducedMotion();

  useModalAccessibility({
    open,
    containerRef: dialogRef,
    initialFocusRef: cancelButtonRef,
    onClose: onCancel,
    closeOnEscape: !loading,
  });

  if (!open) return null;

  const buttonStyle = {
    danger: "bg-[var(--color-danger)] hover:brightness-110 text-[var(--danger-contrast)] border border-[var(--color-danger)] shadow-sm font-bold",
    warning: "bg-[var(--color-warning)] hover:brightness-110 text-[var(--warning-contrast)] border border-[var(--color-warning)] shadow-sm font-bold",
    default: "bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-[var(--color-primary-contrast)] border border-[var(--color-primary)] shadow-sm font-bold",
  }[variant];

  return (
    <div className="glass-overlay">
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        aria-busy={loading}
        tabIndex={-1}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="white-container w-full max-w-md p-6 border border-[var(--border)] shadow-xl"
      >
        <h2 id={titleId} className="text-lg font-bold text-[var(--foreground)] mb-2 tracking-tight">{title}</h2>
        <p id={descriptionId} className="text-[var(--foreground)]/70 text-sm leading-relaxed mb-6">{message}</p>
        {children}
        <div className="flex gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            disabled={loading}
            aria-disabled={loading}
            className="glass-btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            aria-busy={loading}
            aria-disabled={loading}
            className={`flex-1 min-h-11 px-4 py-2.5 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] ${buttonStyle}`}
          >
            {loading && (
              <svg aria-hidden="true" className="animate-spin h-4 w-4 text-[var(--color-primary-contrast)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {loading ? loadingLabel : confirmLabel}
          </button>
        </div>
        <span className="sr-only" role="status" aria-live="polite">
          {loading ? loadingLabel : ""}
        </span>
      </motion.div>
    </div>
  );
}

export function Skeleton({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} aria-hidden="true" className={`skeleton ${className}`} />;
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  const rowCount = Math.max(0, Math.floor(rows));

  return (
    <div className="space-y-3" aria-busy="true">
      {[...Array(rowCount)].map((_, i) => (
        <Skeleton key={i} className="h-14" />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "" }: { className?: string } = {}) {
  return (
    <div className={`glass-card p-6 ${className}`} aria-busy="true">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      </div>
    </div>
  );
}

export interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({ label = "Loading", className = "" }: LoadingStateProps) {
  return (
    <div
      className={`flex items-center justify-center gap-2 py-8 text-sm text-[var(--muted-foreground)] ${className}`}
      role="status"
      aria-live="polite"
    >
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--color-primary)]"
      />
      <span>{label}</span>
    </div>
  );
}

export interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface-subtle)] px-6 py-12 text-center ${className}`}>
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)]">
        <Icon size={20} aria-hidden="true" />
      </div>
      <h2 className="text-base font-semibold text-[var(--foreground)]">{title}</h2>
      {description ? <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  description?: ReactNode;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred in this section.",
  retryLabel = "Try again",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-xl border border-[var(--danger-border)] bg-[var(--danger-surface)] px-6 py-12 text-center ${className}`} role="alert">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--danger-border)] bg-[var(--surface)] text-[var(--danger-foreground)]">
        <AlertTriangle size={20} aria-hidden="true" />
      </div>
      <h2 className="text-base font-semibold text-[var(--foreground)]">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">{description}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="glass-btn-secondary mt-5">
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
