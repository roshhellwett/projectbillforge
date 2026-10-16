import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import {
  ArrowUpRight,
  BookOpen,
  Building2,
  CircleHelp,
  FileCheck2,
  IndianRupee,
  LockKeyhole,
  Mail,
  ReceiptText,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

type HelpArticle = {
  id: string;
  title: string;
  body: string;
  points: string[];
  icon: LucideIcon;
};

export default async function HelpPage() {
  const t = await getTranslations("Help");

  const articles: HelpArticle[] = [
    {
      id: "getting-started",
      title: t("gettingStartedTitle"),
      body: t("gettingStartedBody"),
      points: [t("gettingStartedOne"), t("gettingStartedTwo"), t("gettingStartedThree")],
      icon: Building2,
    },
    {
      id: "invoices",
      title: t("invoicesTitle"),
      body: t("invoicesBody"),
      points: [t("invoicesOne"), t("invoicesTwo"), t("invoicesThree")],
      icon: ReceiptText,
    },
    {
      id: "khata",
      title: t("khataTitle"),
      body: t("khataBody"),
      points: [t("khataOne"), t("khataTwo"), t("khataThree")],
      icon: IndianRupee,
    },
    {
      id: "gst",
      title: t("gstTitle"),
      body: t("gstBody"),
      points: [t("gstOne"), t("gstTwo"), t("gstThree")],
      icon: FileCheck2,
    },
    {
      id: "copilot",
      title: t("copilotTitle"),
      body: t("copilotBody"),
      points: [t("copilotOne"), t("copilotTwo"), t("copilotThree")],
      icon: ShieldCheck,
    },
    {
      id: "privacy",
      title: t("privacyTitle"),
      body: t("privacyBody"),
      points: [t("privacyOne"), t("privacyTwo"), t("privacyThree")],
      icon: LockKeyhole,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-2 sm:space-y-8">
      <header className="relative overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-elevation)] sm:p-8">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[var(--info-border)]/35 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--info-border)] bg-[var(--info-surface)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--info-foreground)]">
            <CircleHelp size={13} aria-hidden="true" /> {t("eyebrow")}
          </div>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)] sm:text-4xl">{t("title")}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted-foreground)] sm:text-base">{t("subtitle")}</p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2" aria-label={t("eyebrow")}>
        {articles.map(({ id, title, body, points, icon: Icon }) => (
          <details key={id} open={id === "getting-started"} className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] open:shadow-[var(--shadow-elevation)]">
            <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 px-4 py-4 sm:px-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)] [&::-webkit-details-marker]:hidden">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-elevated)] text-[var(--color-primary)]">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 text-sm font-semibold text-[var(--foreground)] sm:text-base">{title}</span>
              <ArrowUpRight size={16} className="shrink-0 text-[var(--muted-foreground)] transition-transform group-open:rotate-90" aria-hidden="true" />
            </summary>
            <div className="border-t border-[var(--border)] px-4 pb-5 pt-4 sm:px-5">
              <p className="text-sm leading-6 text-[var(--muted-foreground)]">{body}</p>
              <ul className="mt-4 space-y-3">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm leading-6 text-[var(--foreground)]/75">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)]" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </details>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--color-primary)]"><Mail size={18} aria-hidden="true" /></span>
          <div>
            <h2 className="font-semibold text-[var(--foreground)]">{t("supportTitle")}</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">{t("supportDescription")}</p>
          </div>
        </div>
        <a href="mailto:zenithprojects@icloud.com" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--surface-hover)]">
          <Mail size={15} aria-hidden="true" /> {t("contactSupport")}
        </a>
      </section>

      <nav aria-label={t("eyebrow")} className="flex flex-wrap gap-3">
        <Link href="/dashboard/invoices" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-contrast)] hover:brightness-110">{t("openInvoices")} <ArrowUpRight size={15} aria-hidden="true" /></Link>
        <Link href="/dashboard/khata" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--surface-hover)]">{t("openKhata")} <BookOpen size={15} aria-hidden="true" /></Link>
        <Link href="/dashboard/assistant" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--surface-hover)]">{t("openCopilot")} <ArrowUpRight size={15} aria-hidden="true" /></Link>
      </nav>
    </div>
  );
}
