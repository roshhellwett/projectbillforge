"use client";

import { usePathname } from "next/navigation";
import { AnimatedRouteWrapper } from "@/lib/components/MotionWrapper";

export default function DashboardTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <AnimatedRouteWrapper pathKey={pathname}>
            {children}
        </AnimatedRouteWrapper>
    );
}
