"use client";

import { useEffect, useRef, useState } from "react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { ChevronUp, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { SHELL_NAVIGATION } from "@/components/ui/KeyboardShortcuts";

interface BottomNavigationProps {
  currentPage?: string;
}

export default function BottomNavigation({ currentPage = "dashboard" }: BottomNavigationProps) {
  const pathname = usePathname();
  const t = useTranslations("Dashboard");
  const shellT = useTranslations("Shell");
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  const navItems = SHELL_NAVIGATION.filter((item) => item.mobile === "primary");
  const moreItems = SHELL_NAVIGATION.filter((item) => item.mobile === "more");
  const currentPageId = currentPage === "dashboard" ? "home" : currentPage;

  const isActive = (item: (typeof SHELL_NAVIGATION)[number]) => {
    if (item.href === "/dashboard") {
      return pathname === item.href && currentPageId === item.id;
    }

    return pathname.startsWith(item.href) || currentPageId === item.id;
  };

  useEffect(() => {
    setIsMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMoreOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMoreOpen(false);
        moreButtonRef.current?.focus();
      }
    };

    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!moreMenuRef.current?.contains(target) && !moreButtonRef.current?.contains(target)) {
        setIsMoreOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
    };
  }, [isMoreOpen]);

  const moreIsActive = moreItems.some(isActive);

  return (
    <nav aria-label={shellT("primaryNavigation")} className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] px-3 pointer-events-none">
      <div className="bg-[var(--surface)]/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-[var(--border)] shadow-[0_10px_30px_rgba(0,0,0,0.15)] rounded-2xl p-1.5 pointer-events-auto flex items-center justify-around">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
                key={item.id}
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
                  aria-hidden="true"
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
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}

        <div className="relative flex-1 min-w-11">
          {isMoreOpen && (
            <div
              ref={moreMenuRef}
              id="mobile-more-menu"
              role="menu"
              aria-label={shellT("moreNavigation")}
              className="absolute bottom-[calc(100%+0.75rem)] right-0 min-w-48 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.2)] backdrop-blur-2xl"
            >
              {moreItems.map((item) => {
                const active = isActive(item);
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    role="menuitem"
                    aria-current={active ? "page" : undefined}
                    onClick={() => setIsMoreOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? "bg-[var(--color-primary)]/10 font-bold text-[var(--color-primary)]"
                        : "text-[var(--foreground)]/70 hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
                    }`}
                  >
                     <item.icon size={18} strokeWidth={active ? 2.5 : 1.75} aria-hidden="true" />
                    <span>{t(item.labelKey)}</span>
                  </Link>
                );
              })}
            </div>
          )}

          <button
             ref={moreButtonRef}
            type="button"
            aria-label={shellT("moreNavigation")}
            aria-expanded={isMoreOpen}
             aria-haspopup="menu"
             aria-controls="mobile-more-menu"
            onClick={() => setIsMoreOpen((open) => !open)}
            className={`relative min-w-11 min-h-11 w-full flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
              moreIsActive ? "text-[var(--color-primary)]" : "text-[var(--foreground)]/50 hover:text-[var(--foreground)]"
            }`}
          >
            {moreIsActive && (
              <motion.div
                layoutId="bottomNavMoreGlow"
                className="absolute inset-0 bg-[var(--color-primary)]/10 rounded-xl -z-10"
                transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
              />
            )}
            <motion.div whileTap={{ scale: 0.85 }} className="p-1 rounded-lg flex items-center justify-center relative">
               <MoreHorizontal size={20} strokeWidth={moreIsActive ? 2.5 : 1.75} aria-hidden="true" />
              <ChevronUp
                size={10}
                className={`absolute -right-1 -top-1 transition-transform ${isMoreOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </motion.div>
            <span className={`text-[10px] tracking-tight mt-0.5 transition-all ${moreIsActive ? "font-bold text-[var(--color-primary)] scale-105" : "font-medium"}`}>
              {shellT("more")}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
