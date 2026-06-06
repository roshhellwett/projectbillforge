"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "@/i18n/routing";

interface KeyboardShortcut {
  key: string;
  shift?: boolean;
  action: () => void;
  description: string;
}

function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isEditable =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      const shortcut = shortcuts.find(
        (s) =>
          s.key.toLowerCase() === event.key.toLowerCase() &&
          (s.shift === undefined || s.shift === event.shiftKey)
      );

      if (!shortcut) return;
      
      if (isEditable) return;

      event.preventDefault();
      shortcut.action();
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const shortcuts: KeyboardShortcut[] = [
    { key: "N", shift: true, description: "New Invoice", action: () => router.push("/dashboard/invoices?new=true") },
    { key: "C", shift: true, description: "New Customer", action: () => router.push("/dashboard/customers?new=true") },
    { key: "P", shift: true, description: "New Product", action: () => router.push("/dashboard/products?new=true") },
    { key: "S", shift: true, description: "Search", action: () => document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus() },
    { key: "K", shift: true, description: "Command Menu", action: () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: true, bubbles: true })) },
    { key: "?", shift: true, description: "Show Shortcuts", action: () => setIsOpen(true) },
  ];

  useKeyboardShortcuts(shortcuts);

  return (
    <>
      
      <div className="hidden md:block fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-600 rounded text-[10px]">?</kbd>
        </button>
      </div>

      
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative glass-heavy p-6 rounded-2xl max-w-md w-full animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--foreground)]">Keyboard Shortcuts</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-[var(--foreground)]/10 rounded-lg transition-colors"
              >
                <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs">Esc</kbd>
              </button>
            </div>
            <div className="space-y-2">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.description}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[var(--foreground)]/5"
                >
                  <span className="text-sm text-[var(--foreground)]/70">{shortcut.description}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.shift && <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs">Shift</kbd>}
                    <kbd className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-xs">{shortcut.key.toUpperCase()}</kbd>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
