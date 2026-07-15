"use client";

import React from "react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Users,
  Package,
  BookOpen,
  Settings,
  Receipt,
  Search,
  Sparkles,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { SignOutButton } from "@/components/layout/signout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { motion } from "framer-motion";

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
  const t = useTranslations("Dashboard");

  const navItems = [
    { href: "/dashboard", label: t("home"), icon: LayoutDashboard },
    { href: "/dashboard/invoices", label: t("invoices"), icon: Receipt },
    { href: "/dashboard/customers", label: t("customers"), icon: Users },
    { href: "/dashboard/products", label: t("products"), icon: Package },
    { href: "/dashboard/khata", label: t("khata"), icon: BookOpen },
    { href: "/dashboard/settings", label: t("settings"), icon: Settings },
  ];

  const triggerSearch = () => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, ctrlKey: true, bubbles: true })
    );
  };

  return (
    <aside className="hidden md:flex fixed md:static inset-y-0 left-0 z-30 w-[280px] lg:w-[280px] bg-[var(--surface)]/95 backdrop-blur-xl border-r border-[var(--border)] shadow-[4px_0_24px_rgba(0,0,0,0.02)] h-full min-h-full self-stretch flex-col transition-all">
      {/* Brand Header */}
      <div className="p-6 flex flex-col gap-4 shrink-0 border-b border-[var(--border)]/60">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              B
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-[var(--foreground)] block leading-none">
                Bill<span className="text-[var(--foreground)]/60 font-medium">Forge</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-500 tracking-wider uppercase block mt-0.5">
                • PRO LEDGER
              </span>
            </div>
          </Link>
        </div>

        {/* Quick Search Trigger */}
        <button
          onClick={() => {
            const e = new KeyboardEvent("keydown", { key: "k", metaKey: true });
            document.dispatchEvent(e);
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)]/60 transition-all shadow-2xs group cursor-pointer"
          title="Search anything... (Cmd+K)"
        >
          <span className="flex items-center gap-2 group-hover:text-[var(--foreground)] transition-colors font-medium">
            <Search size={15} /> Search...
          </span>
          <kbd className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold px-2 py-0.5 rounded shadow-sm bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)]/60">
            Shift+K
          </kbd>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="px-3.5 py-5 space-y-1 flex-1 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]/40 px-3 mb-2">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 font-medium text-sm group relative overflow-hidden
                ${
                  isActive
                    ? "text-[var(--foreground)] font-bold bg-[var(--surface-elevated)] border border-[var(--border)] shadow-2xs"
                    : "text-[var(--foreground)]/60 hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
                }
              `}
            >
              <div className={`p-1 rounded-lg transition-transform duration-200 ${isActive ? "scale-105" : "group-hover:scale-105"}`}>
                <item.icon
                  size={19}
                  strokeWidth={isActive ? 2.5 : 1.75}
                  className={isActive ? "text-[var(--foreground)]" : "text-[var(--foreground)]/60 group-hover:text-[var(--foreground)]"}
                />
              </div>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Support & Profile Footer */}
      <div className="p-4 shrink-0 mt-auto space-y-3 border-t border-[var(--border)]/60 bg-[var(--surface-elevated)]/30">
        {/* Support Card */}
        <div className="bg-zinc-900 dark:bg-zinc-950 rounded-2xl p-4 border border-zinc-800 text-white shadow-md relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold">
              <HelpCircle size={16} />
            </div>
            <div>
              <h3 className="font-bold text-xs text-white">Need Help?</h3>
              <p className="text-[10px] text-zinc-400">Pro Vendor Support</p>
            </div>
          </div>
          <a
            href="mailto:zenithprojects@icloud.com"
            className="flex items-center justify-center gap-1.5 w-full py-2 bg-white/10 hover:bg-white text-white hover:text-zinc-900 rounded-xl text-xs font-bold transition-all"
          >
            Contact Support <ExternalLink size={12} />
          </a>
        </div>

        {/* Quick Preferences Bar (Theme Toggle) */}
        <div className="flex items-center justify-between px-3 py-2 bg-[var(--surface)] dark:bg-slate-900/60 rounded-xl border border-[var(--border)] shadow-2xs">
          <span className="text-xs font-semibold text-[var(--foreground)]/80">Theme</span>
          <ThemeToggle />
        </div>

        {/* User Profile & Sign Out */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 overflow-hidden flex-1 min-w-0 pr-1">
            <div className="w-9 h-9 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] flex items-center justify-center font-bold text-xs shrink-0 shadow-sm font-mono">
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex flex-col overflow-hidden min-w-0">
              <span className="font-bold text-xs text-[var(--foreground)] truncate">
                {session?.user?.name || "Merchant"}
              </span>
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" /> Verified Pro
              </span>
            </div>
          </div>

          <div className="shrink-0">
            <SignOutButton iconOnly />
          </div>
        </div>
      </div>
    </aside>
  );
}
