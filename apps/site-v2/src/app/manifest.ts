import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CoworKing Cafe",
    short_name: "CoworKing",
    description: "Coworking + Cafe a Strasbourg",
    start_url: "/dashboard",
    scope: "/dashboard",
    display: "standalone",
    background_color: "#FAF6EE",
    theme_color: "#1A1A1A",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
