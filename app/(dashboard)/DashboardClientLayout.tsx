"use client";

import { usePathname } from "next/navigation";
import BottomNavigation from "./BottomNavigation";
import { KeyboardShortcutsHelp } from "@/lib/components/KeyboardShortcuts";

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
      {children}
      <BottomNavigation currentPage={getCurrentPage()} />
      <KeyboardShortcutsHelp />
    </>
  );
}
