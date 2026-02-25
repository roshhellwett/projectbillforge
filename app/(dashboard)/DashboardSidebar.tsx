"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  BookOpen,
  Settings,
  Receipt,
  Search,
} from "lucide-react";
import { SignOutButton } from "./signout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { FloatingIcon } from "@/lib/components/MotionWrapper";

interface DashboardSidebarProps {
  session: {
    user?: {
      name?: string | null;
      email?: string | null;
    };
  };
}

export default function DashboardSidebar({ session }: DashboardSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/invoices", label: "Invoices", icon: Receipt },
    { href: "/dashboard/customers", label: "Customers", icon: Users },
    { href: "/dashboard/products", label: "Products", icon: Package },
    { href: "/dashboard/khata", label: "Khata Ledger", icon: BookOpen },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar - completely hidden on mobile */}
      <aside className="hidden md:flex fixed md:static inset-y-0 left-0 z-50 w-[280px] md:w-[270px] lg:w-[280px] bg-[var(--surface)] border-r border-[var(--border)] shadow-[4px_0_24px_rgba(0,0,0,0.02)] h-full flex flex-col transition-all">
        {/* Logo */}
        <div className="p-6 flex flex-col gap-4 shrink-0 border-b border-[var(--border)]/50">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">BillForge</h1>
              <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-[var(--foreground)]/40 mt-0.5">
                Zenith Open Source
              </p>
            </div>
          </div>
          <button
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            className="flex items-center justify-between w-full px-3 py-2 bg-[var(--background)]/40 hover:bg-[var(--background)]/60 border border-[var(--border)] rounded-lg text-xs text-[var(--foreground)]/60 transition-colors group"
          >
            <span className="flex items-center gap-2">
              <Search size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
              Quick Search...
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-1 font-sans text-[10px] px-1.5 py-0.5 rounded shadow-[0_1px_0_rgba(0,0,0,0.1)] bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)]/50">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Nav */}
        <nav className="px-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm
                  ${isActive
                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)]'
                  }
                `}
              >
                <FloatingIcon
                  icon={item.icon}
                  size={20}
                  isActive={isActive}
                  animationKey={`${item.href}-${pathname}`}
                  className={isActive ? "text-[var(--color-primary)]" : "text-[var(--foreground)]/40"}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Support Section */}
        <div className="p-4 shrink-0 mt-auto">
          <div className="bg-[var(--color-primary)]/5 rounded-2xl p-4 text-center border border-[var(--color-primary)]/10">
            <div className="w-12 h-12 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mx-auto mb-3">
              <BookOpen size={20} />
            </div>
            <h3 className="font-semibold text-sm text-[var(--foreground)] mb-1">Need help?</h3>
            <p className="text-[10px] text-[var(--foreground)]/50 mb-3 px-1">
              Do you have any problems while using BillForge?
            </p>
            <a href="mailto:zenithopensource@icloud.com" className="block w-full py-2 bg-white dark:bg-slate-800 rounded-lg text-xs font-medium text-[var(--color-primary)] shadow-sm border border-[var(--border)] hover:bg-[var(--background)] transition-colors">
              Contact Support
            </a>
          </div>

          {/* Minimal Auth/Theme Row */}
          <div className="flex items-center justify-between mt-4 px-2">
            <SignOutButton />
            <ThemeToggle />
          </div>
        </div>

        {/* Credit */}
        <div className="px-5 pb-3 shrink-0">
          <a
            href="https://github.com/roshhellwett"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-[10px] text-[var(--foreground)]/20 hover:text-[var(--foreground)]/40 transition-colors"
          >
            A Zenith Open Source Project · @roshhellwett
          </a>
        </div>
      </aside>
    </>
  );
}
