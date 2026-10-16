import { getCustomers } from "@/lib/actions/customers";
import CustomersPageClient from "./CustomersPageClient";
import { getTranslations } from "next-intl/server";

const PAGE_SIZE = 50;

export default async function CustomersPage() {
  const t = await getTranslations("Customers");
  const result = await getCustomers(PAGE_SIZE, 0);
  if (!result.success) {
    return <CustomersPageClient initialError={t("loadErrorMessage")} />;
  }

  return (
    <CustomersPageClient
      initialData={{
        customers: result.customers,
        totalCustomers: result.total ?? 0,
        totalDue: result.totalDue ?? 0,
      }}
    />
  );
}
