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
  Receipt
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
    { href: "/dashboard/customers", label: "Customers (Khata)", icon: Users },
    { href: "/dashboard/products", label: "Products", icon: Package },
    { href: "/dashboard/khata", label: "Khata Ledger", icon: BookOpen },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-[var(--card)] border-r border-[var(--border)]
        transform transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        h-full flex flex-col pt-4
      `}>
        <div className="p-6 flex items-center justify-between shrink-0 mb-4">
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">BillForge</h1>
            <p className="text-[10px] font-bold tracking-wider uppercase text-[var(--color-primary)] mt-1 opacity-80">Zenith Open Source Projects</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 hover:bg-[var(--foreground)]/10 rounded-lg text-[var(--foreground)]/70"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ease-out font-medium
                  ${isActive
                    ? 'bg-[var(--color-primary)] text-white neo-soft shadow-[0_5px_15px_rgba(59,130,246,0.3)] transform translate-x-2'
                    : 'text-[var(--foreground)]/70 hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)] hover:translate-x-1'
                  }
                `}
              >
                <FloatingIcon
                  icon={item.icon}
                  size={22}
                  isActive={isActive}
                  animationKey={`${item.href}-${pathname}`}
                  className={isActive ? "text-white" : "text-[var(--foreground)]/50"}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 shrink-0 mt-auto">
          <div className="bg-[var(--foreground)]/5 rounded-[2rem] p-2 flex flex-col gap-2">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-10 h-10 bg-white dark:bg-[var(--card)] rounded-full flex items-center justify-center neo-soft shadow-sm">
                <span className="text-[var(--color-primary)] font-bold text-sm">
                  {session?.user?.name?.[0]?.toUpperCase() || "B"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--foreground)] truncate">{session?.user?.name}</p>
                <p className="text-xs text-[var(--foreground)]/60 truncate font-medium">{session?.user?.email}</p>
              </div>
            </div>
            <div className="px-2 pb-2 flex items-center gap-2">
              <div className="flex-1">
                <SignOutButton />
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
