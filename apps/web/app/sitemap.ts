import type { MetadataRoute } from "next";
import { DEFAULT_LOCALE, LOCALES, LOCALE_META } from "@/lib/i18n/config";
import { SITE_URL } from "@/lib/site";

/** Plan du site : une page par langue, chacune reliée à ses traductions (hreflang). */
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = {
    ...Object.fromEntries(LOCALES.map((l) => [LOCALE_META[l].htmlLang, `${SITE_URL}/${l}`])),
    "x-default": `${SITE_URL}/${DEFAULT_LOCALE}`,
  };
  return LOCALES.map((l) => ({
    url: `${SITE_URL}/${l}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: l === DEFAULT_LOCALE ? 1 : 0.9,
    alternates: { languages },
  }));
}
