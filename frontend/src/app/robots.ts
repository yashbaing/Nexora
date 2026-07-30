import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // The trading app is a gated, wallet-authenticated surface — nothing to index.
        disallow: ["/app", "/api/"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
