import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth/",
          "/_next/",
          "/admin/",
          "/*/profile",
          "/*/reservations",
          "/*/settings",
          "/booking/details",
          "/booking/summary",
        ],
      },
    ],
    sitemap: "https://coworkingcafe.fr/sitemap.xml",
  };
}
