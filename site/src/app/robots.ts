import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Tout est indexable, y compris les fichiers pour agents : c'est leur raison d'être. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
