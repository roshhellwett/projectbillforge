import { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const BASE_URL = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    "https://billforge.vercel.app"
).replace(/\/$/, "");

// Public marketing/auth routes only — dashboard is behind auth and MUST NOT be indexed.
const PUBLIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "", priority: 1.0, changeFrequency: "monthly" },
    { path: "/login", priority: 0.5, changeFrequency: "yearly" },
    { path: "/register", priority: 0.6, changeFrequency: "yearly" },
    { path: "/forgot-password", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
    const entries: MetadataRoute.Sitemap = [];

    for (const route of PUBLIC_ROUTES) {
        // Emit one entry per locale, with hreflang alternates pointing to
        // every locale variant so Google understands they are translations
        // of the same page.
        for (const locale of routing.locales) {
            const url = `${BASE_URL}/${locale}${route.path}`;
            const languages: Record<string, string> = {};
            for (const alt of routing.locales) {
                languages[alt] = `${BASE_URL}/${alt}${route.path}`;
            }
            languages["x-default"] = `${BASE_URL}/${routing.defaultLocale}${route.path}`;

            entries.push({
                url,
                changeFrequency: route.changeFrequency,
                priority: route.priority,
                alternates: { languages },
            });
        }
    }

    return entries;
}
