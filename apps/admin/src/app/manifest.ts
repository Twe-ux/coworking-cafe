import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "CoworKing Café",
    short_name: "CoworKing Café",
    description: "Dashboard administrateur du Coworking Café",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
    // Activer le Badge API pour les notifications PWA
    categories: ["business", "productivity"],
    // Définir les shortcuts (optionnel)
    shortcuts: [
      {
        name: "Messages Contact",
        short_name: "Contact",
        description: "Voir les messages de contact",
        url: "/admin/messages/contact",
        icons: [{ src: "/web-app-manifest-192x192.png", sizes: "192x192" }],
      },
    ],
  };
}
