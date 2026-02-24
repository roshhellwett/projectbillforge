"use client";

import { motion } from "framer-motion";

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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                delay,
                ease: [0.25, 1, 0.5, 1], // Apple-like ease
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
                        staggerChildren: 0.1,
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
                hidden: { opacity: 0, y: 20, scale: 0.95 },
                visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { type: "spring", stiffness: 300, damping: 24 }
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }} /* Bouncy, physical feel */
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function AnimatedBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Soft Ambient Light 1 */}
            <motion.div
                animate={{
                    x: ["-20%", "20%", "0%", "-20%"],
                    y: ["-20%", "10%", "20%", "-20%"],
                    scale: [1, 1.2, 0.9, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[var(--color-primary)]/15 blur-[100px] mix-blend-multiply dark:mix-blend-screen"
            />
            {/* Soft Ambient Light 2 (Accent) */}
            <motion.div
                animate={{
                    x: ["20%", "-20%", "10%", "20%"],
                    y: ["20%", "-10%", "-20%", "20%"],
                    scale: [0.9, 1.1, 1, 0.9],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[70%] rounded-full bg-[var(--color-accent-purple)]/15 blur-[120px] mix-blend-multiply dark:mix-blend-screen"
            />
            {/* Soft Ambient Light 3 (Vibrant Pop) */}
            <motion.div
                animate={{
                    x: ["0%", "30%", "-30%", "0%"],
                    y: ["0%", "-30%", "30%", "0%"],
                }}
                transition={{
                    duration: 35,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full bg-[var(--color-secondary)]/10 blur-[150px] mix-blend-multiply dark:mix-blend-screen"
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
            key={animationKey} // Triggers re-animation on path change
            initial={{ scale: 0.5, y: 15, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, y: 0, rotate: 0, opacity: 1 }}
            whileHover={{
                scale: 1.2,
                rotate: [0, -15, 15, -10, 10, 0],
                y: -2,
                transition: { duration: 0.6, ease: "easeInOut" }
            }}
            whileTap={{ scale: 0.85, rotate: -15, y: 2 }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: isActive ? 12 : 25, // Active icons bounce a bit more eagerly
                mass: 1,
            }}
            className="flex items-center justify-center origin-bottom"
        >
            <Icon {...props} />
        </motion.div>
    );
}
