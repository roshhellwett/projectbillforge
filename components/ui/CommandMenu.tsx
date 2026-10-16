"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LogOut, Plus, Search, type LucideIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import {
  matchesShellShortcut,
  SHELL_NAVIGATION,
  SHELL_SHORTCUTS,
} from "@/components/ui/KeyboardShortcuts";
import { useModalAccessibility } from "@/components/ui/ui";

interface Action {
  id: string;
  name: string;
  icon: LucideIcon;
  keywords: string[];
  perform: () => void;
  bgColor: string;
}

export function CommandMenu() {
  const locale = useLocale();
  const dashboardT = useTranslations("Dashboard");
  const shellT = useTranslations("Shell");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (matchesShellShortcut(event, SHELL_SHORTCUTS.commandMenu)) {
        event.preventDefault();
        setOpen((currentOpen) => !currentOpen);
        return;
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useModalAccessibility({
    open,
    containerRef: dialogRef,
    initialFocusRef: inputRef,
    onClose: () => setOpen(false),
  });

  const actions = useMemo<Action[]>(
    () => [
      ...SHELL_NAVIGATION.map((item) => {
        const name = dashboardT(item.labelKey);
        return {
          id: item.id,
          name,
          icon: item.icon,
          keywords: [name.toLocaleLowerCase(), item.id],
          perform: () => router.push(item.href),
          bgColor: "bg-[var(--info-surface)] border border-[var(--info-border)]",
        };
      }),
      {
        id: "new-invoice",
        name: dashboardT("newInvoice"),
        icon: Plus,
        keywords: [dashboardT("newInvoice").toLocaleLowerCase(), "invoice", "create", "sell"],
        perform: () => router.push("/dashboard/invoices?new=true"),
        bgColor: "bg-[var(--success-surface)] border border-[var(--success-border)]",
      },
      {
        id: "new-customer",
        name: dashboardT("newCustomer"),
        icon: Plus,
        keywords: [dashboardT("newCustomer").toLocaleLowerCase(), "customer", "client", "create"],
        perform: () => router.push("/dashboard/customers?new=true"),
        bgColor: "bg-[var(--success-surface)] border border-[var(--success-border)]",
      },
      {
        id: "new-product",
        name: dashboardT("newProduct"),
        icon: Plus,
        keywords: [dashboardT("newProduct").toLocaleLowerCase(), "product", "stock", "create"],
        perform: () => router.push("/dashboard/products?new=true"),
        bgColor: "bg-[var(--success-surface)] border border-[var(--success-border)]",
      },
      {
        id: "logout",
        name: dashboardT("signOut"),
        icon: LogOut,
        keywords: [dashboardT("signOut").toLocaleLowerCase(), "logout"],
        perform: () => signOut({ callbackUrl: `/${locale}/login` }),
        bgColor: "bg-[var(--info-surface)] border border-[var(--info-border)]",
      },
    ],
    [dashboardT, locale, router]
  );

  const filteredActions = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    if (search === "") return actions;

    return actions.filter(
      (action) =>
        action.name.toLocaleLowerCase().includes(search) ||
        action.keywords.some((keyword) => keyword.includes(search))
    );
  }, [actions, query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelectedIndex(0);
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        if (filteredActions.length === 0) return;
        event.preventDefault();
        setSelectedIndex((previousIndex) => (previousIndex + 1) % filteredActions.length);
      } else if (event.key === "ArrowUp") {
        if (filteredActions.length === 0) return;
        event.preventDefault();
        setSelectedIndex(
          (previousIndex) => (previousIndex - 1 + filteredActions.length) % filteredActions.length
        );
      } else if (event.key === "Enter" && filteredActions.length > 0) {
        event.preventDefault();
        filteredActions[selectedIndex].perform();
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [filteredActions, open, selectedIndex]);

  useEffect(() => {
    setSelectedIndex((previousIndex) => Math.min(previousIndex, Math.max(0, filteredActions.length - 1)));
  }, [filteredActions.length]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (listRef.current && filteredActions.length > 0) {
      const activeElement = listRef.current.children[selectedIndex] as HTMLElement | undefined;
      activeElement?.scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
    }
  }, [filteredActions.length, reduceMotion, selectedIndex]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-hidden">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={shellT("commandMenu")}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.95, y: -20 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl max-h-[70vh] flex flex-col glass-heavy rounded-2xl border border-[var(--glass-border)] shadow-[var(--shadow-hover)] overflow-hidden relative z-10"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 sm:px-5 py-4 border-b border-[var(--border)] bg-[var(--background)]/20">
              <Search className="text-[var(--foreground)]/40 shrink-0" size={20} aria-hidden="true" />
              <input
                 ref={inputRef}
                 type="text"
                 placeholder={shellT("commandMenuPlaceholder")}
                 value={query}
                 onChange={(event) => setQuery(event.target.value)}
                 aria-label={shellT("commandMenuPlaceholder")}
                 aria-controls="command-menu-options"
                 aria-expanded="true"
                 aria-activedescendant={filteredActions.length > 0 ? `command-option-${filteredActions[selectedIndex]?.id}` : undefined}
                 className="flex-1 bg-transparent border-none outline-none text-base sm:text-lg text-[var(--foreground)] placeholder:text-[var(--foreground)]/40"
               />
              <div className="text-[10px] sm:text-xs font-medium text-[var(--foreground)]/40 bg-[var(--foreground)]/5 px-2 py-1 rounded-md hidden sm:block">
                {shellT("escape")} {shellT("close").toLocaleLowerCase()}
              </div>
            </div>

            <div id="command-menu-options" ref={listRef} role="listbox" aria-label={shellT("commandMenu")} className="overflow-y-auto p-2 sm:p-3 scroll-smooth max-h-[40vh] min-h-[150px]">
              {filteredActions.length === 0 ? (
                <div className="py-12 text-center text-sm text-[var(--foreground)]/50">
                  {shellT("noResults")}
                </div>
              ) : (
                filteredActions.map((action, index) => {
                  const isActive = index === selectedIndex;
                  return (
                    <button
                      type="button"
                      key={action.id}
                      id={`command-option-${action.id}`}
                      role="option"
                      aria-selected={isActive}
                      className={`flex items-center justify-between gap-3 px-3 py-2.5 sm:py-3 rounded-xl cursor-pointer transition-all duration-200 w-full text-left ${
                        isActive
                          ? "bg-[var(--surface-hover)] shadow-[inset_0_1px_1px_var(--glass-glow)]"
                          : "hover:bg-[var(--surface-hover)]"
                      }`}
                      onClick={() => {
                        action.perform();
                        setOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <span className="flex items-center gap-3">
                        <span className={`p-2 shrink-0 rounded-lg ${isActive ? action.bgColor : "bg-transparent border border-transparent"} transition-colors duration-200`}>
                           <action.icon
                             size={18}
                             className={`text-[var(--foreground)] ${!isActive ? "opacity-60" : ""}`}
                             aria-hidden="true"
                           />
                        </span>
                        <span className={`text-sm sm:text-base font-medium ${isActive ? "text-[var(--foreground)]" : "text-[var(--foreground)]/80"}`}>
                          {action.name}
                        </span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--background)]/30 backdrop-blur-md flex items-center justify-between text-[10px] sm:text-xs text-[var(--foreground)]/50">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--foreground)]/10">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--foreground)]/10">↓</kbd>
                  {shellT("navigateHint")}
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--foreground)]/10">↵</kbd>
                  {shellT("selectHint")}
                </span>
              </div>
              <div className="hidden sm:block font-medium tracking-wide uppercase">{shellT("commandMenu")}</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
