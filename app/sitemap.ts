import type { MetadataRoute } from "next";
import { PERSONAS } from "@/lib/personas";

const SITE = process.env.SITE_URL ?? "https://testai.taki.vn";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE, changeFrequency: "weekly", priority: 1 },
    ...Object.keys(PERSONAS).map((p) => ({
      url: `${SITE}/${p}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
