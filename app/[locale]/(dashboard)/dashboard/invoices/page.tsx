import { getProducts } from "@/lib/actions/products";
import { getCustomers } from "@/lib/actions/customers";
import { getInvoices } from "@/lib/actions/invoices";
import { getBusinessProfile } from "@/lib/actions/business";
import InvoicesPageClient from "./InvoicesPageClient";
import type { Invoice } from "./hooks/useInvoices";

const PAGE_SIZE = 50;

export default async function InvoicesPage() {
  const [productsResult, customersResult, invoicesResult, businessResult] = await Promise.all([
    getProducts(), getCustomers(), getInvoices(PAGE_SIZE, 0), getBusinessProfile(),
  ]);

  if (!productsResult.success || !customersResult.success || !invoicesResult.success || !businessResult.success) {
    return <InvoicesPageClient />;
  }

  const businessProfile = {
    name: businessResult.business?.name || "",
    gstin: businessResult.business?.gstin || null,
    address: businessResult.business?.address || null,
    phone: businessResult.business?.phone || null,
    state: businessResult.business?.state || "",
    pincode: businessResult.business?.pincode || null,
    termsAndConditions: businessResult.business?.termsAndConditions || null,
  };

  return (
    <InvoicesPageClient
      initialData={{
        products: productsResult.products,
        customers: customersResult.customers,
        invoices: invoicesResult.invoices.map((inv: { id: string; invoiceNumber: string; customerId: string | null; customerName: string; invoiceDate: string; total: number | null; status: string | null; paymentMode: string | null; paymentStatus: string | null; amountPaid: number | null; items: unknown; customerGstin: string | null; customerAddress: string | null }) => ({ ...inv, invoiceDate: new Date(inv.invoiceDate) })) as Invoice[],
        businessProfile,
        totalInvoices: invoicesResult.total ?? 0,
      }}
    />
  );
}
