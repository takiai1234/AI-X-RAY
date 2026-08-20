import type { MetadataRoute } from "next";

const SITE = process.env.SITE_URL ?? "https://testai.taki.vn";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
