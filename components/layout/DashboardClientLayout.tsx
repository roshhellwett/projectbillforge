"use client";

import React from "react";
import { usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import BottomNavigation from "@/components/layout/BottomNavigation";
import MobileHeader from "@/components/layout/MobileHeader";
import { KeyboardShortcutsHelp } from "@/components/ui/KeyboardShortcuts";
import { CommandMenu } from "@/components/ui/CommandMenu";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

interface DashboardClientLayoutProps {
  children: React.ReactNode;
  session: {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  } | null;
}

export default function DashboardClientLayout({ children, session }: DashboardClientLayoutProps) {
  const pathname = usePathname();
  const shellT = useTranslations("Shell");

  const getCurrentPage = () => {
    if (pathname.includes("invoices")) return "invoices";
    if (pathname.includes("customers")) return "customers";
    if (pathname.includes("products")) return "products";
    if (pathname.includes("khata")) return "khata";
    if (pathname.includes("assistant")) return "assistant";
    if (pathname.includes("reports")) return "reports";
    if (pathname.includes("help")) return "help";
    if (pathname.includes("settings")) return "settings";
    return "dashboard";
  };

  return (
    <>
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-[70] -translate-y-20 rounded-xl bg-[var(--foreground)] px-4 py-2 text-sm font-bold text-[var(--background)] shadow-xl transition-transform focus:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
      >
        {shellT("skipToContent")}
      </a>
      <MobileHeader session={session} />
      <ErrorBoundary>{children}</ErrorBoundary>
      <BottomNavigation currentPage={getCurrentPage()} />
      <KeyboardShortcutsHelp />
      <CommandMenu />
    </>
  );
}
