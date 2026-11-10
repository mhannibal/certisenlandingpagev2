import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Tout le site est ouvert aux robots ; le plan du site est indiqué. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
