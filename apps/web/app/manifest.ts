import type { MetadataRoute } from "next";
import en from "@/lib/i18n/dictionaries/en";
import { SITE_NAME } from "@/lib/site";

/**
 * Manifeste du site (/manifest.webmanifest) : nom, couleurs et icônes quand le site est
 * ajouté à l'écran d'accueil d'un téléphone. Icônes générées depuis le logo (public/icons).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: en.meta.title,
    short_name: SITE_NAME,
    description: en.meta.description,
    start_url: "/",
    display: "browser",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
