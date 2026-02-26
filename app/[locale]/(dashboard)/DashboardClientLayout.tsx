"use client";

import { usePathname } from "next/navigation";
import BottomNavigation from "./BottomNavigation";
import { KeyboardShortcutsHelp } from "@/lib/components/KeyboardShortcuts";
import { CommandMenu } from "@/lib/components/CommandMenu";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

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
      {/* Mobile Top Controls (Hidden on Desktop) */}
      <div className="md:hidden fixed top-3 right-3 z-50 flex items-center gap-2">
        <div className="bg-[var(--surface)]/80 backdrop-blur-md border border-[var(--border)] p-1 rounded-xl shadow-sm">
          <LanguageSwitcher />
        </div>
      </div>

      {children}
      <BottomNavigation currentPage={getCurrentPage()} />
      <KeyboardShortcutsHelp />
      <CommandMenu />
    </>
  );
}
