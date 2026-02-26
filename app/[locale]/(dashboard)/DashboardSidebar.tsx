"use client";

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
} from "lucide-react";
import { SignOutButton } from "./signout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
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
  const t = useTranslations('Dashboard');

  const navItems = [
    { href: "/dashboard", label: t('home'), icon: LayoutDashboard },
    { href: "/dashboard/invoices", label: t('invoices'), icon: Receipt },
    { href: "/dashboard/customers", label: t('customers'), icon: Users },
    { href: "/dashboard/products", label: t('products'), icon: Package },
    { href: "/dashboard/khata", label: t('khata'), icon: BookOpen },
    { href: "/dashboard/settings", label: t('settings'), icon: Settings },
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
              {t('searchPlaceholder')}
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
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm group relative overflow-hidden
                  ${isActive
                    ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 shadow-[0_2px_10px_rgba(59,130,246,0.05)]'
                    : 'text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)] border border-transparent'
                  }
                `}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--color-primary)] rounded-r-full" />
                )}
                <FloatingIcon
                  icon={item.icon}
                  size={20}
                  isActive={isActive}
                  animationKey={`${item.href}-${pathname}`}
                  className={isActive ? "text-[var(--color-primary)]" : "text-[var(--foreground)]/50 group-hover:text-[var(--foreground)]/80"}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Support Section */}
        <div className="p-4 shrink-0 mt-auto">
          <div className="bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5 rounded-2xl p-4 text-center border border-[var(--color-primary)]/10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-[var(--color-primary)]/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -mb-2 -ml-2 w-16 h-16 bg-[var(--color-secondary)]/10 rounded-full blur-xl pointer-events-none"></div>

            <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[var(--surface)] to-[var(--background)] border border-[var(--border)] text-[var(--color-primary)] flex items-center justify-center mx-auto mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative z-10">
              <BookOpen size={16} />
            </div>
            <h3 className="font-semibold text-xs text-[var(--foreground)] mb-1 relative z-10">Need help?</h3>
            <p className="text-[10px] text-[var(--foreground)]/60 mb-3 px-1 relative z-10">
              Problems while using BillForge?
            </p>
            <a href="mailto:zenithopensource@icloud.com" className="block w-full py-2 bg-[var(--surface)] rounded-lg text-xs font-medium text-[var(--color-primary)] shadow-sm border border-[var(--color-primary)]/20 hover:border-[var(--color-primary)]/40 hover:shadow-md transition-all relative z-10">
              Contact Support
            </a>
          </div>

          {/* Minimal Auth/Theme Row */}
          <div className="flex items-center justify-between mt-3 gap-1 px-1">
            <LanguageSwitcher compact />
            <div className="flex items-center gap-1">
              <div className="transform scale-[0.70] origin-center -mx-2 h-[28px] overflow-visible flex flex-col justify-center">
                <ThemeToggle />
              </div>
              <SignOutButton iconOnly />
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
