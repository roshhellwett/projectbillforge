"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ChevronRight,
  Layout,
  Users,
  Star,
  ArrowRight,
  Menu,
  X,
  ShieldCheck,
  Zap,
  Clock,
  MessageSquare,
  Sparkles,
  Receipt,
  BookOpen,
  TrendingUp,
  Plus,
  Check,
  ArrowUpRight,
  Globe,
  Share2,
  Lock,
} from "lucide-react";

/* Testimonial Data */
const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Kirana Store Owner, Delhi",
    text: "BillForge has made handling daily credit (Udhaar) so much easier. I can now track every rupee with just a few taps on my phone.",
    initials: "RK",
    color: "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-800 dark:border-zinc-200",
  },
  {
    name: "Priya Sharma",
    role: "Hardware Merchant, Jaipur",
    text: "Invoicing used to be a headache every month. Now, I generate professional GST-ready invoices in seconds. My customers love the speed!",
    initials: "PS",
    color: "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700",
  },
  {
    name: "Arun Varma",
    role: "Boutique Owner, Mumbai",
    text: "The Khata management feature is a lifesaver. No more physical registers or lost records. It's clean, simple, and very effective.",
    initials: "AV",
    color: "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700",
  },
  {
    name: "Sunita Devi",
    role: "Grain Wholesaler, Punjab",
    text: "Managing hundreds of transactions was impossible before BillForge. Now my business is organized and I have peace of mind.",
    initials: "SD",
    color: "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-800 dark:border-zinc-200",
  },
  {
    name: "Vikram Singh",
    role: "Electronics Retailer, Bangalore",
    text: "The best part is how easy it is to use. No technical knowledge needed—it just works. Truly made for Indian small businesses.",
    initials: "VS",
    color: "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700",
  },
];

/* Interactive Mini-Demo Component */
const HeroInteractiveDemo = () => {
  const [activeTab, setActiveTab] = useState<"invoice" | "khata" | "insights">("invoice");
  
  // Invoice state
  const [items, setItems] = useState([
    { name: "Ultra-Fast SSD 1TB", qty: 2, price: 5400 },
    { name: "Wireless Mechanical Keyboard", qty: 1, price: 3200 },
  ]);
  const [itemAddedNotice, setItemAddedNotice] = useState(false);

  // Khata state
  const [khataBalance, setKhataBalance] = useState(14500);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const addItem = () => {
    setItems((prev) => [...prev, { name: "USB-C Pro Adapter 65W", qty: 1, price: 1800 }]);
    setItemAddedNotice(true);
    setTimeout(() => setItemAddedNotice(false), 2000);
  };

  const recordPayment = () => {
    setKhataBalance((prev) => Math.max(0, prev - 2500));
    setPaymentSuccess(true);
    setTimeout(() => setPaymentSuccess(false), 2500);
  };

  const subtotal = items.reduce((acc, curr) => acc + curr.qty * curr.price, 0);
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  return (
    <div className="w-full max-w-xl mx-auto rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl overflow-hidden relative">
      {/* Demo Header Bar */}
      <div className="p-4 bg-[var(--surface-elevated)] border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-zinc-400 dark:bg-zinc-600" />
            <span className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span className="w-3 h-3 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <span className="text-xs font-mono font-semibold text-[var(--foreground)]/70 ml-2">
            BillForge Interactive Engine
          </span>
        </div>
        <span className="badge badge-success text-[10px] animate-pulse">Live Preview</span>
      </div>

      {/* Tab Controls */}
      <div className="grid grid-cols-3 border-b border-[var(--border)] bg-[var(--surface-elevated)]/50 p-1.5 gap-1">
        <button
          onClick={() => setActiveTab("invoice")}
          className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "invoice"
              ? "bg-[var(--surface)] text-[var(--color-primary)] shadow-sm"
              : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
          }`}
        >
          <Receipt size={14} /> GST Invoice
        </button>
        <button
          onClick={() => setActiveTab("khata")}
          className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "khata"
              ? "bg-[var(--surface)] text-[var(--color-primary)] shadow-sm"
              : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
          }`}
        >
          <BookOpen size={14} /> Digital Khata
        </button>
        <button
          onClick={() => setActiveTab("insights")}
          className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "insights"
              ? "bg-[var(--surface)] text-[var(--color-primary)] shadow-sm"
              : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
          }`}
        >
          <TrendingUp size={14} /> Analytics
        </button>
      </div>

      {/* Tab Body */}
      <div className="p-5 sm:p-6 min-h-[310px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {activeTab === "invoice" && (
            <motion.div
              key="invoice"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 flex-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-sm text-[var(--foreground)]">New GST Bill #INV-1092</h4>
                    <p className="text-[11px] text-[var(--foreground)]/60">Client: Sharma Electronics</p>
                  </div>
                  <button
                    onClick={addItem}
                    disabled={items.length >= 4}
                    className="px-3 py-1.5 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white text-xs font-semibold transition-all flex items-center gap-1 active:scale-95"
                  >
                    <Plus size={13} /> Add Item
                  </button>
                </div>

                {itemAddedNotice && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-2 mb-2 rounded-lg bg-[var(--color-success)]/10 text-[var(--color-success)] text-[11px] font-semibold flex items-center gap-1.5"
                  >
                    <Check size={13} /> USB-C Pro Adapter added right into invoice!
                  </motion.div>
                )}

                <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] flex justify-between items-center text-xs"
                    >
                      <span className="font-medium text-[var(--foreground)] truncate max-w-[180px]">
                        {item.name} <span className="text-[10px] text-[var(--foreground)]/50">(x{item.qty})</span>
                      </span>
                      <span className="font-mono font-semibold text-[var(--foreground)]">
                        ₹{(item.qty * item.price).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                <div className="text-xs space-y-0.5">
                  <p className="text-[var(--foreground)]/60">Subtotal: ₹{subtotal.toLocaleString("en-IN")}</p>
                  <p className="text-[var(--foreground)]/60">GST (18%): ₹{gst.toLocaleString("en-IN")}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[var(--foreground)]/50 block">Net Total</span>
                  <span className="text-lg font-extrabold font-mono text-[var(--color-primary)]">
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "khata" && (
            <motion.div
              key="khata"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 flex-1 flex flex-col justify-between"
            >
              <div>
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/15 to-[var(--color-secondary)]/10 border border-[var(--color-primary)]/20 mb-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)]">
                      Total Outstanding Udhaar
                    </span>
                    <p className="text-2xl font-extrabold font-mono text-[var(--foreground)] mt-0.5">
                      ₹{khataBalance.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <button
                    onClick={recordPayment}
                    disabled={khataBalance <= 0}
                    className="px-3.5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold shadow-md hover:opacity-90 transition-all flex items-center gap-1 active:scale-95"
                  >
                    <Check size={14} /> Record ₹2,500 Payment
                  </button>
                </div>

                {paymentSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-2.5 mb-3 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs font-bold flex items-center gap-2 border border-zinc-300 dark:border-zinc-700"
                  >
                    <CheckCircle2 size={16} /> ₹2,500 credited! Ledger synced to cloud.
                  </motion.div>
                )}

                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center font-bold">
                        VK
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--foreground)]">Verma Kirana Stores</p>
                        <p className="text-[10px] text-[var(--foreground)]/50">Last active: Today, 2:15 PM</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-[var(--color-danger)]">
                      +₹{khataBalance.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[var(--surface-elevated)] text-[11px] text-[var(--foreground)]/70 flex items-center justify-between">
                <span>Auto WhatsApp reminders active</span>
                <span className="text-[var(--color-primary)] font-semibold flex items-center gap-1 cursor-pointer">
                  Send Reminder Now <ArrowUpRight size={13} />
                </span>
              </div>
            </motion.div>
          )}

          {activeTab === "insights" && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 flex-1 flex flex-col justify-between"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)]">
                  <span className="text-[10px] font-bold text-[var(--foreground)]/50 uppercase">This Month Sales</span>
                  <p className="text-lg font-extrabold font-mono text-[var(--foreground)] mt-1">₹3,42,800</p>
                  <span className="text-[10px] text-[var(--color-success)] font-semibold flex items-center gap-0.5 mt-1">
                    <TrendingUp size={12} /> +24.8% vs last month
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)]">
                  <span className="text-[10px] font-bold text-[var(--foreground)]/50 uppercase">Active Products</span>
                  <p className="text-lg font-extrabold font-mono text-[var(--foreground)] mt-1">148 SKUs</p>
                  <span className="text-[10px] text-[var(--color-warning)] font-semibold flex items-center gap-0.5 mt-1">
                    <Clock size={12} /> 3 Low Stock alerts
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-[var(--border)] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[var(--foreground)]">GST Return Readiness</span>
                  <span className="badge badge-success">100% Compliant</span>
                </div>
                <div className="w-full bg-[var(--surface-elevated)] h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-success)] h-full w-full rounded-full" />
                </div>
                <p className="text-[10px] text-[var(--foreground)]/60">
                  All 48 invoices verified with accurate HSN and tax codes. Ready for GSTR-1 export.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function LandingPage() {
  const t = useTranslations("Landing");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [testimIdx, setTestimIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTestimIdx((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-dvh bg-[var(--background)] text-[var(--foreground)] font-sans overflow-x-hidden selection:bg-[var(--color-primary)]/20 selection:text-[var(--color-primary)] relative">
      {/* Background Aurora Glow */}
      <div className="fixed inset-0 pointer-events-none aurora-mesh opacity-80 -z-10" />
      <div className="fixed inset-0 pointer-events-none bg-grid-pattern opacity-60 -z-10" />

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--surface)]/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-[var(--border)] transition-all duration-300 pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                B
              </div>
              <span className="font-extrabold text-xl tracking-tight text-[var(--foreground)]">
                BillForge
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-semibold text-[var(--foreground)]/70 hover:text-[var(--color-primary)] transition-colors">
                {t("navFeatures")}
              </a>
              <a href="#demo" className="text-sm font-semibold text-[var(--foreground)]/70 hover:text-[var(--color-primary)] transition-colors">
                Interactive Engine
              </a>
              <a href="#testimonials" className="text-sm font-semibold text-[var(--foreground)]/70 hover:text-[var(--color-primary)] transition-colors">
                Verified Reviews
              </a>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <LanguageSwitcher />
              <Link
                href="/login"
                className="text-[var(--foreground)]/80 hover:text-[var(--color-primary)] font-semibold text-sm px-4 py-2 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md hover:brightness-110 font-semibold text-sm px-6 py-2.5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-1.5"
              >
                {t("navRegister")} <ArrowRight size={16} />
              </Link>
            </div>

            {/* Mobile Menu Trigger */}
            <div className="md:hidden flex items-center gap-3">
              <LanguageSwitcher compact />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)] active:scale-95 transition-all"
                aria-label="Toggle Navigation"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden bg-[var(--surface)] border-b border-[var(--border)] overflow-hidden shadow-2xl"
            >
              <div className="px-5 py-6 space-y-4">
                <div className="flex flex-col space-y-1">
                  <a
                    href="#features"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3.5 py-3 text-base font-semibold text-[var(--foreground)] hover:text-[var(--color-primary)] hover:bg-[var(--surface-hover)] rounded-xl transition-all flex items-center justify-between"
                  >
                    <span>{t("navFeatures")}</span>
                    <ChevronRight size={18} className="text-[var(--foreground)]/40" />
                  </a>
                  <a
                    href="#demo"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3.5 py-3 text-base font-semibold text-[var(--foreground)] hover:text-[var(--color-primary)] hover:bg-[var(--surface-hover)] rounded-xl transition-all flex items-center justify-between"
                  >
                    <span>Interactive Engine</span>
                    <ChevronRight size={18} className="text-[var(--foreground)]/40" />
                  </a>
                  <a
                    href="#testimonials"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3.5 py-3 text-base font-semibold text-[var(--foreground)] hover:text-[var(--color-primary)] hover:bg-[var(--surface-hover)] rounded-xl transition-all flex items-center justify-between"
                  >
                    <span>Verified Reviews</span>
                    <ChevronRight size={18} className="text-[var(--foreground)]/40" />
                  </a>
                </div>

                <div className="pt-4 border-t border-[var(--border)] flex flex-col gap-3">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center text-[var(--foreground)] hover:bg-[var(--surface-hover)] font-semibold py-3 rounded-xl border border-[var(--border)] transition-all"
                  >
                    Login to Workspace
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-500/25 transition-all"
                  >
                    {t("navRegister")}
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Hero Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-sm mb-6 mx-auto lg:mx-0">
                <div className="flex items-center gap-1 text-zinc-900 dark:text-zinc-100">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} fill="currentColor" />
                  ))}
                </div>
                <span className="text-xs font-bold text-[var(--foreground)] border-l border-[var(--border)] pl-2.5 ml-1">
                  Trustpilot 4.8/5 Verified
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[var(--foreground)] leading-[1.1] mb-6">
                {t("heroTitle1")} <br />
                <span className="gradient-text">{t("heroTitle2")}</span>
              </h1>

              <p className="text-base sm:text-lg text-[var(--foreground)]/70 mb-8 max-w-xl leading-relaxed mx-auto lg:mx-0 text-balance">
                {t("heroSubtitle")}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/register" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md hover:brightness-110 px-8 py-4 rounded-2xl font-bold text-base shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 group">
                    {t("ctaButton")}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
                <a
                  href="#demo"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] font-semibold text-sm text-[var(--foreground)] transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Sparkles size={16} className="text-[var(--color-primary)]" />
                  Explore Live Demo
                </a>
              </div>

              <div className="mt-8 flex items-center justify-center lg:justify-start gap-6 pt-6 border-t border-[var(--border)]/60 text-xs text-[var(--foreground)]/60">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 size={15} className="text-[var(--color-success)]" /> 100% GST Ready
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 size={15} className="text-[var(--color-success)]" /> Instant Khata Sync
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 size={15} className="text-[var(--color-success)]" /> Open Source Free
                </span>
              </div>
            </motion.div>

            {/* Hero Interactive Demo */}
            <motion.div
              id="demo"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 flex items-center justify-center"
            >
              <HeroInteractiveDemo />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section id="features" className="py-24 relative z-10 border-t border-[var(--border)]/60 bg-[var(--surface-elevated)]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="badge badge-success mb-3">Architected for Speed & Reliability</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--foreground)] tracking-tight mb-4">
              Everything Your Business Needs in One Sleek Interface
            </h2>
            <p className="text-base text-[var(--foreground)]/70 text-balance">
              BillForge replaces bloated desktop accounting packages with a modern cloud-native operating system tailored for vendors, distributors, and store owners.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Bento Card 1: Fast GST Invoicing (Spans 2 cols on lg) */}
            <div className="md:col-span-2 glass-card p-8 flex flex-col justify-between card-hover-lift group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[var(--surface-elevated)] text-[var(--foreground)] flex items-center justify-center mb-6 border border-[var(--border)] shadow-sm">
                  <Receipt size={24} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
                  Fast & GST Compliant
                </span>
                <h3 className="text-2xl font-extrabold text-[var(--foreground)] mt-2 mb-3">
                  Professional Invoices in Under 10 Seconds
                </h3>
                <p className="text-sm text-[var(--foreground)]/70 leading-relaxed mb-6">
                  Automate tax calculation (CGST/SGST/IGST), HSN codes, and generate crisp, downloadable PDF bills ready for WhatsApp sharing or thermal printing.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-success)]/10 text-[var(--color-success)] flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="font-bold text-[var(--foreground)]">Auto-calculated GST Total</p>
                    <p className="text-[10px] text-[var(--foreground)]/50">Zero manual computation errors</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-[var(--color-primary)]">100% Verified</span>
              </div>
            </div>

            {/* Bento Card 2: Digital Khata */}
            <div className="glass-card p-8 flex flex-col justify-between card-hover-lift group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[var(--surface-elevated)] text-[var(--foreground)] flex items-center justify-center mb-6 border border-[var(--border)] shadow-sm">
                  <BookOpen size={24} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                  Digital Khata Book
                </span>
                <h3 className="text-xl font-extrabold text-[var(--foreground)] mt-2 mb-3">
                  Never Lose Track of Udhaar
                </h3>
                <p className="text-sm text-[var(--foreground)]/70 leading-relaxed">
                  Track daily credit given to regular customers, record partial payments instantly, and maintain clean balance sheets without paper registers.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs font-semibold text-[var(--foreground)]/80">
                <span>WhatsApp Reminders</span>
                <span className="badge badge-success">Built-in</span>
              </div>
            </div>

            {/* Bento Card 3: Cloud Security */}
            <div className="glass-card p-8 flex flex-col justify-between card-hover-lift group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[var(--surface-elevated)] text-[var(--foreground)] flex items-center justify-center mb-6 border border-[var(--border)] shadow-sm">
                  <Lock size={24} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                  Bank-Grade Cloud
                </span>
                <h3 className="text-xl font-extrabold text-[var(--foreground)] mt-2 mb-3">
                  PostgreSQL + Redis Integrity
                </h3>
                <p className="text-sm text-[var(--foreground)]/70 leading-relaxed">
                  Powered by Supabase PostgreSQL and Upstash rate limiting. Your transaction logs are encrypted, backed up, and available 24/7 across all devices.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs font-semibold text-[var(--foreground)]/80">
                <span>Uptime SLA</span>
                <span className="badge badge-success">99.99%</span>
              </div>
            </div>

            {/* Bento Card 4: Multi-Language & Dark Mode (Spans 2 cols on lg) */}
            <div className="md:col-span-2 lg:col-span-2 glass-card p-8 flex flex-col justify-between card-hover-lift group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-6 border border-pink-500/20 shadow-sm">
                  <Globe size={24} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-pink-500">
                  Fully Localized
                </span>
                <h3 className="text-2xl font-extrabold text-[var(--foreground)] mt-2 mb-3">
                  English, Hindi & Native Dark/Light Themes
                </h3>
                <p className="text-sm text-[var(--foreground)]/70 leading-relaxed mb-6">
                  Switch between regional languages effortlessly using our Next-Intl engine, and toggle clean ceramic light or midnight obsidian dark modes on the fly.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--foreground)]">Language Support</span>
                  <span className="text-xs font-mono font-semibold text-[var(--color-primary)]">ENG / HIN</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--foreground)]">Adaptive Theme</span>
                  <span className="text-xs font-mono font-semibold text-[var(--foreground)]">Auto Sync</span>
                </div>
              </div>
            </div>

            {/* Bento Card 5: Real-Time Analytics (Spans 2 cols on lg) */}
            <div className="md:col-span-3 lg:col-span-2 glass-card p-8 flex flex-col justify-between card-hover-lift group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center mb-6 border border-zinc-800 dark:border-zinc-200 shadow-sm">
                  <TrendingUp size={24} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/70">
                  Live Insights
                </span>
                <h3 className="text-2xl font-extrabold text-[var(--foreground)] mt-2 mb-3">
                  Visual Business Health Dashboard
                </h3>
                <p className="text-sm text-[var(--foreground)]/70 leading-relaxed">
                  Track weekly sales trends, monitor top receivables, receive instant low-stock product alerts, and download business health snapshots instantly.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs font-semibold text-[var(--foreground)]/80">
                <span>Real-Time Drizzle ORM Sync</span>
                <span className="badge badge-success">Zero Lag</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Testimonial Carousel */}
      <section id="testimonials" className="py-24 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="badge badge-success mb-3">Loved Across India</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--foreground)] tracking-tight">
              Trusted by Merchants & Vendors
            </h2>
          </div>

          <div className="relative max-w-4xl mx-auto min-h-[320px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimIdx}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="w-full glass-card p-8 sm:p-12 border border-[var(--border)] shadow-2xl relative"
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
                  <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl ${testimonials[testimIdx].color} flex items-center justify-center font-black text-2xl sm:text-3xl shrink-0 shadow-lg border-2 border-white/20`}>
                    {testimonials[testimIdx].initials}
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-1 text-zinc-900 dark:text-zinc-100 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} fill="currentColor" />
                      ))}
                      <span className="text-xs font-bold text-[var(--foreground)]/70 ml-2">5.0 / 5.0</span>
                    </div>

                    <p className="text-lg sm:text-xl font-bold text-[var(--foreground)] mb-6 leading-relaxed italic">
                      "{testimonials[testimIdx].text}"
                    </p>

                    <div className="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-base text-[var(--foreground)]">{testimonials[testimIdx].name}</h4>
                        <p className="text-xs text-[var(--foreground)]/60">{testimonials[testimIdx].role}</p>
                      </div>
                      <span className="badge badge-success self-center sm:self-auto">Verified Vendor</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slider Indicators */}
          <div className="flex items-center justify-center gap-2.5 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setTestimIdx(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  testimIdx === i
                    ? "bg-[var(--color-primary)] w-8 shadow-sm"
                    : "bg-[var(--border)] hover:bg-[var(--foreground)]/30 w-2.5"
                }`}
                aria-label={`Go to review ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer / CTA Section */}
      <section className="py-20 relative z-10 border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-10 sm:p-14 rounded-3xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <h2 className="text-3xl sm:text-4xl font-black mb-4 relative z-10">
              Ready to Modernize Your Business?
            </h2>
            <p className="text-base sm:text-lg text-zinc-300 dark:text-zinc-600 max-w-2xl mx-auto mb-8 relative z-10 text-balance">
              Join thousands of local Indian businesses using BillForge for fast invoicing, khata bookkeeping, and customer management.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <Link href="/register" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-[var(--color-primary)] font-extrabold text-base shadow-xl hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2">
                  Get Started For Free <ArrowRight size={18} />
                </button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-black/20 hover:bg-black/30 border border-white/20 text-white font-bold text-base transition-all active:scale-95">
                  Sign In to Dashboard
                </button>
              </Link>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-[var(--border)]/60 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--foreground)]/60 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-[var(--foreground)]">BillForge</span>
              <span>· A Zenith Open Source Project</span>
            </div>
            <p>
              © 2026{" "}
              <a
                href="https://zenithopensourceprojects.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-primary)] hover:underline font-semibold"
              >
                Zenith Open Source Projects
              </a>{" "}
              by @roshhellwett. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
