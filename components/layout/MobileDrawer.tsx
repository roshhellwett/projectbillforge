"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import {
  X,
  User,
  Settings,
  HelpCircle,
  ShieldCheck,
  Search,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { SignOutButton } from "@/components/layout/signout-button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

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
  const pathname = usePathname();
  const t = useTranslations("Dashboard");

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
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
          />

          {/* Slide-over Sheet */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-[85%] max-w-sm bg-[var(--surface)] border-l border-[var(--border)] shadow-2xl md:hidden flex flex-col justify-between pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] overflow-y-auto"
          >
            {/* Header Section */}
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)] flex items-center justify-center font-bold shadow-sm font-mono">
                  {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-sm text-[var(--foreground)] truncate">
                    {session?.user?.name || "Verified Merchant"}
                  </span>
                  <span className="text-[11px] text-[var(--foreground)]/60 truncate">
                    {session?.user?.email || "vendor@billforge.app"}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-[var(--surface-elevated)] text-[var(--foreground)]/70 hover:text-[var(--foreground)] active:scale-95 transition-all"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content List */}
            <div className="p-5 flex-1 space-y-6 overflow-y-auto">
              {/* Account Status Badge */}
              <div className="p-3.5 rounded-2xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/15 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--foreground)]">GST & Khata Ready</p>
                    <p className="text-[10px] text-[var(--foreground)]/60">Enterprise Cloud Sync</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20">
                  Active
                </span>
              </div>

              {/* Quick Actions */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]/40 px-1 mb-2">
                  Quick Actions
                </p>

                <button
                  onClick={() => {
                    onClose();
                    onTriggerSearch?.();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-medium text-[var(--foreground)] transition-all"
                >
                  <span className="flex items-center gap-3">
                    <Search size={16} className="text-[var(--color-primary)]" />
                    Global Search & Commands
                  </span>
                  <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)]/60">
                    Shift+K
                  </kbd>
                </button>

                <Link
                  href="/dashboard/settings"
                  onClick={onClose}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-medium text-[var(--foreground)] transition-all"
                >
                  <span className="flex items-center gap-3">
                    <Settings size={16} className="text-[var(--color-primary)]" />
                    {t("settings")}
                  </span>
                  <ChevronRight size={16} className="text-[var(--foreground)]/40" />
                </Link>

                <a
                  href="mailto:zenithprojects@icloud.com"
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--border)] text-xs font-medium text-[var(--foreground)] transition-all"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle size={16} className="text-[var(--color-primary)]" />
                    Help & Support
                  </span>
                  <ExternalLink size={14} className="text-[var(--foreground)]/40" />
                </a>
              </div>

              {/* Language Switcher Section */}
              <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]/40 px-1">
                  Language & Preferences
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
                BillForge v1.0.0 · Zenith Open Source
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default MobileDrawer;

