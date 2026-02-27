import { revalidatePath } from "next/cache";
import { routing } from "@/i18n/routing";

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
