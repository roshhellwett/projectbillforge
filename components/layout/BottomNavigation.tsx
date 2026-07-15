"use client";

import React from "react";
import { Link, usePathname } from "@/i18n/routing";
import { LayoutDashboard, Receipt, Users, Package, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

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
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav aria-label="Primary navigation" className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] px-3 pointer-events-none">
      <div className="bg-[var(--surface)]/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-[var(--border)] shadow-[0_10px_30px_rgba(0,0,0,0.15)] rounded-2xl p-1.5 pointer-events-auto flex items-center justify-around">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`relative min-w-11 min-h-11 flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
                active ? "text-[var(--color-primary)]" : "text-[var(--foreground)]/50 hover:text-[var(--foreground)]"
              }`}
            >
              {active && (
                <motion.div
                  layoutId="bottomNavDockGlow"
                  className="absolute inset-0 bg-[var(--color-primary)]/10 rounded-xl -z-10"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.85 }}
                className="p-1 rounded-lg flex items-center justify-center relative"
              >
                <item.icon
                  size={20}
                  strokeWidth={active ? 2.5 : 1.75}
                  className="transition-transform duration-200"
                />
                {active && (
                  <motion.span
                    layoutId="bottomNavDot"
                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-[var(--color-primary)]"
                  />
                )}
              </motion.div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 transition-all ${
                  active ? "font-bold text-[var(--color-primary)] scale-105" : "font-medium"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
