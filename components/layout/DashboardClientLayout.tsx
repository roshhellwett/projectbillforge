"use client";

import React from "react";
import { usePathname } from "@/i18n/routing";
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

  const getCurrentPage = () => {
    if (pathname.includes("invoices")) return "invoices";
    if (pathname.includes("customers")) return "customers";
    if (pathname.includes("products")) return "products";
    if (pathname.includes("khata")) return "khata";
    if (pathname.includes("settings")) return "settings";
    return "dashboard";
  };

  return (
    <>
      <MobileHeader session={session} />
      <ErrorBoundary>{children}</ErrorBoundary>
      <BottomNavigation currentPage={getCurrentPage()} />
      <KeyboardShortcutsHelp />
      <CommandMenu />
    </>
  );
}
