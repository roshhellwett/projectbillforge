import { getProducts } from "@/lib/actions/products";
import { getBusinessProfile } from "@/lib/actions/business";
import ProductsPageClient from "./ProductsPageClient";
import type { IndustryType } from "./hooks/useProducts";

const PAGE_SIZE = 50;

export default async function ProductsPage() {
  const [productsResult, businessResult] = await Promise.all([
    getProducts(PAGE_SIZE, 0), getBusinessProfile(),
  ]);

  if (!productsResult.success) return <ProductsPageClient />;

  const industryType = (businessResult.success && businessResult.business
    ? businessResult.business.industryType : "custom") as IndustryType;

  return (
    <ProductsPageClient
      initialData={{
        products: productsResult.products,
        totalProducts: productsResult.total ?? 0,
        industryType,
      }}
    />
  );
}
