import type { Locale } from "@/lib/i18n/config";

/**
 * Adresse publique du site : sert au sitemap, aux liens canoniques, à Open Graph et à
 * llms.txt. Par défaut certisen.com ; pour un autre domaine, définir NEXT_PUBLIC_SITE_URL
 * (ex. NEXT_PUBLIC_SITE_URL=https://www.certisen.com) au moment du build.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://certisen.com").replace(/\/+$/, "");
export const SITE_NAME = "CertiSen";
export const CONTACT_EMAIL = "certisen@inria.fr";
export const LINKEDIN_URL = "https://www.linkedin.com/company/certisen";

/** Codes de langue Open Graph. */
export const OG_LOCALE: Record<Locale, string> = { en: "en_US", fr: "fr_FR", zh: "zh_CN" };
