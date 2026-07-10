"use client";

import { usePathname } from "@/i18n/routing";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { KeyboardShortcutsHelp } from "@/components/ui/KeyboardShortcuts";
import { CommandMenu } from "@/components/ui/CommandMenu";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export default function DashboardClientLayout({ children }: { children: React.ReactNode }) {
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
      <ErrorBoundary>{children}</ErrorBoundary>
      <div className="md:hidden fixed bottom-20 right-3 z-50">
        <div className="bg-[var(--surface)]/80 backdrop-blur-md border border-[var(--border)] p-1 rounded-xl shadow-sm">
          <LanguageSwitcher />
        </div>
      </div>
      <BottomNavigation currentPage={getCurrentPage()} />
      <KeyboardShortcutsHelp />
      <CommandMenu />
    </>
  );
}
