"use client";

import { Link, usePathname } from "@/i18n/routing";
import { LayoutDashboard, Receipt, Users, Package, BookOpen, Settings } from "lucide-react";

interface BottomNavigationProps {
  currentPage?: string;
}

export default function BottomNavigation({ currentPage = "dashboard" }: BottomNavigationProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard },
    { href: "/dashboard/invoices", label: "Invoices", icon: Receipt },
    { href: "/dashboard/customers", label: "Customers", icon: Users },
    { href: "/dashboard/products", label: "Products", icon: Package },
    { href: "/dashboard/khata", label: "Khata", icon: BookOpen },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[var(--surface)] border-t border-[var(--border)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.25)] pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around px-1 py-1.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-2.5 rounded-xl transition-colors ${isActive(item.href)
                ? "text-[var(--color-primary)]"
                : "text-[var(--foreground)]/45"
                }`}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${isActive(item.href) ? "bg-[var(--color-primary)]/10" : ""}`}>
                <item.icon size={20} strokeWidth={isActive(item.href) ? 2.5 : 1.75} />
              </div>
              <span className={`text-[10px] ${isActive(item.href) ? "font-semibold" : "font-medium"}`}>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
