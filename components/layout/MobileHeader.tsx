"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import { Search, Menu, X, Receipt, Shield, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import MobileDrawer from "./MobileDrawer";

interface MobileHeaderProps {
  session: {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  } | null;
}

export default function MobileHeader({ session }: MobileHeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const triggerSearch = () => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true, bubbles: true })
    );
  };

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-[var(--surface)]/85 backdrop-blur-xl border-b border-[var(--border)] pt-[env(safe-area-inset-top)] shadow-sm transition-all duration-300">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Brand Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-base shadow-sm group-active:scale-95 transition-transform">
              B
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-[var(--foreground)] leading-tight">
                Bill<span className="text-[var(--foreground)]/60 font-medium">Forge</span>
              </span>
              <span className="text-[9px] font-bold tracking-wider uppercase text-[var(--foreground)]/80 flex items-center gap-0.5">
                • PRO
              </span>
            </div>
          </Link>

          {/* Quick Actions & Menu Trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={triggerSearch}
              className="p-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)]/70 hover:text-[var(--foreground)] active:scale-95 transition-all flex items-center justify-center"
              aria-label="Search"
            >
              <Search size={18} />
            </button>

            <ThemeToggle />

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 active:scale-95 transition-all flex items-center justify-center relative"
              aria-label="Open Menu"
            >
              <Menu size={20} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--color-success)] border border-[var(--surface)]" />
            </button>
          </div>
        </div>
      </header>

      {/* Slide-over Profile Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        session={session}
        onTriggerSearch={triggerSearch}
      />
    </>
  );
}
