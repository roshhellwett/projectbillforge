import type { Metadata, Viewport } from "next";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXTAUTH_URL ||
  "https://billforge.vercel.app"
).replace(/\/$/, "");

const LOCALE_META: Record<string, { title: string; description: string }> = {
  en: {
    title: "BillForge — GST Billing & Khata for Indian Businesses",
    description: "Fast, offline-friendly GST invoicing, Khata (udhaar) tracking, and inventory for Indian shops, wholesalers, and pharmacies. Made in India.",
  },
  hi: {
    title: "BillForge — भारतीय व्यवसायों के लिए GST बिलिंग और खाता",
    description: "भारतीय दुकानों, थोक विक्रेताओं और फार्मेसियों के लिए तेज़ GST बिलिंग, खाता (उधार) प्रबंधन और इन्वेंट्री। भारत में निर्मित।",
  },
  "hi-en": {
    title: "BillForge — Indian dukaan ke liye GST Billing aur Khata",
    description: "Indian dukaan, wholesaler aur pharmacy ke liye fast GST invoicing, Khata (udhaar) tracking, aur inventory. Made in India.",
  },
};

function pickMeta(locale: string) {
  return LOCALE_META[locale] ?? LOCALE_META.en;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = pickMeta(locale);

  const languages: Record<string, string> = {};
  for (const alt of routing.locales) languages[alt] = `/${alt}`;
  languages["x-default"] = `/${routing.defaultLocale}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: meta.title,
      template: "%s · BillForge",
    },
    description: meta.description,
    applicationName: "BillForge",
    keywords: [
      "GST billing India", "invoice software", "khata app", "udhaar book",
      "bahi khata", "small business billing", "kirana billing",
      "pharmacy billing", "wholesale invoice", "Indian invoice generator",
    ],
    authors: [{ name: "BillForge" }],
    creator: "BillForge",
    publisher: "BillForge",
    formatDetection: { email: false, address: false, telephone: false },
    icons: {
      icon: [{ url: "/favicon.ico" }],
    },
    alternates: {
      canonical: `/${locale}`,
      languages,
    },
    openGraph: {
      type: "website",
      siteName: "BillForge",
      title: meta.title,
      description: meta.description,
      url: `${SITE_URL}/${locale}`,
      locale: locale === "hi" ? "hi_IN" : "en_IN",
      images: [{ url: "/og.png", width: 1200, height: 630, alt: "BillForge" }],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: ["/og.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/Toast";
import { SessionProvider } from "@/components/providers/session-provider";

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(routing.locales as readonly string[]).includes(locale)) notFound();
  // Enables static rendering for this locale segment.
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <SessionProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </SessionProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
