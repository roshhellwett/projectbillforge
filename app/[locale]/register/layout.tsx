import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Sign up for BillForge — free GST billing, khata (udhaar) management, and inventory for Indian shops, wholesalers, and pharmacies.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Create your BillForge account",
    description: "Start billing in minutes — GST invoicing and khata for Indian businesses.",
    type: "website",
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
