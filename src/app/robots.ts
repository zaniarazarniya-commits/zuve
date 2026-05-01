import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/guest/",
    },
    sitemap: "https://gast.grandhotellysekil.se/sitemap.xml",
  };
}
