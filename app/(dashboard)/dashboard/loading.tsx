"use client";

import { StaggerContainer, StaggerItem, FadeIn } from "@/lib/components/MotionWrapper";

export default function DashboardLoading() {
    return (
        <StaggerContainer className="space-y-8 p-4 md:p-8">
            {/* Header skeleton */}
            <FadeIn>
                <div className="h-9 w-48 skeleton rounded-xl" />
                <div className="h-4 w-64 skeleton rounded-lg mt-2" />
            </FadeIn>

            {/* Stat cards skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[...Array(4)].map((_, i) => (
                    <StaggerItem key={i}>
                        <div className="glass-card p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 skeleton rounded-2xl" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-3 w-20 skeleton rounded-md" />
                                    <div className="h-7 w-28 skeleton rounded-lg" />
                                </div>
                            </div>
                        </div>
                    </StaggerItem>
                ))}
            </div>

            {/* Content panels skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                    <StaggerItem key={i}>
                        <div className="glass-card p-6">
                            <div className="h-6 w-40 skeleton rounded-lg mb-5" />
                            <div className="space-y-3">
                                {[...Array(4)].map((_, j) => (
                                    <div key={j} className="h-16 skeleton rounded-xl" />
                                ))}
                            </div>
                        </div>
                    </StaggerItem>
                ))}
            </div>
        </StaggerContainer>
    );
}
