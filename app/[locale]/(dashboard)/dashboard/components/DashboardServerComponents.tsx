import React from 'react';
import { DollarSign, FileText, Users, AlertTriangle, TrendingUp, Package, BarChart3, Clock, ArrowUpRight, ArrowDownRight, ShoppingBag, Plus } from "lucide-react";
import { InteractiveItem } from "@/lib/components/MotionWrapper";
import Link from "next/link";

export async function WelcomeBannerServer({ salesPromise }: { salesPromise: Promise<any> }) {
    const salesResult = await salesPromise;
    const summary = salesResult.success ? salesResult.summary : { totalInvoices: 0 };

    return (
        <div className="white-container p-6 sm:p-8 md:p-10 flex items-center justify-between relative overflow-hidden">
            <div className="relative z-10 max-w-xl">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--foreground)] tracking-tight">
                    Welcome back to the business
                </h1>
                <p className="text-[var(--foreground)]/60 mt-1 text-sm md:text-base">
                    You have {summary.totalInvoices} invoices processed so far.
                </p>
                <Link href="/dashboard/invoices" className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 bg-[#60a5fa] text-white text-sm font-medium rounded-full cursor-pointer hover:shadow-lg transition-all">
                    New Invoice
                </Link>
            </div>
            <div className="hidden md:flex shrink-0 opacity-90 relative z-10 mr-10">
                <div className="w-32 h-32 bg-[var(--color-primary)]/5 rounded-3xl rotate-12 flex items-center justify-center transform hover:rotate-6 transition-transform duration-500">
                    <FileText size={48} className="text-[var(--color-primary)]/60 -rotate-12" />
                </div>
            </div>
            <div className="absolute -top-20 -right-10 w-64 h-64 bg-slate-100 dark:bg-slate-800/20 rounded-full blur-3xl pointer-events-none" />
        </div>
    );
}

export async function OverviewCardsServer({ salesPromise }: { salesPromise: Promise<any> }) {
    const salesResult = await salesPromise;
    const summary = salesResult.success ? salesResult.summary : {
        todaySales: 0,
        totalSales: 0,
        totalInvoices: 0,
        totalReceivable: 0,
    };

    const statCards = [
        {
            label: "Today's Sales",
            value: `₹${summary.todaySales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            icon: TrendingUp,
            gradClass: "grad-purple",
        },
        {
            label: "Total Sales",
            value: `₹${summary.totalSales.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            icon: DollarSign,
            gradClass: "grad-blue",
        },
        {
            label: "Total Invoices",
            value: summary.totalInvoices.toString(),
            icon: FileText,
            gradClass: "white-container border-none shadow-sm",
        },
        {
            label: "Receivables",
            value: `₹${summary.totalReceivable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            icon: Users,
            gradClass: "grad-pink",
        },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-[var(--foreground)]/70 tracking-wide uppercase">Overview</h2>
                <span className="text-[10px] sm:text-xs font-semibold text-[var(--foreground)]/40 hover:text-[var(--color-primary)] cursor-pointer flex items-center gap-1">View All <ArrowUpRight size={14} /></span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                {statCards.map((card) => {
                    const isGradient = card.gradClass.includes('grad-');
                    return (
                        <InteractiveItem key={card.label}>
                            <div className={`p-5 sm:p-6 group cursor-pointer flex flex-col justify-center rounded-3xl transition-transform hover:-translate-y-1 ${card.gradClass} h-full`}>
                                <div className="flex items-center gap-2 mb-3">
                                    <card.icon size={16} className={isGradient ? 'text-white/90' : 'text-[var(--color-primary)]'} />
                                    <p className={`text-xs font-semibold truncate uppercase tracking-wider ${isGradient ? 'text-white/90' : 'text-[var(--foreground)]/60'}`}>{card.label}</p>
                                </div>
                                <p className={`text-2xl sm:text-3xl font-bold tracking-tight truncate ${isGradient ? 'text-white' : 'text-[var(--foreground)]'}`}>{card.value}</p>
                                <div className="mt-3 flex items-center gap-1.5 opacity-80">
                                    <div className="flex -space-x-1.5">
                                        <div className={`w-5 h-5 rounded-full border border-white ${isGradient ? 'bg-white/20' : 'bg-[var(--color-primary)]/10'}`}></div>
                                        <div className={`w-5 h-5 rounded-full border border-white ${isGradient ? 'bg-white/40' : 'bg-[var(--color-primary)]/30'}`}></div>
                                    </div>
                                    <span className={`text-[9px] ${isGradient ? 'text-white' : 'text-[var(--foreground)]/50'}`}>Updated just now</span>
                                </div>
                            </div>
                        </InteractiveItem>
                    );
                })}
            </div>
        </div>
    );
}

export async function SalesTrendServer({ weeklyPromise }: { weeklyPromise: Promise<any> }) {
    const weeklyResult = await weeklyPromise;
    const weeklyData = weeklyResult.success ? weeklyResult.days : [];

    const weeklyMax = Math.max(...weeklyData.map((d: any) => d.total), 1);
    const weeklyTotal = weeklyData.reduce((acc: number, d: any) => acc + d.total, 0);

    return (
        <div className="white-container p-5 sm:p-6 md:p-7 lg:p-8 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-2.5 bg-blue-600/10 rounded-xl">
                        <BarChart3 style={{ color: '#2563eb' }} size={20} />
                    </div>
                    <div>
                        <h2 className="text-sm sm:text-base font-bold tracking-tight text-[var(--foreground)]">Sales Trend</h2>
                        <p className="text-[10px] sm:text-xs text-[var(--foreground)]/40">Last 7 days</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[9px] sm:text-[10px] font-medium text-[var(--foreground)]/40 uppercase tracking-wider">Weekly Total</p>
                    <p className="text-sm sm:text-lg font-bold text-[var(--foreground)]">₹{weeklyTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>
            </div>

            <div className="relative flex-1" style={{ minHeight: '160px' }}>
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="border-b border-[var(--border)]/30" />
                    ))}
                </div>
                <div className="absolute inset-0 flex items-end gap-1 sm:gap-2 md:gap-3 px-0.5 sm:px-1">
                    {weeklyData.map((day: any, i: number) => {
                        const pct = weeklyMax > 0 ? (day.total / weeklyMax) * 100 : 0;
                        const isToday = i === weeklyData.length - 1;
                        return (
                            <div key={day.date} className="flex-1 flex flex-col items-center justify-end h-full">
                                {day.total > 0 && (
                                    <span className="text-[8px] sm:text-[9px] font-bold text-[var(--foreground)]/50 mb-1 sm:mb-1.5 whitespace-nowrap">
                                        ₹{day.total >= 1000 ? `${(day.total / 1000).toFixed(1)}k` : day.total.toFixed(0)}
                                    </span>
                                )}
                                <div
                                    className={`w-full max-w-[28px] sm:max-w-[36px] md:max-w-[48px] rounded-t-lg transition-all duration-700 ease-out ${isToday
                                        ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                                        : 'bg-blue-600/30'
                                        }`}
                                    style={{ height: `${Math.max(pct, 3)}%`, minHeight: '6px' }}
                                />
                                <span className={`text-[9px] sm:text-[11px] font-semibold mt-1 sm:mt-2 ${isToday ? 'text-blue-600' : 'text-[var(--foreground)]/40'}`}>
                                    {day.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export async function BusinessSnapshotServer({
    salesPromise,
    productsPromise,
    lowStockPromise
}: {
    salesPromise: Promise<any>,
    productsPromise: Promise<any>,
    lowStockPromise: Promise<any>
}) {
    const [salesResult, productsResult, lowStockResult] = await Promise.all([salesPromise, productsPromise, lowStockPromise]);

    const summary = salesResult.success ? salesResult.summary : { totalCustomers: 0, totalInvoices: 0 };
    const totalProducts = productsResult.success ? productsResult.products.length : 0;
    const lowStock = lowStockResult.success ? lowStockResult.products : [];

    return (
        <div className="white-container p-5 sm:p-6 md:p-7 lg:p-8 h-full flex flex-col">
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-[var(--foreground)] mb-3 sm:mb-4">Business Snapshot</h2>
            <div className="space-y-2 sm:space-y-3 flex-1">
                {[
                    { icon: Users, label: "Customers", value: summary.totalCustomers, color: "#2563eb", bg: "bg-blue-600/10" },
                    { icon: Package, label: "Products", value: totalProducts, color: "#6366f1", bg: "bg-indigo-500/10" },
                    { icon: FileText, label: "Invoices", value: summary.totalInvoices, color: "#f59e0b", bg: "bg-amber-500/10" },
                    { icon: AlertTriangle, label: "Low Stock", value: lowStock.length, color: lowStock.length > 0 ? "#ef4444" : "#10b981", bg: lowStock.length > 0 ? "bg-red-500/10" : "bg-emerald-500/10" },
                ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/30 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 transition-colors duration-200 border border-slate-100/50 dark:border-slate-700/30 rounded-xl sm:rounded-2xl">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className={`p-1.5 sm:p-2 ${item.bg} rounded-lg`}>
                                <item.icon size={16} style={{ color: item.color }} />
                            </div>
                            <span className="text-xs sm:text-sm font-medium text-[var(--foreground)]/70">{item.label}</span>
                        </div>
                        <span className="text-sm sm:text-base font-bold text-[var(--foreground)]">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export async function RecentInvoicesServer({ recentPromise }: { recentPromise: Promise<any> }) {
    const recentResult = await recentPromise;
    const recentInvoices = recentResult.success ? recentResult.invoices : [];

    return (
        <div className="white-container p-5 sm:p-6 md:p-7 lg:p-8 h-full flex flex-col">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
                <div className="p-2 bg-blue-600/10 rounded-xl">
                    <Clock style={{ color: '#2563eb' }} size={16} />
                </div>
                <h2 className="text-sm sm:text-base font-bold tracking-tight text-[var(--foreground)]">Recent Invoices</h2>
            </div>
            {recentInvoices.length === 0 ? (
                <div className="text-center py-8 sm:py-10 md:py-12 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700/30">
                    <ShoppingBag className="mx-auto mb-2 sm:mb-3 text-[var(--foreground)]/20" size={32} />
                    <p className="text-[var(--foreground)]/40 font-medium text-sm">No invoices yet</p>
                    <p className="text-xs text-[var(--foreground)]/25 mt-1">Create your first invoice to see it here</p>
                </div>
            ) : (
                <div className="space-y-2 sm:space-y-2.5">
                    {recentInvoices.map((inv: any) => (
                        <InteractiveItem key={inv.id}>
                            <div className="flex items-center justify-between px-3 py-3 sm:px-4 sm:py-4 bg-white dark:bg-[var(--surface)] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 cursor-pointer">
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                    <div className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${inv.paymentStatus === 'paid' ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                                        {inv.paymentStatus === 'paid'
                                            ? <ArrowDownRight size={16} style={{ color: '#10b981' }} />
                                            : <ArrowUpRight size={16} style={{ color: '#f59e0b' }} />
                                        }
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-[var(--foreground)] text-xs sm:text-sm truncate">{inv.customerName}</p>
                                        <p className="text-[10px] sm:text-xs text-[var(--foreground)]/35">{inv.invoiceNumber}</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0 ml-2 sm:ml-3">
                                    <p className="font-bold text-xs sm:text-sm text-[var(--foreground)]">₹{Number(inv.total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                    <span className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider ${inv.paymentStatus === 'paid' ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`}>{inv.paymentStatus}</span>
                                </div>
                            </div>
                        </InteractiveItem>
                    ))}
                </div>
            )}
        </div>
    );
}

export async function TopReceivablesServer({ customersPromise }: { customersPromise: Promise<any> }) {
    const customersResult = await customersPromise;
    const customers = customersResult.success ? customersResult.customers : [];

    const topReceivables = customers
        .filter((c: any) => (c.currentBalance ?? 0) > 0)
        .sort((a: any, b: any) => (b.currentBalance ?? 0) - (a.currentBalance ?? 0))
        .slice(0, 5);

    return (
        <div className="white-container p-5 sm:p-6 md:p-7 lg:p-8 h-full flex flex-col">
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-[var(--foreground)] mb-4 sm:mb-5">Top Receivables</h2>
            {topReceivables.length === 0 ? (
                <div className="text-center py-8 sm:py-10 md:py-12 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700/30">
                    <Users className="mx-auto mb-2 sm:mb-3 text-[var(--foreground)]/20" size={32} />
                    <p className="text-[var(--foreground)]/40 font-medium text-sm">No outstanding balances</p>
                </div>
            ) : (
                <div className="space-y-2 sm:space-y-2.5">
                    {topReceivables.map((customer: any) => (
                        <InteractiveItem key={customer.id}>
                            <div className="flex items-center justify-between px-3 py-3 sm:px-4 sm:py-4 bg-white dark:bg-[var(--surface)] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0 cursor-pointer">
                                <div>
                                    <p className="font-semibold text-[var(--foreground)] text-xs sm:text-sm">{customer.name}</p>
                                    <p className="text-[10px] sm:text-xs text-[var(--foreground)]/35">{customer.phone || "No phone"}</p>
                                </div>
                                <div className="badge badge-warning text-[10px] sm:text-xs">
                                    ₹{(customer.currentBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        </InteractiveItem>
                    ))}
                </div>
            )}
        </div>
    );
}

export async function LowStockAlertsServer({ lowStockPromise }: { lowStockPromise: Promise<any> }) {
    const lowStockResult = await lowStockPromise;
    const lowStock = lowStockResult.success ? lowStockResult.products : [];

    return (
        <div className="glass-card p-4 sm:p-5 md:p-7">
            <h2 className="text-base font-bold tracking-tight text-[var(--foreground)] mb-4 flex items-center gap-2.5">
                <div className="p-2 bg-red-500/10 rounded-xl">
                    <AlertTriangle style={{ color: '#ef4444' }} size={17} />
                </div>
                Low Stock Alerts
            </h2>
            {lowStock.length === 0 ? (
                <div className="text-center py-8 glass-light rounded-xl">
                    <p className="text-[var(--color-success)] font-medium text-sm">✓ All products are well stocked</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {lowStock.map((product: any) => (
                        <InteractiveItem key={product.id}>
                            <div className="flex items-center justify-between p-3.5 glass-light rounded-xl border border-red-500/10 hover:bg-red-500/5 transition-colors cursor-pointer">
                                <div>
                                    <p className="font-semibold text-[var(--foreground)] text-sm">{product.name}</p>
                                    <p className="text-xs text-[var(--foreground)]/35">Threshold: {product.lowStockThreshold}</p>
                                </div>
                                <div className="badge badge-danger">
                                    {product.stockQuantity} left
                                </div>
                            </div>
                        </InteractiveItem>
                    ))}
                </div>
            )}
        </div>
    );
}
