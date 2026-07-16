import { revalidatePath, revalidateTag as _revalidateTag } from "next/cache";
import { routing } from "@/i18n/routing";

const revalidateTag = _revalidateTag as (tag: string) => void;

function normalizePath(path: string): string {
  if (!path.startsWith("/")) return `/${path}`;
  return path;
}

export function revalidateLocalizedPath(path: string, type: "page" | "layout" = "page") {
  try {
    const normalized = normalizePath(path);
    for (const locale of routing.locales) {
      revalidatePath(`/${locale}${normalized}`, type);
    }
  } catch {
    /* noop outside Next.js runtime */
  }
}

export function revalidateLocalizedPaths(paths: string[], type: "page" | "layout" = "page") {
  try {
    for (const path of paths) {
      revalidateLocalizedPath(path, type);
    }
  } catch {
    /* noop outside Next.js runtime */
  }
}

export function revalidateDashboardCache(businessId: string) {
  try {
    revalidateTag(`dashboard_${businessId}`);
  } catch {
    /* noop outside Next.js runtime */
  }
}
