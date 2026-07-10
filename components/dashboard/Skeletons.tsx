import React from 'react';
import { Clock, Users } from "lucide-react";

export function WelcomeBannerSkeleton() {
    return (
        <div className="white-container p-6 sm:p-8 md:p-10 flex items-center justify-between relative overflow-hidden animate-pulse">
            <div className="relative z-10 w-full max-w-xl">
                <div className="h-8 bg-slate-200 dark:bg-slate-700/50 rounded-lg w-3/4 mb-3"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded-lg w-1/2 mb-6"></div>
                <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700/50 rounded-full"></div>
            </div>
        </div>
    );
}

export function OverviewCardsSkeleton() {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-[var(--foreground)]/70 tracking-wide uppercase">Overview</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-5 sm:p-6 rounded-3xl bg-slate-100 dark:bg-slate-800/50 animate-pulse h-[140px]"></div>
                ))}
            </div>
        </div>
    );
}

export function SalesTrendSkeleton() {
    return (
        <div className="white-container p-5 sm:p-6 md:p-7 lg:p-8 h-full flex flex-col animate-pulse min-h-[250px]">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700/50"></div>
                    <div>
                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700/50 rounded mb-1"></div>
                        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700/50 rounded"></div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700/50 rounded mb-1 ml-auto"></div>
                    <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700/50 rounded ml-auto"></div>
                </div>
            </div>
            <div className="flex-1 bg-slate-100 dark:bg-slate-800/30 rounded-xl mt-4"></div>
        </div>
    );
}

export function BusinessSnapshotSkeleton() {
    return (
        <div className="white-container p-5 sm:p-6 md:p-7 lg:p-8 h-full flex flex-col animate-pulse">
            <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700/50 rounded mb-4"></div>
            <div className="space-y-3 flex-1">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/50 rounded-xl"></div>
                ))}
            </div>
        </div>
    );
}

export function RecentInvoicesSkeleton() {
    return (
        <div className="white-container p-5 sm:p-6 md:p-7 lg:p-8 h-full flex flex-col animate-pulse">
            <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-slate-200 dark:bg-slate-700/50 rounded-xl w-8 h-8"></div>
                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700/50 rounded"></div>
            </div>
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700/50"></div>
                            <div>
                                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700/50 rounded mb-1"></div>
                                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700/50 rounded"></div>
                            </div>
                        </div>
                        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700/50 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function TopReceivablesSkeleton() {
    return (
        <div className="white-container p-5 sm:p-6 md:p-7 lg:p-8 h-full flex flex-col animate-pulse">
            <div className="flex items-center gap-3 mb-5">
                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700/50 rounded"></div>
            </div>
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-3">
                            <div>
                                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700/50 rounded mb-1"></div>
                                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700/50 rounded"></div>
                            </div>
                        </div>
                        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700/50 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function LowStockSkeleton() {
    return (
        <div className="glass-card p-4 sm:p-5 md:p-7 animate-pulse">
            <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700/50"></div>
                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700/50 rounded"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700/50 rounded-xl"></div>
                ))}
            </div>
        </div>
    );
}
