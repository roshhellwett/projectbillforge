import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BillForge - Indian Billing Platform",
  description: "Professional billing, invoicing, and Khata management for Indian businesses",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/lib/components/Toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="antialiased font-[var(--font-inter)]">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
