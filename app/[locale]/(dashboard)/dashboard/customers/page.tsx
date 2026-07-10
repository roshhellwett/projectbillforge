import { getCustomers } from "@/lib/actions/customers";
import CustomersPageClient from "./CustomersPageClient";

const PAGE_SIZE = 50;

export default async function CustomersPage() {
  const result = await getCustomers(PAGE_SIZE, 0);
  if (!result.success) return <CustomersPageClient />;

  return (
    <CustomersPageClient
      initialData={{
        customers: result.customers,
        totalCustomers: result.total ?? 0,
      }}
    />
  );
}
