"use client";

import { AnimatedRouteWrapper } from "@/components/ui/MotionWrapper";
import { usePathname } from "@/i18n/routing";

export default function DashboardTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <AnimatedRouteWrapper pathKey={pathname}>
            {children}
        </AnimatedRouteWrapper>
    );
}
