import { revalidatePath, revalidateTag as _revalidateTag } from "next/cache";
import { routing } from "@/i18n/routing";




const revalidateTag = _revalidateTag as (tag: string) => void;

function normalizePath(path: string): string {
  if (!path.startsWith("/")) return `/${path}`;
  return path;
}

export function revalidateLocalizedPath(path: string, type: "page" | "layout" = "page") {
  const normalized = normalizePath(path);
  revalidatePath(normalized, type);
  for (const locale of routing.locales) {
    revalidatePath(`/${locale}${normalized}`, type);
  }
}

export function revalidateLocalizedPaths(paths: string[], type: "page" | "layout" = "page") {
  for (const path of paths) {
    revalidateLocalizedPath(path, type);
  }
}

export function revalidateDashboardCache(businessId: string) {
  revalidateTag('dashboard_sales');
  revalidateTag('dashboard_recent');
  revalidateTag(`business_sales_${businessId}`);
  revalidateTag(`business_invoices_${businessId}`);
  revalidateTag(`business_weekly_sales_${businessId}`);
}
