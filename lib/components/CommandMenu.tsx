"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, LayoutDashboard, FileText, Users, Package, Settings, LogOut, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";

interface Action {
    id: string;
    name: string;
    icon: React.ElementType;
    shortcut?: string[];
    keywords: string[];
    perform: () => void;
    color?: string;
    bgColor?: string;
}

export function CommandMenu() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Toggle menu on Cmd+K / Ctrl+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }

            if (e.key === "Escape") {
                setOpen(false);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const actions: Action[] = [
        {
            id: "dashboard",
            name: "Dashboard Home",
            icon: LayoutDashboard,
            shortcut: ["G", "D"],
            keywords: ["home", "main"],
            perform: () => router.push("/dashboard"),
            color: "#10b981",
            bgColor: "bg-emerald-500/10 dark:bg-emerald-500/15",
        },
        {
            id: "khata",
            name: "Khata Ledger",
            icon: BookOpen,
            shortcut: ["G", "K"],
            keywords: ["ledger", "khata", "finance"],
            perform: () => router.push("/dashboard/khata"),
            color: "#f43f5e",
            bgColor: "bg-rose-500/10 dark:bg-rose-500/15",
        },
        {
            id: "invoices",
            name: "Manage Invoices",
            icon: FileText,
            shortcut: ["G", "I"],
            keywords: ["billing", "receipts", "sales"],
            perform: () => router.push("/dashboard/invoices"),
            color: "#6366f1",
            bgColor: "bg-indigo-500/10 dark:bg-indigo-500/15",
        },
        {
            id: "customers",
            name: "Manage Customers",
            icon: Users,
            shortcut: ["G", "C"],
            keywords: ["people", "clients", "users"],
            perform: () => router.push("/dashboard/customers"),
            color: "#f59e0b",
            bgColor: "bg-amber-500/10 dark:bg-amber-500/15",
        },
        {
            id: "products",
            name: "Manage Products",
            icon: Package,
            shortcut: ["G", "P"],
            keywords: ["inventory", "stock", "items"],
            perform: () => router.push("/dashboard/products"),
            color: "#a855f7",
            bgColor: "bg-purple-500/10 dark:bg-purple-500/15",
        },
        {
            id: "settings",
            name: "Account Settings",
            icon: Settings,
            shortcut: ["G", "S"],
            keywords: ["preferences", "profile", "account"],
            perform: () => router.push("/dashboard/settings"),
            color: "#64748b",
            bgColor: "bg-slate-500/10 dark:bg-slate-500/15",
        },
        {
            id: "logout",
            name: "Sign out",
            icon: LogOut,
            keywords: ["logout", "exit", "leave"],
            perform: () => signOut({ callbackUrl: "/login" }),
            color: "#ef4444",
            bgColor: "bg-red-500/10 dark:bg-red-500/15",
        },
    ];

    const filteredActions = query === ""
        ? actions
        : actions.filter((action) => {
            const search = query.toLowerCase();
            return (
                action.name.toLowerCase().includes(search) ||
                action.keywords.some((kw) => kw.includes(search))
            );
        });

    // Handle keyboard navigation within the menu
    useEffect(() => {
        if (!open) {
            setQuery("");
            setSelectedIndex(0);
            return;
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % filteredActions.length);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
            } else if (e.key === "Enter" && filteredActions.length > 0) {
                e.preventDefault();
                filteredActions[selectedIndex].perform();
                setOpen(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, filteredActions, selectedIndex]);

    // Reset selected index when query changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    // Focus input when opened
    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    // Scroll active item into view
    useEffect(() => {
        if (listRef.current) {
            const activeElement = listRef.current.children[selectedIndex] as HTMLElement;
            if (activeElement) {
                activeElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
            }
        }
    }, [selectedIndex]);

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-hidden">
                    {/* Overlay mask */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setOpen(false)}
                    />

                    {/* Command Menu Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full max-w-xl max-h-[70vh] flex flex-col glass-heavy shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-white/20 dark:border-white/10 rounded-2xl overflow-hidden relative z-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Search Input Area */}
                        <div className="flex items-center gap-3 px-4 sm:px-5 py-4 border-b border-[var(--border)] bg-[var(--background)]/20">
                            <Search className="text-[var(--foreground)]/40 shrink-0" size={20} />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Type a command or search..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="flex-1 bg-transparent border-none outline-none text-base sm:text-lg text-[var(--foreground)] placeholder:text-[var(--foreground)]/40"
                            />
                            <div className="text-[10px] sm:text-xs font-medium text-[var(--foreground)]/40 bg-[var(--foreground)]/5 px-2 py-1 rounded-md hidden sm:block">
                                ESC to close
                            </div>
                        </div>

                        {/* Actions List */}
                        <div
                            ref={listRef}
                            className="overflow-y-auto p-2 sm:p-3 scroll-smooth max-h-[40vh] min-h-[150px]"
                        >
                            {filteredActions.length === 0 ? (
                                <div className="py-12 text-center text-sm text-[var(--foreground)]/50">
                                    No results found.
                                </div>
                            ) : (
                                filteredActions.map((action, i) => {
                                    const isActive = i === selectedIndex;
                                    return (
                                        <div
                                            key={action.id}
                                            className={`
                        flex items-center justify-between gap-3 px-3 py-2.5 sm:py-3 rounded-xl cursor-pointer transition-all duration-200
                        ${isActive
                                                    ? 'bg-[var(--foreground)]/10 dark:bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                                                    : 'hover:bg-[var(--foreground)]/5'
                                                }
                      `}
                                            onClick={() => {
                                                action.perform();
                                                setOpen(false);
                                            }}
                                            onMouseEnter={() => setSelectedIndex(i)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 shrink-0 rounded-lg ${isActive ? action.bgColor : 'bg-transparent border border-transparent'} transition-colors duration-200`}>
                                                    <action.icon
                                                        size={18}
                                                        style={{ color: isActive ? action.color : 'var(--foreground)' }}
                                                        className={!isActive ? "opacity-60" : ""}
                                                    />
                                                </div>
                                                <span className={`text-sm sm:text-base font-medium ${isActive ? 'text-[var(--foreground)]' : 'text-[var(--foreground)]/80'}`}>
                                                    {action.name}
                                                </span>
                                            </div>

                                            {action.shortcut && (
                                                <div className="hidden sm:flex items-center gap-1">
                                                    {action.shortcut.map(key => (
                                                        <kbd key={key} className={`
                              font-sans text-[10px] px-1.5 py-0.5 rounded shadow-[0_1px_0_rgba(0,0,0,0.1)] bg-[var(--background)]/50 border border-[var(--border)]
                              ${isActive ? 'text-[var(--foreground)]/80' : 'text-[var(--foreground)]/40'}
                            `}>
                                                            {key}
                                                        </kbd>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--background)]/30 backdrop-blur-md flex items-center justify-between text-[10px] sm:text-xs text-[var(--foreground)]/50">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-[var(--foreground)]/10">↑</kbd><kbd className="px-1.5 py-0.5 rounded bg-[var(--foreground)]/10">↓</kbd> to navigate</span>
                                <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-[var(--foreground)]/10">↵</kbd> to select</span>
                            </div>
                            <div className="hidden sm:block font-medium tracking-wide uppercase">BillForge Command Menu</div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
