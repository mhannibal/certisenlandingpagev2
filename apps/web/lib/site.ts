import type { Locale } from "@/lib/i18n/config";

/**
 * Adresse publique du site : sert au sitemap, aux liens canoniques, à Open Graph et à
 * llms.txt. Sur Vercel, certisen.com redirige vers www.certisen.com (constaté le 10/11/2026) :
 * les liens canoniques doivent donc pointer sur www, l'adresse finale. Pour un autre
 * domaine, définir NEXT_PUBLIC_SITE_URL au moment du build.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.certisen.com").replace(/\/+$/, "");
export const SITE_NAME = "CertiSen";
export const CONTACT_EMAIL = "certisen@inria.fr";
export const LINKEDIN_URL = "https://www.linkedin.com/company/certisen";
/** Adresse postale complète (copiée telle quelle, quelle que soit la langue du site). */
export const POSTAL_ADDRESS = "Inria Grenoble, 655 avenue de l'Europe, 38330 Montbonnot-Saint-Martin, France";
/** Adresse sur Google Maps (format officiel « Maps URLs » : recherche par adresse). */
export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(POSTAL_ADDRESS)}`;

/** Codes de langue Open Graph. */
export const OG_LOCALE: Record<Locale, string> = { en: "en_US", fr: "fr_FR", zh: "zh_CN" };
