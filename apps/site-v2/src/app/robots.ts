import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://coworkingcafe.fr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/booking/checkout"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
