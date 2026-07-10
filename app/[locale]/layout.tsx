import type { Metadata, Viewport } from "next";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: {
    default: "BillForge - Indian Billing Platform",
    template: "%s | BillForge",
  },
  description: "Professional GST billing, invoicing, and Khata management for Indian businesses. Open source by Zenith.",
  keywords: ["billing", "invoice", "GST", "khata", "Indian business", "open source", "accounting"],
  authors: [{ name: "roshhellwett", url: "https://github.com/roshhellwett" }],
  icons: {
    icon: "/favicon.ico",
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://billforge.vercel.app"),
  openGraph: {
    title: "BillForge - Indian Billing Platform",
    description: "Professional GST billing, invoicing, and Khata management for Indian businesses.",
    type: "website",
    siteName: "BillForge",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
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
