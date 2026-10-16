"use client";

import { useId, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useModalAccessibility } from "@/components/ui/ui";
import {
  X,
  Settings,
  HelpCircle,
  ShieldCheck,
  Search,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { SignOutButton } from "@/components/layout/signout-button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  getShortcutKeys,
  SHELL_SHORTCUTS,
  usePlatformModifier,
} from "@/components/ui/KeyboardShortcuts";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  session: {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  } | null;
  onTriggerSearch?: () => void;
}

export function MobileDrawer({
  isOpen,
  onClose,
  session,
  onTriggerSearch,
}: MobileDrawerProps) {
  const t = useTranslations("Dashboard");
  const shellT = useTranslations("Shell");
  const modifierLabel = usePlatformModifier();
  const commandMenuShortcutKeys = getShortcutKeys(SHELL_SHORTCUTS.commandMenu, modifierLabel);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerTitleId = useId();

  useModalAccessibility({
    open: isOpen,
    containerRef: drawerRef,
    initialFocusRef: closeButtonRef,
    onClose,
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            aria-hidden="true"
            onClick={(event) => {
              if (event.target === event.currentTarget) onClose();
            }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
          />

          {/* Slide-over Sheet */}
          <motion.div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={drawerTitleId}
            tabIndex={-1}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-[85%] max-w-sm bg-[var(--surface)] border-l border-[var(--border)] shadow-2xl md:hidden flex flex-col justify-between pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] overflow-y-auto"
          >
             <h2 id={drawerTitleId} className="sr-only">{shellT("accountMenu")}</h2>

            {/* Header Section */}
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)] flex items-center justify-center font-bold shadow-sm font-mono">
                  {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-sm text-[var(--foreground)] truncate">
                    {session?.user?.name || shellT("merchant")}
                  </span>
                  <span className="text-[11px] text-[var(--foreground)]/60 truncate">
                    {session?.user?.email || shellT("signedInAccount")}
                  </span>
                </div>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-[var(--surface-elevated)] text-[var(--foreground)]/70 hover:text-[var(--foreground)] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
                 aria-label={shellT("closeMenu")}
              >
                 <X size={18} aria-hidden="true" />
              </button>
            </div>

            {/* Content List */}
            <div className="p-5 flex-1 space-y-6 overflow-y-auto">
              {/* Account Status Badge */}
              <div className="p-3.5 rounded-2xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/15 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                     <ShieldCheck size={18} aria-hidden="true" />
                  </div>
                  <div>
                     <p className="text-xs font-semibold text-[var(--foreground)]">{shellT("workspaceSignedIn")}</p>
                     <p className="text-[10px] text-[var(--foreground)]/60">{shellT("workspaceDataScope")}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20">
                   {shellT("workspaceActive")}
                </span>
              </div>

              {/* Quick Actions */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]/40 px-1 mb-2">
                   {shellT("quickActions")}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onTriggerSearch?.();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-medium text-[var(--foreground)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
                >
                  <span className="flex items-center gap-3">
                     <Search size={16} className="text-[var(--color-primary)]" aria-hidden="true" />
                     {shellT("commandMenu")}
                  </span>
                   <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)]/60">
                     {commandMenuShortcutKeys.map((key) => (
                       <kbd key={key} className="mr-1 last:mr-0">{key}</kbd>
                     ))}
                   </span>
                </button>

                <Link
                  href="/dashboard/assistant"
                  onClick={onClose}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-indigo-500/[0.06] hover:bg-indigo-500/[0.10] border border-indigo-500/15 text-xs font-semibold text-[var(--foreground)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
                >
                  <span className="flex items-center gap-3">
                    <Sparkles size={16} className="text-indigo-600 dark:text-indigo-300" aria-hidden="true" />
                    {t("assistant")}
                  </span>
                     <ChevronRight size={16} className="text-[var(--foreground)]/40" aria-hidden="true" />
                </Link>

                <Link
                  href="/dashboard/settings"
                  onClick={onClose}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-medium text-[var(--foreground)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
                >
                  <span className="flex items-center gap-3">
                      <Settings size={16} className="text-[var(--color-primary)]" aria-hidden="true" />
                    {t("settings")}
                  </span>
                  <ChevronRight size={16} className="text-[var(--foreground)]/40" aria-hidden="true" />
                </Link>

                <Link
                  href="/dashboard/help"
                  onClick={onClose}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-medium text-[var(--foreground)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle size={16} className="text-[var(--color-primary)]" aria-hidden="true" />
                     {shellT("helpSupport")}
                  </span>
                   <ChevronRight size={16} className="text-[var(--foreground)]/40" aria-hidden="true" />
                </Link>
              </div>

              {/* Language Switcher Section */}
              <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]/40 px-1">
                   {shellT("languagePreferences")}
                </p>
                <div className="p-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)]">
                  <LanguageSwitcher />
                </div>
              </div>
            </div>

            {/* Footer Section */}
            <div className="p-5 border-t border-[var(--border)] bg-[var(--surface-elevated)]/50 space-y-3">
              <div className="w-full">
                <SignOutButton />
              </div>
              <p className="text-center text-[10px] text-[var(--foreground)]/30">
                 {shellT("appVersion")}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default MobileDrawer;
