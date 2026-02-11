import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Code Promo Exclusif | CoworKing Café Strasbourg",
  description:
    "Découvrez votre code promo exclusif pour CoworKing Café Strasbourg. Réductions et offres spéciales sur les réservations d'espaces de coworking et salles de réunion.",
  keywords: [
    "code promo coworking strasbourg",
    "réduction anticafé",
    "offre spéciale coworking",
    "promotion coworking strasbourg",
    "bon plan espace travail",
    "promo anticafé strasbourg",
  ],
  openGraph: {
    title: "🎁 Code Promo Exclusif | CoworKing Café Strasbourg",
    description:
      "Découvrez votre code promo exclusif pour CoworKing Café Strasbourg. Réductions sur vos réservations !",
    url: "https://coworkingcafe.fr/scan",
    siteName: "CoworKing Café Strasbourg",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "🎁 Code Promo Exclusif | CoworKing Café",
    description: "Découvrez votre code promo exclusif pour vos réservations !",
  },
  alternates: {
    canonical: "https://coworkingcafe.fr/scan",
  },
  robots: {
    index: false, // Ne pas indexer car c'est une page de landing promo temporaire
    follow: true,
  },
};

export default function ScanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
