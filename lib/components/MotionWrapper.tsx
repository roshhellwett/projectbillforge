"use client";

import { motion, AnimatePresence } from "framer-motion";

/* ═══════════════════════════════════════════
   Smooth spring config — consistent everywhere
   ═══════════════════════════════════════════ */
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
    return (
        <motion.div
            initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
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
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
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
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
                visible: {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    transition: smoothSpring,
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
    return (
        <motion.div
            whileHover={{ scale: 1.015, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={gentleSpring}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function AnimatedBackground() {
    return (
        <div className="gradient-mesh">
            {/* Extra orb via motion for drift effect */}
            <motion.div
                animate={{
                    x: ["0%", "30%", "-20%", "0%"],
                    y: ["0%", "-25%", "25%", "0%"],
                }}
                transition={{
                    duration: 35,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute top-[25%] left-[25%] w-[45%] h-[45%] rounded-full blur-[120px]"
                style={{ background: "var(--mesh-3)" }}
            />
            <motion.div
                animate={{
                    x: ["10%", "-20%", "15%", "10%"],
                    y: ["-10%", "20%", "-15%", "-10%"],
                }}
                transition={{
                    duration: 28,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute top-[50%] right-[10%] w-[35%] h-[35%] rounded-full blur-[100px]"
                style={{ background: "var(--mesh-4)" }}
            />
        </div>
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
    [x: string]: any;
}) {
    return (
        <motion.div
            key={animationKey}
            initial={{ scale: 0.7, y: 8, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            whileHover={{
                scale: 1.15,
                rotate: [0, -8, 8, 0],
                transition: { duration: 0.4, ease: "easeInOut" }
            }}
            whileTap={{ scale: 0.9 }}
            transition={{
                ...smoothSpring,
                damping: isActive ? 14 : 22,
            }}
            className="flex items-center justify-center"
        >
            <Icon {...props} />
        </motion.div>
    );
}

/* ── Modal animation wrapper ── */
export function ModalTransition({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.95, y: 10, filter: "blur(4px)" }}
            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
            className={className}
        >
            {children}
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
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathKey}
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                transition={{
                    duration: 0.25,
                    ease: [0.25, 1, 0.5, 1],
                }}
                className="flex-1 flex flex-col min-h-0 relative"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
