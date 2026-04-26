import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://coworkingcafe.fr";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      priority: 1,
      changeFrequency: "weekly",
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/espaces`,
      priority: 0.9,
      changeFrequency: "weekly",
      lastModified: new Date("2026-04-22"),
    },
    {
      url: `${BASE_URL}/tarifs`,
      priority: 0.9,
      changeFrequency: "weekly",
      lastModified: new Date("2026-04-22"),
    },
    {
      url: `${BASE_URL}/concept`,
      priority: 0.8,
      changeFrequency: "monthly",
      lastModified: new Date("2026-04-22"),
    },
    {
      url: `${BASE_URL}/menu`,
      priority: 0.7,
      changeFrequency: "monthly",
      lastModified: new Date("2026-04-22"),
    },
    {
      url: `${BASE_URL}/evenements`,
      priority: 0.8,
      changeFrequency: "daily",
      lastModified: new Date(),
    },
  ];
}
