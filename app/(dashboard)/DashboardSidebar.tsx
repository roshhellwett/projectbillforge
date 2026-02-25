"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  BookOpen,
  Settings,
  Menu,
  X,
  Receipt,
  LogOut,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      {/* ── Mobile Hamburger Trigger (fixed top-left) ── */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-40 md:hidden p-2.5 glass-card rounded-xl"
        aria-label="Open menu"
      >
        <Menu size={20} className="text-[var(--foreground)]" />
      </button>

      {/* ── Mobile Overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-[270px] glass-sidebar
        transform transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        h-full flex flex-col
      `}>
        {/* Logo */}
        <div className="p-6 flex items-center justify-between shrink-0">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight gradient-text">BillForge</h1>
            <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-[var(--foreground)]/40 mt-0.5">
              Zenith Open Source
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 hover:bg-[var(--foreground)]/5 rounded-lg text-[var(--foreground)]/60 transition-colors"
          >
            <X size={18} />
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
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm
                  ${isActive
                    ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] text-white shadow-[0_4px_15px_rgba(99,102,241,0.3)]'
                    : 'text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)]'
                  }
                `}
              >
                <FloatingIcon
                  icon={item.icon}
                  size={20}
                  isActive={isActive}
                  animationKey={`${item.href}-${pathname}`}
                  className={isActive ? "text-white" : "text-[var(--foreground)]/40"}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 shrink-0 mt-auto">
          <div className="glass-light rounded-2xl p-3 space-y-3">
            <div className="flex items-center gap-3 px-1">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent-purple)] flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">
                  {session?.user?.name?.[0]?.toUpperCase() || "B"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--foreground)] truncate">{session?.user?.name}</p>
                <p className="text-xs text-[var(--foreground)]/40 truncate">{session?.user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-1">
              <div className="flex-1">
                <SignOutButton />
              </div>
              <ThemeToggle />
            </div>
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
