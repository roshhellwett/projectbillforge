import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to BillForge to manage GST invoices, khata (udhaar), inventory, and customers for your Indian business.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Sign in · BillForge",
    description: "Access your BillForge account — GST invoicing and khata for Indian businesses.",
    type: "website",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
