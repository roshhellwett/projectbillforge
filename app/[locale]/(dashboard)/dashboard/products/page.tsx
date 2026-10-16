import { getProducts } from "@/lib/actions/products";
import { getBusinessProfile } from "@/lib/actions/business";
import ProductsPageClient from "./ProductsPageClient";
import type { IndustryType } from "./hooks/useProducts";
import { getTranslations } from "next-intl/server";

const PAGE_SIZE = 50;

export default async function ProductsPage() {
  const t = await getTranslations("Products");
  const [productsResult, businessResult] = await Promise.all([
    getProducts(PAGE_SIZE, 0), getBusinessProfile(),
  ]);

  if (!productsResult.success) {
    return <ProductsPageClient initialError={t("loadErrorMessage")} />;
  }

  const industryType = (businessResult.success && businessResult.business
    ? businessResult.business.industryType : "custom") as IndustryType;

  return (
    <ProductsPageClient
      initialData={{
        products: productsResult.products,
        totalProducts: productsResult.total ?? 0,
        totalLowStock: productsResult.totalLowStock ?? 0,
        industryType,
      }}
    />
  );
}
