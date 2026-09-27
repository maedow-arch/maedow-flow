import type { MetadataRoute } from "next";
import { source } from "@/lib/source";
import { SITE_URL } from "@/lib/site";

/** Le plan du site, dérivé des pages réelles plutôt qu'écrit à la main. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    ...source.getPages().map((page) => ({
      url: `${SITE_URL}${page.url}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
