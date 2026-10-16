"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ChevronRight,
  Layout,
  ArrowRight,
  Menu,
  X,
  Receipt,
  BookOpen,
  TrendingUp,
  Check,
  Globe,
  Users,
} from "lucide-react";

/* Interactive feature preview. It explains the available workflows without inventing account data. */
const HeroWorkflowPreview = () => {
  const t = useTranslations("Landing");
  const [activeTab, setActiveTab] = useState<"invoice" | "khata" | "reports">("invoice");

  const previews = {
    invoice: {
      icon: Receipt,
      title: t("previewInvoiceTitle"),
      body: t("previewInvoiceBody"),
      points: [t("previewInvoicePointOne"), t("previewInvoicePointTwo"), t("previewInvoicePointThree")],
    },
    khata: {
      icon: BookOpen,
      title: t("previewKhataTitle"),
      body: t("previewKhataBody"),
      points: [t("previewKhataPointOne"), t("previewKhataPointTwo"), t("previewKhataPointThree")],
    },
    reports: {
      icon: TrendingUp,
      title: t("previewReportsTitle"),
      body: t("previewReportsBody"),
      points: [t("previewReportsPointOne"), t("previewReportsPointTwo"), t("previewReportsPointThree")],
    },
  } as const;

  const preview = previews[activeTab];
  const PreviewIcon = preview.icon;

  return (
    <div className="w-full max-w-xl mx-auto rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl overflow-hidden relative">
      <div className="p-4 bg-[var(--surface-elevated)] border-b border-[var(--border)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0">
            <Layout size={16} aria-hidden="true" />
          </div>
          <span className="text-xs font-semibold text-[var(--foreground)]/70 truncate">BillForge</span>
        </div>
        <span className="badge badge-success text-[10px] shrink-0">{t("previewLabel")}</span>
      </div>

      <div className="grid grid-cols-3 border-b border-[var(--border)] bg-[var(--surface-elevated)]/50 p-1.5 gap-1" role="tablist" aria-label={t("previewLabel")}>
        {([
          ["invoice", t("previewInvoiceTab"), Receipt],
          ["khata", t("previewKhataTab"), BookOpen],
          ["reports", t("previewReportsTab"), TrendingUp],
        ] as const).map(([tab, label, Icon]) => (
          <button
            key={tab}
           type="button"
           role="tab"
           id={`preview-tab-${tab}`}
           aria-selected={activeTab === tab}
           aria-controls="preview-panel"
           tabIndex={activeTab === tab ? 0 : -1}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-2 sm:px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/50 ${
              activeTab === tab
                ? "bg-[var(--surface)] text-[var(--color-primary)] shadow-sm"
                : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
            }`}
          >
            <Icon size={14} aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      <div className="p-5 sm:p-7 min-h-[300px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            role="tabpanel"
            id="preview-panel"
            aria-labelledby={`preview-tab-${activeTab}`}
            className="flex-1 flex flex-col justify-between gap-7"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mb-5">
                <PreviewIcon size={24} aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">{preview.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--foreground)]/65 max-w-md">{preview.body}</p>
            </div>

            <ul className="space-y-3" aria-label={preview.title}>
              {preview.points.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-[var(--foreground)]/75">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-[var(--color-success)]/10 text-[var(--color-success)] flex items-center justify-center shrink-0">
                    <Check size={13} aria-hidden="true" />
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>

        <p className="mt-7 pt-4 border-t border-[var(--border)] text-[11px] leading-relaxed text-[var(--foreground)]/50">
          {t("previewNote")}
        </p>
      </div>
    </div>
  );
};

export default function LandingPage() {
  const t = useTranslations("Landing");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
               <a href="#features" className="text-sm font-semibold text-[var(--foreground)]/70 hover:text-[var(--color-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/50 rounded">
                {t("navFeatures")}
              </a>
               <a href="#preview" className="text-sm font-semibold text-[var(--foreground)]/70 hover:text-[var(--color-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/50 rounded">
                {t("navPreview")}
              </a>
               <a href="#workflow" className="text-sm font-semibold text-[var(--foreground)]/70 hover:text-[var(--color-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/50 rounded">
                {t("navWorkflow")}
              </a>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <LanguageSwitcher />
              <Link
                href="/login"
                className="text-[var(--foreground)]/80 hover:text-[var(--color-primary)] font-semibold text-sm px-4 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/50 rounded"
              >
                {t("navLogin")}
              </Link>
              <Link
                href="/register"
                className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md hover:brightness-110 font-semibold text-sm px-6 py-2.5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-1.5"
              >
                 {t("navRegister")} <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            {/* Mobile Menu Trigger */}
            <div className="md:hidden flex items-center gap-3">
              <LanguageSwitcher compact />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/50"
                 aria-label={isMobileMenuOpen ? t("closeMenu") : t("openMenu")}
                aria-expanded={isMobileMenuOpen}
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
                     className="px-3.5 py-3 text-base font-semibold text-[var(--foreground)] hover:text-[var(--color-primary)] hover:bg-[var(--surface-hover)] rounded-xl transition-all flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/50"
                  >
                    <span>{t("navFeatures")}</span>
                    <ChevronRight size={18} className="text-[var(--foreground)]/40" />
                  </a>
                  <a
                     href="#preview"
                    onClick={() => setIsMobileMenuOpen(false)}
                     className="px-3.5 py-3 text-base font-semibold text-[var(--foreground)] hover:text-[var(--color-primary)] hover:bg-[var(--surface-hover)] rounded-xl transition-all flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/50"
                  >
                    <span>{t("navPreview")}</span>
                    <ChevronRight size={18} className="text-[var(--foreground)]/40" />
                  </a>
                  <a
                    href="#workflow"
                    onClick={() => setIsMobileMenuOpen(false)}
                     className="px-3.5 py-3 text-base font-semibold text-[var(--foreground)] hover:text-[var(--color-primary)] hover:bg-[var(--surface-hover)] rounded-xl transition-all flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/50"
                  >
                    <span>{t("navWorkflow")}</span>
                    <ChevronRight size={18} className="text-[var(--foreground)]/40" />
                  </a>
                </div>

                <div className="pt-4 border-t border-[var(--border)] flex flex-col gap-3">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-center text-[var(--foreground)] hover:bg-[var(--surface-hover)] font-semibold py-3 rounded-xl border border-[var(--border)] transition-all"
                  >
                    {t("navLogin")}
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
                <Receipt size={13} className="text-[var(--color-primary)]" aria-hidden="true" />
                <span className="text-xs font-bold text-[var(--foreground)]">
                  {t("heroBadge")}
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
                <Link
                  href="/register"
                  className="w-full sm:w-auto bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md hover:brightness-110 px-8 py-4 rounded-2xl font-bold text-base shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/60"
                >
                    {t("ctaButton")}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <a
                   href="#preview"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] font-semibold text-sm text-[var(--foreground)] transition-all flex items-center justify-center gap-2 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/50"
                >
                  <Layout size={16} className="text-[var(--color-primary)]" aria-hidden="true" />
                  {t("heroPreviewCta")}
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 pt-6 border-t border-[var(--border)]/60 text-xs text-[var(--foreground)]/60">
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 size={15} className="text-[var(--color-success)]" aria-hidden="true" /> {t("heroCheckInvoices")}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 size={15} className="text-[var(--color-success)]" aria-hidden="true" /> {t("heroCheckKhata")}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 size={15} className="text-[var(--color-success)]" aria-hidden="true" /> {t("heroCheckOpenSource")}
                </span>
              </div>
            </motion.div>

             {/* Workflow preview */}
            <motion.div
              id="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 flex items-center justify-center"
            >
               <HeroWorkflowPreview />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section id="features" className="py-24 relative z-10 border-t border-[var(--border)]/60 bg-[var(--surface-elevated)]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="badge badge-success mb-3">{t("featuresEyebrow")}</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--foreground)] tracking-tight mb-4">
              {t("featuresTitle")}
            </h2>
            <p className="text-base text-[var(--foreground)]/70 text-balance">
              {t("featuresSubtitle")}
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Bento Card 1: Invoices (Spans 2 cols on lg) */}
            <div className="md:col-span-2 glass-card p-8 flex flex-col justify-between card-hover-lift group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[var(--surface-elevated)] text-[var(--foreground)] flex items-center justify-center mb-6 border border-[var(--border)] shadow-sm">
                   <Receipt size={24} aria-hidden="true" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
                  {t("invoiceFeatureEyebrow")}
                </span>
                <h3 className="text-2xl font-extrabold text-[var(--foreground)] mt-2 mb-3">
                  {t("invoiceFeatureTitle")}
                </h3>
                <p className="text-sm text-[var(--foreground)]/70 leading-relaxed mb-6">
                  {t("invoiceFeatureBody")}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-success)]/10 text-[var(--color-success)] flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                     <p className="font-bold text-[var(--foreground)]">{t("invoiceFeatureStatus")}</p>
                     <p className="text-[10px] text-[var(--foreground)]/50">{t("invoiceFeatureStatusBody")}</p>
                   </div>
                 </div>
                 <span className="font-mono font-bold text-[var(--color-primary)]">{t("invoiceFeatureStatus")}</span>
               </div>
            </div>

            {/* Bento Card 2: Digital Khata */}
            <div className="glass-card p-8 flex flex-col justify-between card-hover-lift group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[var(--surface-elevated)] text-[var(--foreground)] flex items-center justify-center mb-6 border border-[var(--border)] shadow-sm">
                   <BookOpen size={24} aria-hidden="true" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                  {t("khataFeatureEyebrow")}
                </span>
                <h3 className="text-xl font-extrabold text-[var(--foreground)] mt-2 mb-3">
                  {t("khataFeatureTitle")}
                </h3>
                <p className="text-sm text-[var(--foreground)]/70 leading-relaxed">
                  {t("khataFeatureBody")}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs font-semibold text-[var(--foreground)]/80">
                <span>{t("khataFeatureStatus")}</span>
                <span className="badge badge-success">{t("khataFeatureStatusValue")}</span>
              </div>
            </div>

            {/* Bento Card 3: Business records */}
            <div className="glass-card p-8 flex flex-col justify-between card-hover-lift group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[var(--surface-elevated)] text-[var(--foreground)] flex items-center justify-center mb-6 border border-[var(--border)] shadow-sm">
                   <Users size={24} aria-hidden="true" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                  {t("recordsFeatureEyebrow")}
                </span>
                <h3 className="text-xl font-extrabold text-[var(--foreground)] mt-2 mb-3">
                  {t("recordsFeatureTitle")}
                </h3>
                <p className="text-sm text-[var(--foreground)]/70 leading-relaxed">
                  {t("recordsFeatureBody")}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs font-semibold text-[var(--foreground)]/80">
                <span>{t("recordsFeatureStatus")}</span>
                <span className="badge badge-success">{t("recordsFeatureStatusValue")}</span>
              </div>
            </div>

            {/* Bento Card 4: Multi-language and themes (Spans 2 cols on lg) */}
            <div className="md:col-span-2 lg:col-span-2 glass-card p-8 flex flex-col justify-between card-hover-lift group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-6 border border-pink-500/20 shadow-sm">
                   <Globe size={24} aria-hidden="true" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-pink-500">
                  {t("languageFeatureEyebrow")}
                </span>
                <h3 className="text-2xl font-extrabold text-[var(--foreground)] mt-2 mb-3">
                  {t("languageFeatureTitle")}
                </h3>
                <p className="text-sm text-[var(--foreground)]/70 leading-relaxed mb-6">
                  {t("languageFeatureBody")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--foreground)]">{t("languageFeatureStatus")}</span>
                  <span className="text-xs font-mono font-semibold text-[var(--color-primary)]">{t("languageFeatureStatusValue")}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--foreground)]">{t("languageFeatureTheme")}</span>
                  <span className="text-xs font-mono font-semibold text-[var(--foreground)]">{t("languageFeatureThemeValue")}</span>
                </div>
              </div>
            </div>

            {/* Bento Card 5: Reports (Spans 2 cols on lg) */}
            <div className="md:col-span-3 lg:col-span-2 glass-card p-8 flex flex-col justify-between card-hover-lift group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center mb-6 border border-zinc-800 dark:border-zinc-200 shadow-sm">
                   <TrendingUp size={24} aria-hidden="true" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/70">
                  {t("reportsFeatureEyebrow")}
                </span>
                <h3 className="text-2xl font-extrabold text-[var(--foreground)] mt-2 mb-3">
                  {t("reportsFeatureTitle")}
                </h3>
                <p className="text-sm text-[var(--foreground)]/70 leading-relaxed">
                  {t("reportsFeatureBody")}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs font-semibold text-[var(--foreground)]/80">
                 <span>{t("reportsFeatureStatus")}</span>
                 <span className="badge badge-success">{t("reportsFeatureStatusValue")}</span>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow section */}
      <section id="workflow" className="py-24 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="badge badge-success mb-3">{t("workflowEyebrow")}</span>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--foreground)] tracking-tight">
              {t("workflowTitle")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Receipt, title: t("workflowInvoiceTitle"), body: t("workflowInvoiceBody") },
              { icon: BookOpen, title: t("workflowKhataTitle"), body: t("workflowKhataBody") },
              { icon: TrendingUp, title: t("workflowReportsTitle"), body: t("workflowReportsBody") },
            ].map(({ icon: Icon, title, body }, index) => (
              <article key={title} className="glass-card p-7 border border-[var(--border)]">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-[var(--surface-elevated)] text-[var(--color-primary)] flex items-center justify-center border border-[var(--border)]">
                    <Icon size={21} aria-hidden="true" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]/45">0{index + 1}</span>
                </div>
                <h3 className="text-xl font-extrabold text-[var(--foreground)] mb-3">{title}</h3>
                <p className="text-sm leading-relaxed text-[var(--foreground)]/70">{body}</p>
              </article>
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
              {t("footerCtaTitle")}
            </h2>
            <p className="text-base sm:text-lg text-zinc-300 dark:text-zinc-600 max-w-2xl mx-auto mb-8 relative z-10 text-balance">
              {t("footerCtaBody")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
               <Link href="/register" className="inline-flex w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 rounded-2xl">
                <span className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-[var(--color-primary)] font-extrabold text-base shadow-xl hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80">
                  {t("footerCtaRegister")} <ArrowRight size={18} aria-hidden="true" />
                </span>
              </Link>
               <Link href="/login" className="inline-flex w-full sm:w-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 rounded-2xl">
                <span className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-black/20 hover:bg-black/30 border border-white/20 text-white font-bold text-base transition-all active:scale-95 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80">
                  {t("footerCtaLogin")}
                </span>
              </Link>
            </div>
          </div>

            <div className="mt-12 pt-8 border-t border-[var(--border)]/60 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--foreground)]/60 gap-4">
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-[var(--foreground)]">BillForge</span>
                <span>· {t("footerProject")}</span>
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
              </a>
              </p>
          </div>
        </div>
      </section>
    </div>
  );
}
