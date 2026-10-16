"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import {
  BookOpen,
  HelpCircle,
  LayoutDashboard,
  Package,
  BarChart3,
  Receipt,
  Settings,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useModalAccessibility } from "./ui";

export type ShellNavigationItem = {
  id: "home" | "assistant" | "invoices" | "customers" | "products" | "khata" | "reports" | "help" | "settings";
  href: string;
  labelKey: "home" | "assistant" | "invoices" | "customers" | "products" | "khata" | "reports" | "help" | "settings";
  icon: LucideIcon;
  mobile: "primary" | "more";
};

/** The single navigation source used by desktop, mobile, and commands. */
export const SHELL_NAVIGATION = [
  { id: "home", href: "/dashboard", labelKey: "home", icon: LayoutDashboard, mobile: "primary" },
  { id: "assistant", href: "/dashboard/assistant", labelKey: "assistant", icon: Sparkles, mobile: "more" },
  { id: "invoices", href: "/dashboard/invoices", labelKey: "invoices", icon: Receipt, mobile: "primary" },
  { id: "customers", href: "/dashboard/customers", labelKey: "customers", icon: Users, mobile: "primary" },
  { id: "products", href: "/dashboard/products", labelKey: "products", icon: Package, mobile: "primary" },
  { id: "khata", href: "/dashboard/khata", labelKey: "khata", icon: BookOpen, mobile: "primary" },
  { id: "reports", href: "/dashboard/reports", labelKey: "reports", icon: BarChart3, mobile: "more" },
  { id: "help", href: "/dashboard/help", labelKey: "help", icon: HelpCircle, mobile: "more" },
  { id: "settings", href: "/dashboard/settings", labelKey: "settings", icon: Settings, mobile: "more" },
] as const satisfies readonly ShellNavigationItem[];

export type ShellShortcutDefinition = {
  id: string;
  key: string;
  shift?: boolean;
  modifier?: "mod";
  labelKey: "newInvoice" | "newCustomer" | "newProduct" | "search" | "commandMenu" | "showShortcuts";
};

/** Only shortcuts with an implementation belong in this registry. */
export const SHELL_SHORTCUTS = {
  newInvoice: { id: "newInvoice", key: "n", shift: true, labelKey: "newInvoice" },
  newCustomer: { id: "newCustomer", key: "c", shift: true, labelKey: "newCustomer" },
  newProduct: { id: "newProduct", key: "p", shift: true, labelKey: "newProduct" },
  search: { id: "search", key: "s", shift: true, labelKey: "search" },
  commandMenu: { id: "commandMenu", key: "k", modifier: "mod", labelKey: "commandMenu" },
  showShortcuts: { id: "showShortcuts", key: "?", shift: true, labelKey: "showShortcuts" },
} as const satisfies Record<string, ShellShortcutDefinition>;

type PlatformModifier = "⌘" | "Ctrl";
type RegisteredShortcut = ShellShortcutDefinition & { action: () => void };

export function getPlatformModifierLabel(): PlatformModifier {
  if (typeof navigator === "undefined") return "Ctrl";

  return /Mac|iPhone|iPad/.test(`${navigator.platform} ${navigator.userAgent}`) ? "⌘" : "Ctrl";
}

export function usePlatformModifier(): PlatformModifier {
  const [modifier, setModifier] = useState<PlatformModifier>("Ctrl");

  useEffect(() => {
    setModifier(getPlatformModifierLabel());
  }, []);

  return modifier;
}

export function getShortcutKeys(
  shortcut: ShellShortcutDefinition,
  modifierLabel: PlatformModifier = getPlatformModifierLabel()
) {
  const keys: string[] = [];

  if (shortcut.modifier === "mod") keys.push(modifierLabel);
  if (shortcut.shift && shortcut.key !== "?") keys.push("Shift");
  keys.push(shortcut.key.toUpperCase());

  return keys;
}

export function formatShortcut(
  shortcut: ShellShortcutDefinition,
  modifierLabel: PlatformModifier = getPlatformModifierLabel()
) {
  return getShortcutKeys(shortcut, modifierLabel).join(" + ");
}

export function matchesShellShortcut(event: KeyboardEvent, shortcut: ShellShortcutDefinition) {
  const hasModifier = event.metaKey || event.ctrlKey;
  const expectsModifier = shortcut.modifier === "mod";

  return (
    event.key.toLowerCase() === shortcut.key.toLowerCase() &&
    event.shiftKey === Boolean(shortcut.shift) &&
    hasModifier === expectsModifier &&
    !event.altKey
  );
}

export function dispatchCommandMenuShortcut() {
  if (typeof document === "undefined") return;

  const isMac = getPlatformModifierLabel() === "⌘";
  document.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: SHELL_SHORTCUTS.commandMenu.key,
      metaKey: isMac,
      ctrlKey: !isMac,
      bubbles: true,
    })
  );
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.isContentEditable
  );
}

function focusSearchInput() {
  document
    .querySelector<HTMLInputElement>(
      'input[type="search"], input[placeholder*="Search"], input[placeholder*="search"], input[placeholder*="खोज"]'
    )
    ?.focus();
}

function useKeyboardShortcuts(shortcuts: readonly RegisteredShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const shortcut = shortcuts.find((candidate) => matchesShellShortcut(event, candidate));

      if (!shortcut || isEditableTarget(event.target)) return;

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
  const t = useTranslations("Shell");
  const modifierLabel = usePlatformModifier();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const shortcuts = useMemo<RegisteredShortcut[]>(
    () => [
      {
        ...SHELL_SHORTCUTS.newInvoice,
        action: () => router.push("/dashboard/invoices?new=true"),
      },
      {
        ...SHELL_SHORTCUTS.newCustomer,
        action: () => router.push("/dashboard/customers?new=true"),
      },
      {
        ...SHELL_SHORTCUTS.newProduct,
        action: () => router.push("/dashboard/products?new=true"),
      },
      {
        ...SHELL_SHORTCUTS.search,
        action: focusSearchInput,
      },
      {
        ...SHELL_SHORTCUTS.commandMenu,
        action: dispatchCommandMenuShortcut,
      },
      {
        ...SHELL_SHORTCUTS.showShortcuts,
        action: () => setIsOpen(true),
      },
    ],
    [router]
  );

  // CommandMenu owns the Mod+K listener so a physical keypress is not toggled twice.
  const actionableShortcuts = useMemo(
    () => shortcuts.filter((shortcut) => shortcut.id !== SHELL_SHORTCUTS.commandMenu.id),
    [shortcuts]
  );

  useKeyboardShortcuts(actionableShortcuts);

  useModalAccessibility({
    open: isOpen,
    containerRef: dialogRef,
    initialFocusRef: closeButtonRef,
    onClose: () => setIsOpen(false),
  });

  const showShortcutsKeys = getShortcutKeys(SHELL_SHORTCUTS.showShortcuts, modifierLabel);

  return (
    <>
      <div className="hidden md:block fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={t("showShortcuts")}
          className="flex min-h-11 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--glass-bg)] px-3 py-2 text-xs font-medium text-[var(--muted-foreground)] shadow-sm backdrop-blur-sm transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
        >
          {showShortcutsKeys.map((key) => (
            <kbd key={key} className="rounded border border-[var(--border)] bg-[var(--surface-elevated)] px-1.5 py-0.5 text-[10px] text-[var(--muted-foreground)]">
              {key}
            </kbd>
          ))}
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" onClick={() => setIsOpen(false)} />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="keyboard-shortcuts-title"
            className="relative glass-heavy p-6 rounded-2xl max-w-md w-full animate-scale-in"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="keyboard-shortcuts-title" className="text-lg font-bold text-[var(--foreground)]">
                {t("keyboardShortcuts")}
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label={t("close")}
                 className="flex min-h-11 min-w-11 items-center justify-center rounded-lg transition-colors hover:bg-[var(--foreground)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              >
                <kbd className="rounded border border-[var(--border)] bg-[var(--surface-elevated)] px-2 py-1 text-xs text-[var(--muted-foreground)]">{t("escape")}</kbd>
              </button>
            </div>
            <div className="space-y-2">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[var(--foreground)]/5"
                >
                  <span className="text-sm text-[var(--foreground)]/70">{t(shortcut.labelKey)}</span>
                  <div className="flex items-center gap-1">
                    {getShortcutKeys(shortcut, modifierLabel).map((key) => (
                      <kbd key={key} className="rounded border border-[var(--border)] bg-[var(--surface-elevated)] px-2 py-1 text-xs text-[var(--muted-foreground)]">
                        {key}
                      </kbd>
                    ))}
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
