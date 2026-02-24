"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    // Next-themes hydration handling
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-[84px] h-[40px] rounded-full bg-[var(--card)] neo-soft opacity-50 relative pointer-events-none">
                <div className="absolute top-1 bottom-1 w-[32px] rounded-full bg-gray-300"></div>
            </div>
        );
    }

    const isDark = theme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`
        relative w-[84px] h-[40px] rounded-[24px] overflow-hidden transition-colors duration-500 ease-in-out cursor-pointer flex-shrink-0
        ${isDark ? 'bg-[#1e293b]' : 'bg-[#76c3fa]'}
        shadow-[inset_0_4px_8px_rgba(0,0,0,0.3)] border border-transparent
      `}
            aria-label="Toggle Dark Mode"
        >
            {/* --- Light Mode Sky & Clouds --- */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={false}
                animate={{ opacity: isDark ? 0 : 1, y: isDark ? -10 : 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            >
                {/* Layered Clouds at the bottom */}
                {/* Cloud Base */}
                <div className="absolute -bottom-1 -right-2 w-16 h-8 bg-white/90 rounded-[20px] blur-[1px]"></div>
                <div className="absolute bottom-1 right-2 w-6 h-6 bg-white/95 rounded-full blur-[1px]"></div>
                <div className="absolute -bottom-2 left-6 w-10 h-10 bg-white/90 rounded-full blur-[1px]"></div>
                <div className="absolute bottom-0 left-2 w-6 h-6 bg-white/80 rounded-full blur-[1px]"></div>
            </motion.div>

            {/* --- Dark Mode Night & Stars --- */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={false}
                animate={{ opacity: isDark ? 1 : 0, y: isDark ? 0 : 10 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            >
                {/* Background gradient for night sky */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#141b2d] to-[#1e293b] opacity-80"></div>
                {/* Stars */}
                <div className="absolute top-[8px] left-[18px] w-[3px] h-[3px] bg-white rounded-full shadow-[0_0_5px_rgba(255,255,255,0.8)] opacity-90 animate-pulse"></div>
                <div className="absolute top-[20px] left-[32px] w-[2px] h-[2px] bg-white rounded-full shadow-[0_0_4px_white] opacity-60"></div>
                <div className="absolute bottom-[8px] left-[20px] w-[2px] h-[2px] bg-white rounded-full opacity-70"></div>
                <div className="absolute top-[12px] right-[40px] w-[2px] h-[2px] bg-white rounded-full opacity-50"></div>
                <div className="absolute bottom-[10px] right-[45px] w-[3px] h-[3px] bg-white rounded-full opacity-80 shadow-[0_0_5px_rgba(255,255,255,0.7)]"></div>

                {/* Subtle crescent or sweeping gradient in background */}
                <div className="absolute bottom-[-10px] left-[-10px] w-20 h-20 rounded-full border border-white/5 opacity-[0.15]"></div>
            </motion.div>

            {/* --- The Sliding Knob (Sun / Moon) --- */}
            <motion.div
                className="absolute top-[3px] bottom-[3px] w-[34px] rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.4)] z-10 flex items-center justify-center overflow-hidden"
                initial={false}
                animate={{
                    left: isDark ? "calc(100% - 37px)" : "3px",
                    backgroundColor: isDark ? "#cbd5e1" : "#fbbf24", // Moon slate-300 vs Sun amber-400
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
                {/* Sun inner glow (Only shown in Light Mode) */}
                <motion.div
                    animate={{ opacity: isDark ? 0 : 1 }}
                    className="absolute inset-0 rounded-full shadow-[inset_-2px_-2px_6px_rgba(0,0,0,0.1),inset_2px_2px_4px_rgba(255,255,255,0.5)] pointer-events-none"
                ></motion.div>

                {/* Moon Craters & Shade (Only shown in Dark Mode) */}
                <motion.div
                    initial={false}
                    animate={{ opacity: isDark ? 1 : 0, scale: isDark ? 1 : 0.5, rotate: isDark ? 0 : -45 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 pointer-events-none"
                >
                    {/* Base Moon Shadow */}
                    <div className="absolute inset-0 rounded-full shadow-[inset_-4px_-4px_8px_rgba(0,0,0,0.2),inset_2px_2px_4px_rgba(255,255,255,0.8)]"></div>
                    {/* Large Crater */}
                    <div className="absolute top-[20%] left-[25%] w-[25%] h-[25%] bg-[#94a3b8] rounded-full shadow-[inset_1px_1px_3px_rgba(0,0,0,0.3)]"></div>
                    {/* Small Craters */}
                    <div className="absolute bottom-[25%] right-[25%] w-[35%] h-[35%] bg-[#94a3b8] rounded-full shadow-[inset_1px_1px_3px_rgba(0,0,0,0.3)]"></div>
                    <div className="absolute top-[45%] right-[20%] w-[18%] h-[18%] bg-[#94a3b8] rounded-full shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3)]"></div>
                </motion.div>

            </motion.div>
        </button>
    );
}
