import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu - Boissons & Restauration | CoworKing Café Strasbourg",
  description:
    "+40 boissons illimitées (café, thé, chocolat, sodas), snacks et petite restauration. Menu complet pour travailler toute la journée au CoworKing Café Strasbourg.",
  keywords: [
    "menu coworking strasbourg",
    "boissons illimitées strasbourg",
    "café coworking strasbourg",
    "restauration coworking",
    "snacks coworking cafe",
    "boissons gratuites coworking",
    "petit dejeuner coworking strasbourg",
  ],
  openGraph: {
    title: "Menu - Boissons & Restauration | CoworKing Café Strasbourg",
    description:
      "+40 boissons illimitées et petite restauration. Découvrez notre menu complet.",
    url: "https://coworkingcafe.fr/menu",
    siteName: "CoworKing Café Strasbourg",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/images/og-image.webp",
        width: 1200,
        height: 630,
        alt: "CoworKing Café Strasbourg - Menu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Menu CoworKing Café Strasbourg",
    description: "+40 boissons illimitées et petite restauration.",
    images: ["/images/og-image.webp"],
  },
  alternates: {
    canonical: "https://coworkingcafe.fr/menu",
  },
};

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
