'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import {
    CheckCircle2,
    ChevronRight,
    Layout,
    Users,
    Star,
    ArrowRight,
    Menu,
    X,
    Shield,
    Zap,
    Clock,
    MessageSquare
} from 'lucide-react';

// --- Animation Variants ---
const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1
        }
    }
};

const floatAnimation = {
    y: ["-12px", "12px"],
    transition: {
        y: {
            duration: 2.5,
            repeat: Infinity,
            repeatType: "reverse" as const,
            ease: "easeInOut" as const
        }
    }
};

const floatAnimationDelayed = {
    y: ["12px", "-12px"],
    transition: {
        y: {
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse" as const,
            ease: "easeInOut" as const
        }
    }
};

// --- Testimonials Data ---
const testimonials = [
    {
        name: "Rajesh Kumar",
        role: "Kirana Store Owner, Delhi",
        text: "BillForge has made handling daily credit (Udhaar) so much easier. I can now track every rupee with just a few taps on my phone.",
        initials: "RK",
        color: "bg-amber-100 text-amber-600"
    },
    {
        name: "Priya Sharma",
        role: "Hardware Merchant, Jaipur",
        text: "Invoicing used to be a headache every month. Now, I generate professional GST-ready invoices in seconds. My customers love the speed!",
        initials: "PS",
        color: "bg-indigo-100 text-indigo-600"
    },
    {
        name: "Arun Varma",
        role: "Boutique Owner, Mumbai",
        text: "The Khata management feature is a lifesaver. No more physical registers or lost records. It's clean, simple, and very effective.",
        initials: "AV",
        color: "bg-rose-100 text-rose-600"
    },
    {
        name: "Sunita Devi",
        role: "Grain Wholesaler, Punjab",
        text: "Managing hundreds of transactions was impossible before BillForge. Now my business is organized and I have peace of mind.",
        initials: "SD",
        color: "bg-emerald-100 text-emerald-600"
    },
    {
        name: "Vikram Singh",
        role: "Electronics Retailer, Bangalore",
        text: "The best part is how easy it is to use. No technical knowledge needed—it just works. Truly made for Indian small businesses.",
        initials: "VS",
        color: "bg-purple-100 text-purple-600"
    }
];

const TestimonialSlider = () => {
    const [index, setIndex] = useState(0);

    React.useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative max-w-4xl mx-auto min-h-[400px] flex items-center">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full"
                >
                    {/* Visual Card */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-50/50 rounded-[3rem] transform rotate-3 scale-105 -z-10"></div>
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 relative text-center">
                            <div className={`w-24 h-24 ${testimonials[index].color} rounded-full mx-auto mb-6 flex items-center justify-center font-bold text-3xl border-4 border-white shadow-xl`}>
                                {testimonials[index].initials}
                            </div>
                            <h4 className="font-bold text-slate-800 text-xl mb-1">{testimonials[index].name}</h4>
                            <p className="text-slate-500 text-sm mb-6">{testimonials[index].role}</p>

                            <div className="flex justify-center gap-1.5 text-amber-400 mb-8">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={18} fill="currentColor" />
                                ))}
                            </div>

                            {/* Mini UI Element */}
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden text-left">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                    <div className="w-8 h-1.5 bg-white/30 rounded-full"></div>
                                </div>
                                <div className="w-3/4 h-2 bg-white/20 rounded-full mb-2"></div>
                                <div className="w-1/2 h-2 bg-white/20 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center md:text-left">
                        <div className="text-indigo-500 bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-sm mx-auto md:mx-0">
                            <MessageSquare size={32} fill="currentColor" className="opacity-80" />
                        </div>
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 mb-8 leading-tight italic">
                            "{testimonials[index].text}"
                        </h3>
                        <div className="flex items-center justify-center md:justify-start gap-4 border-t border-slate-100 pt-8">
                            <span className="text-slate-500 font-medium">Verified Vendor</span>
                            <div className="flex items-center gap-1 font-bold text-slate-800">
                                <Star fill="#00b67a" color="#00b67a" size={20} /> Trustpilot 4.8/5
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Pagination Dots */}
            <div className="absolute -bottom-16 md:-bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
                {testimonials.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === i ? 'bg-indigo-600 w-8' : 'bg-slate-200 hover:bg-indigo-200'}`}
                        aria-label={`Go to testimonial ${i + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default function LandingPage() {
    const t = useTranslations('Landing');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#fafbff] text-slate-800 font-sans overflow-x-hidden selection:bg-indigo-500 selection:text-white relative">
            {/* Texture Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

            {/* ── Navbar ── */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-lg border-b border-indigo-50/50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">
                                B
                            </div>
                            <span className="font-bold text-xl tracking-tight text-slate-900">BillForge</span>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">{t('navFeatures')}</Link>
                            <Link href="/dashboard/khata" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">{t('navKhata')}</Link>
                            <Link href="/dashboard/invoices" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">{t('navInvoices')}</Link>
                        </div>

                        {/* Auth Buttons */}
                        <div className="hidden md:flex items-center space-x-4">
                            <LanguageSwitcher />
                            <Link
                                href="/login"
                                className="text-slate-600 hover:text-indigo-600 font-medium text-sm px-4 py-2 transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium text-sm px-6 py-2.5 rounded-full shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 transition-all transform hover:-translate-y-0.5"
                            >
                                {t('navRegister')}
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="text-slate-500 hover:text-indigo-600"
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="md:hidden bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xl absolute w-full left-0 top-20 overflow-hidden"
                        >
                            <div className="px-4 pt-2 pb-6 space-y-4">
                                <div className="flex flex-col gap-2">
                                    <Link
                                        href="#features"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="px-3 py-3 text-base font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                    >
                                        {t('navFeatures')}
                                    </Link>
                                    <Link
                                        href="/dashboard/khata"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="px-3 py-3 text-base font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                    >
                                        {t('navKhata')}
                                    </Link>
                                    <Link
                                        href="/dashboard/invoices"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="px-3 py-3 text-base font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                    >
                                        {t('navInvoices')}
                                    </Link>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-4 px-3">
                                    <LanguageSwitcher />
                                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-medium py-3 rounded-xl border border-indigo-200 transition-all">{t('navLogin')}</Link>
                                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-center bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium py-3 rounded-xl shadow-md shadow-indigo-200 transition-all transform hover:-translate-y-0.5">{t('navRegister')}</Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* ── Hero Section ── */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background Decorative Elements */}
                <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-b from-purple-50 to-white -z-10 rounded-bl-[100px] opacity-70"></div>
                <div className="absolute top-20 -left-64 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
                <div className="absolute top-40 -right-64 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pt-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                        {/* Hero Content */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                            className="max-w-2xl mx-auto lg:mx-0"
                        >
                            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-indigo-100 shadow-sm mb-6 mx-auto lg:mx-0">
                                <div className="flex items-center gap-1 text-amber-400">
                                    <Star size={14} fill="currentColor" />
                                    <Star size={14} fill="currentColor" />
                                    <Star size={14} fill="currentColor" />
                                    <Star size={14} fill="currentColor" />
                                    <Star size={14} fill="currentColor" />
                                </div>
                                <span className="text-xs font-semibold text-slate-700 border-l border-slate-200 pl-2 ml-1">Trustpilot 4.8+</span>
                            </motion.div>

                            <motion.h1
                                variants={fadeInUp}
                                className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6 text-center lg:text-left"
                            >
                                {t('heroTitle1')} <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{t('heroTitle2')}</span>
                            </motion.h1>

                            <motion.p
                                variants={fadeInUp}
                                className="text-base sm:text-lg text-slate-600 mb-8 max-w-lg leading-relaxed text-center lg:text-left mx-auto lg:mx-0"
                            >
                                {t('heroSubtitle')}
                            </motion.p>

                            <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                <Link href="/register">
                                    <button className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-4 rounded-full font-semibold shadow-xl shadow-indigo-200 hover:shadow-indigo-300 transition-all transform hover:-translate-y-1 flex items-center gap-2 group whitespace-nowrap">
                                        {t('ctaButton')}
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Link>
                                <div className="flex items-center gap-3 ml-4">
                                    <div className="text-sm font-medium text-slate-600 leading-tight">
                                        Open Source Software <br /><span className="text-slate-900 font-bold">Free to use & deploy 🚀</span>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Hero Imagery / Mockup */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative lg:h-[600px] flex items-center justify-center"
                        >
                            {/* Main Phone Mockup */}
                            <motion.div
                                animate={floatAnimation}
                                className="relative z-20 w-[280px] h-[580px] bg-white rounded-[40px] shadow-2xl p-2 border-4 border-slate-100/50 backdrop-blur-sm"
                            >
                                <div className="absolute top-0 inset-x-0 h-6 flex justify-center">
                                    <div className="w-20 h-4 bg-slate-100 rounded-b-xl"></div>
                                </div>
                                <div className="w-full h-full bg-gradient-to-b from-indigo-50 to-white rounded-[32px] overflow-hidden flex flex-col relative select-none">
                                    {/* Phone UI Header */}
                                    <div className="p-5 pb-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-b-3xl shadow-md">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md font-bold text-xs text-indigo-800">
                                                KA
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                                                <Menu size={16} />
                                            </div>
                                        </div>
                                        <p className="text-indigo-100 text-sm">Hello,</p>
                                        <h3 className="text-xl font-bold mb-4">Roshhellwett ✨</h3>

                                        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3 mb-[-30px] border border-white/10 shadow-lg relative z-10">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                                                <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-md"></div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-sm">Monthly Revenue</p>
                                                <p className="text-xs text-indigo-100">₹1,24,500</p>
                                            </div>
                                            <ChevronRight size={16} />
                                        </div>
                                    </div>

                                    {/* Phone UI Body */}
                                    <div className="flex-1 px-4 pt-10 pb-4 overflow-hidden relative">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-slate-800">Recent Activity</h4>
                                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">+ Invoice</span>
                                        </div>

                                        <div className="space-y-3">
                                            {[
                                                { title: "INV-2026-01", tag: "₹4,500", color: "text-emerald-500", bg: "bg-emerald-50", icon: "📄" },
                                                { title: "Payment Received", tag: "₹1,200", color: "text-indigo-500", bg: "bg-indigo-50", icon: "💰" },
                                                { title: "Khata Updated", tag: "-₹500", color: "text-red-500", bg: "bg-red-50", icon: "📒" }
                                            ].map((item, i) => (
                                                <div key={i} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 cursor-pointer hover:border-indigo-200 transition-colors">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${item.bg}`}>
                                                        {item.icon}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-sm text-slate-800">{item.title}</p>
                                                        <p className="text-xs text-slate-400">10:00 AM - 12:00 PM</p>
                                                    </div>
                                                    <span className={`text-xs font-bold ${item.color}`}>{item.tag}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Phone Floating Action Button */}
                                    <div className="absolute bottom-6 inset-x-0 flex justify-center">
                                        <div className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-300">
                                            <div className="w-6 h-0.5 bg-white relative">
                                                <div className="w-0.5 h-6 bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Floating Element 1 - Top Right */}
                            <motion.div
                                animate={floatAnimationDelayed}
                                className="absolute top-12 -right-16 lg:-right-12 z-30 bg-white/90 p-4 rounded-2xl shadow-[0_20px_50px_rgba(79,70,229,0.15)] border border-indigo-50/50 w-64 hidden sm:block backdrop-blur-md"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <Zap size={14} />
                                    </div>
                                    <h5 className="font-bold text-sm text-slate-800">Weekly Target</h5>
                                </div>
                                <p className="text-xs text-slate-500 mb-3 leading-tight">Collected ₹48.5k of ₹60k target for this week.</p>
                                <div className="w-full bg-slate-100/50 rounded-full h-2 mb-2 p-0.5">
                                    <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-1 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" style={{ width: '85%' }}></div>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold tracking-tight text-indigo-600">
                                    <span>85% Completed</span>
                                    <span>+12% today</span>
                                </div>
                            </motion.div>

                            {/* Floating Element 2 - Bottom Left */}
                            <motion.div
                                animate={floatAnimation}
                                className="absolute bottom-24 -left-12 lg:-left-24 z-30 bg-white/90 p-5 rounded-[2rem] shadow-[0_25px_60px_rgba(0,0,0,0.08)] border border-white w-64 hidden sm:block backdrop-blur-xl"
                            >
                                <div className="flex justify-between items-center mb-5">
                                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2.5">
                                        <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white ring-4 ring-indigo-50">
                                            <Layout size={12} />
                                        </div>
                                        Recent Invoices
                                    </h3>
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">NEW</span>
                                </div>

                                <div className="space-y-2.5">
                                    {[
                                        { title: "INV-089", auth: "paid" },
                                        { title: "INV-090", auth: "pending" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="mt-0.5">
                                                {item.auth === 'paid' ? (
                                                    <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                                                        <CheckCircle2 size={10} />
                                                    </div>
                                                ) : (
                                                    <div className="w-4 h-4 rounded-full border border-amber-300 bg-amber-50"></div>
                                                )}
                                            </div>
                                            <div>
                                                <p className={`text-xs font-semibold ${item.auth === 'paid' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                    {item.title}
                                                </p>
                                                <p className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <Clock size={8} /> {item.auth === 'paid' ? 'Paid Today' : 'Due Today'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── Features/Stats Section ── */}
            <section className="py-20 bg-white relative border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left side UI showcase */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-purple-50 rounded-[3rem] transform -rotate-3 scale-[1.05] -z-10"></div>

                            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-100/50 border border-slate-100 relative">
                                {/* Decorative floating icon */}
                                <div className="absolute -left-6 -top-6 w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 transform rotate-[-10deg]">
                                    <Layout size={28} />
                                </div>

                                <div className="flex justify-between items-center mb-8 pl-0 sm:pl-8">
                                    <h3 className="text-xl sm:text-2xl font-bold text-slate-800">Latest Invoices</h3>
                                    <Link href="/dashboard/invoices">
                                        <button className="text-xs sm:text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                                            + Add Invoice
                                        </button>
                                    </Link>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { title: "Invoice to TechCorp", time: "Created Today", status: "sent" },
                                        { title: "Recurring Khata Entry", time: "Yesterday", status: "pending" },
                                        { title: "Payment from Global Inc", time: "2 Days Ago", status: "paid" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer group">
                                            <div className="mt-1 transform transition-transform group-hover:scale-110">
                                                {item.status === 'paid' ? (
                                                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                                                        <CheckCircle2 size={16} />
                                                    </div>
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full border-2 border-slate-200 group-hover:border-indigo-400 transition-colors"></div>
                                                )}
                                            </div>
                                            <div>
                                                <p className={`font-semibold transition-colors ${item.status === 'paid' ? 'text-slate-500 line-through' : 'text-slate-800 group-hover:text-indigo-600'}`}>
                                                    {item.title}
                                                </p>
                                                <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                                    <Clock size={14} /> {item.time}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                                    <div className="flex items-end gap-1">
                                        <div className="w-2 h-6 bg-indigo-600 rounded-t-sm"></div>
                                        <div className="w-2 h-8 bg-purple-500 rounded-t-sm"></div>
                                        <div className="w-2 h-4 bg-indigo-200 rounded-t-sm"></div>
                                        <div className="w-2 h-10 bg-indigo-600 rounded-t-sm"></div>
                                        <div className="w-2 h-5 bg-purple-300 rounded-t-sm"></div>
                                        <div className="w-2 h-7 bg-indigo-400 rounded-t-sm"></div>
                                    </div>

                                    <div className="flex -space-x-3">
                                        <div className="w-10 h-10 rounded-full border-2 border-white bg-pink-100 text-pink-700 flex items-center justify-center text-xs font-bold pointer-events-none shadow-sm">AB</div>
                                        <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold pointer-events-none shadow-sm">CD</div>
                                        <div className="w-10 h-10 rounded-full border-2 border-white bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold pointer-events-none shadow-sm">EF</div>
                                        <div className="w-10 h-10 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                                            29+
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right side stats & info */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div className="grid grid-cols-2 gap-8 mb-12">
                                <div>
                                    <h4 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2 tracking-tight">Open</h4>
                                    <p className="text-slate-500 font-medium">Source Codebase</p>
                                </div>
                                <div>
                                    <h4 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2 tracking-tight">Free</h4>
                                    <p className="text-slate-500 font-medium">For Everyone</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600">
                                        <Zap size={24} />
                                    </div>
                                    <div>
                                        <h5 className="text-xl font-bold text-slate-900 mb-2">Fast Invoicing</h5>
                                        <p className="text-slate-600 leading-relaxed">Create beautiful, professional invoices in seconds and send them directly to your clients.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center flex-shrink-0 text-purple-600">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <h5 className="text-xl font-bold text-slate-900 mb-2">Digital Khata (Ledger)</h5>
                                        <p className="text-slate-600 leading-relaxed">Keep track of all your customer balances, view transaction history, and easily manage credit.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0 text-amber-600">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h5 className="text-xl font-bold text-slate-900 mb-2">Customer Management</h5>
                                        <p className="text-slate-600 leading-relaxed">Maintain a complete directory of your clients, track their payment patterns, and improve relations.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── Bottom Call to Action ── */}
            <section className="py-24 relative overflow-hidden bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2.5rem] md:rounded-[3rem] px-6 py-12 md:p-16 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
                        {/* Background pattern */}
                        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                            <div className="max-w-xl text-center md:text-left mx-auto md:mx-0">
                                <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
                                    Ready? Let's Start with BillForge and Grow Your Business
                                </h2>
                                <p className="text-indigo-100 text-base md:text-lg mb-8 leading-relaxed">
                                    Elevate your business operations with powerful invoicing, precise khata bookkeeping, and seamless customer management. Designed for modern Indian businesses.
                                </p>
                                <Link href="/register">
                                    <button className="bg-white text-indigo-600 px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 whitespace-nowrap mx-auto md:mx-0">
                                        Get Into The Business
                                        <ArrowRight size={18} />
                                    </button>
                                </Link>
                            </div>

                            <div className="hidden md:flex justify-end relative">
                                {/* Embedded Phone Mockup in CTA */}
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    whileInView={{ y: 0, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                    className="w-72 bg-slate-900 p-2.5 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] transform rotate-[-6deg] border border-white/10"
                                >
                                    <div className="w-full h-[450px] rounded-[2.5rem] overflow-hidden relative bg-[#0f172a] flex flex-col">
                                        <div className="p-6 pb-4">
                                            <div className="flex justify-between items-center mb-6">
                                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                                                    <Users size={16} />
                                                </div>
                                                <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] text-white/60">
                                                    Live Preview
                                                </div>
                                            </div>
                                            <h4 className="text-white font-bold text-lg mb-1">Total Khata</h4>
                                            <p className="text-indigo-400 font-mono text-2xl font-bold italic mb-6">₹4,82,900.00</p>

                                            <div className="space-y-3">
                                                {[
                                                    { name: "Rahul S.", amount: "₹1,200", status: "Paid", color: "bg-emerald-500/20 text-emerald-400" },
                                                    { name: "Manoj Kumar", amount: "₹850", status: "Due", color: "bg-amber-500/20 text-amber-400" },
                                                    { name: "Suresh P.", amount: "₹2,500", status: "Paid", color: "bg-emerald-500/20 text-emerald-400" },
                                                    { name: "Anita Devi", amount: "₹400", status: "Overdue", color: "bg-rose-500/20 text-rose-400" }
                                                ].map((c, idx) => (
                                                    <div key={idx} className="bg-white/5 rounded-xl p-3 flex justify-between items-center border border-white/5">
                                                        <div>
                                                            <p className="text-white text-xs font-medium">{c.name}</p>
                                                            <p className="text-white/40 text-[10px]">Customer ID: 102{idx}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-white text-xs font-bold">{c.amount}</p>
                                                            <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${c.color}`}>{c.status}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mt-auto bg-gradient-to-t from-indigo-600 to-transparent p-6 pt-12">
                                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-white">
                                                <p className="font-bold text-xs mb-1">New Update Available</p>
                                                <p className="text-[10px] opacity-70">Smarter reports & AI Insights</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Testimonials ── */}
            <section className="py-24 bg-white border-t border-slate-100 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4"
                        >
                            Trusted by <span className="text-indigo-600">Local Vendors</span> Across India
                        </motion.h2>
                        <p className="text-slate-500 font-medium max-w-2xl mx-auto">
                            Join thousands of business owners who are modernizing their daily operations with BillForge.
                        </p>
                    </div>

                    <div className="relative">
                        <TestimonialSlider />
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="bg-slate-900 pt-16 pb-10 text-slate-400 border-t-4 border-indigo-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                        <div className="col-span-1 md:col-span-2 lg:col-span-1">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                                    B
                                </div>
                                <span className="font-bold text-xl tracking-tight text-white">BillForge</span>
                            </div>
                            <p className="text-slate-400 mb-4 text-sm leading-relaxed">
                                A clean, straightforward application for managing your invoices, cataloging products, and keeping track of your customers' khata.
                            </p>
                            <div className="text-xs text-slate-500 py-3 border-t border-slate-800">
                                <span className="text-indigo-400">Zenith Open Source Project</span> by @roshhellwett
                            </div>
                        </div>

                        {/* Sitemap / Links Sections */}
                        <div>
                            <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                                <Layout size={16} /> Product Features
                            </h4>
                            <ul className="space-y-3 text-sm text-slate-400">
                                <li><Link href="/dashboard/invoices" className="hover:text-indigo-400 transition-colors flex items-center gap-2">- Invoices Management</Link></li>
                                <li><Link href="/dashboard/khata" className="hover:text-indigo-400 transition-colors flex items-center gap-2">- Khata (Ledger)</Link></li>
                                <li><Link href="/dashboard/products" className="hover:text-indigo-400 transition-colors flex items-center gap-2">- Products Catalog</Link></li>
                                <li><Link href="/dashboard/customers" className="hover:text-indigo-400 transition-colors flex items-center gap-2">- Customers List</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                                <Zap size={16} /> Navigation Menu (Sitemap)
                            </h4>
                            <ul className="space-y-3 text-sm text-slate-400">
                                <li><Link href="/" className="hover:text-indigo-400 transition-colors flex items-center gap-2">- Home (Landing Page)</Link></li>
                                <li><Link href="/dashboard" className="hover:text-indigo-400 transition-colors flex items-center gap-2">- Dashboard Main</Link></li>
                                <li><Link href="/login" className="hover:text-indigo-400 transition-colors flex items-center gap-2">- Login Page</Link></li>
                                <li><Link href="/register" className="hover:text-indigo-400 transition-colors flex items-center gap-2">- Sign Up / Register</Link></li>
                                <li><Link href="/dashboard/settings" className="hover:text-indigo-400 transition-colors flex items-center gap-2">- Account Settings</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6">Stay Updated</h4>
                            <p className="text-sm mb-4">Subscribe to our newsletter for the latest updates.</p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 w-full text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition-colors"
                                />
                                <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
                                    Subscribe
                                </button>
                            </div>
                        </div>

                    </div>

                    <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
                        <div className="text-center md:text-left">
                            <p>© {new Date().getFullYear()} BillForge Inc. All rights reserved.</p>
                            <p className="text-slate-500 mt-2 italic">
                                If you are unhappy with our services so please leave a message on this mail <a href="mailto:zenithopensource@icloud.com" className="text-indigo-400 hover:underline">zenithopensource@icloud.com</a> regarding issues you faced
                            </p>
                        </div>
                        <div className="flex gap-4 sm:gap-6 mt-4 md:mt-0">
                            <Link href="https://github.com/roshhellwett" target="_blank" className="hover:text-white transition-colors cursor-pointer border-b border-transparent hover:border-white">GitHub</Link>
                            <span className="hover:text-white transition-colors cursor-pointer border-b border-transparent hover:border-white">Open Source License</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
