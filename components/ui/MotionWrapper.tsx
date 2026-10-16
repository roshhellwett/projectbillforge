"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";


const smoothSpring = { type: "spring" as const, stiffness: 260, damping: 24 };
const gentleSpring = { type: "spring" as const, stiffness: 200, damping: 26 };

export function FadeIn({
    children,
    delay = 0,
    className = "",
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    const reduceMotion = useReducedMotion();

    return (
        <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0 } : {
                duration: 0.5,
                delay,
                ease: [0.25, 1, 0.5, 1],
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerContainer({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const reduceMotion = useReducedMotion();

    return (
        <motion.div
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: reduceMotion ? { duration: 0 } : {
                        staggerChildren: 0.07,
                        delayChildren: 0.05,
                    },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const reduceMotion = useReducedMotion();

    return (
        <motion.div
            variants={{
                hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: reduceMotion ? { duration: 0 } : smoothSpring,
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function InteractiveItem({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const reduceMotion = useReducedMotion();

    return (
        <motion.div
            whileHover={reduceMotion ? undefined : { scale: 1.015, y: -1 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            transition={reduceMotion ? { duration: 0 } : gentleSpring}
            className={className}
        >
            {children}
        </motion.div>
    );
}


export function FloatingIcon({
    icon: Icon,
    isActive,
    animationKey,
    ...props
}: {
    icon: React.ElementType;
    isActive: boolean;
    animationKey: string;
    [x: string]: unknown;
}) {
    const reduceMotion = useReducedMotion();

    return (
        <motion.div
            key={animationKey}
            initial={reduceMotion ? false : { scale: 0.7, y: 8, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            whileHover={reduceMotion ? undefined : {
                scale: 1.15,
                rotate: [0, -8, 8, 0],
                transition: { duration: 0.4, ease: "easeInOut" }
            }}
            whileTap={reduceMotion ? undefined : { scale: 0.9 }}
            transition={reduceMotion ? { duration: 0 } : {
                ...smoothSpring,
                damping: isActive ? 14 : 22,
            }}
            className="flex items-center justify-center"
        >
            <Icon {...(props as Record<string, unknown>)} />
        </motion.div>
    );
}


export function AnimatedRouteWrapper({
    children,
    pathKey
}: {
    children: React.ReactNode;
    pathKey: string;
}) {
    const reduceMotion = useReducedMotion();

    return (
        <AnimatePresence mode="popLayout">
            <motion.div
                key={pathKey}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={reduceMotion ? { duration: 0 } : {
                    duration: 0.15,
                    ease: [0.25, 1, 0.5, 1],
                }}
                className="flex-1 flex flex-col min-h-0 relative"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
