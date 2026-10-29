import type { MetadataRoute } from "next";
import { GAME_MODES } from "@/lib/modes";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    ...GAME_MODES.map((mode) => ({
      url: `${SITE_URL}${mode.path}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.95,
    })),
    {
      url: `${SITE_URL}/como-jogar`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/sobre`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
