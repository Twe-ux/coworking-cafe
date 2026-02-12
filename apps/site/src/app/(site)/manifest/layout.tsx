import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notre Manifeste | CoworKing Café Strasbourg",
  description:
    "Découvrez les valeurs et la philosophie de CoworKing Café by Anticafé Strasbourg. Le café motive, l'humain relie, vous faites le reste. Espace de coworking convivial et inspirant.",
  keywords: [
    "manifeste coworking strasbourg",
    "valeurs anticafé",
    "philosophie coworking",
    "espace collaboratif strasbourg",
    "coworking humain",
    "café coworking alsace",
  ],
  openGraph: {
    title: "Notre Manifeste | CoworKing Café Strasbourg",
    description:
      "Le café motive, l'humain relie, vous faites le reste. Découvrez notre philosophie du coworking à Strasbourg.",
    url: "https://coworkingcafe.fr/manifest",
    siteName: "CoworKing Café Strasbourg",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/images/og-image.webp",
        width: 1200,
        height: 630,
        alt: "CoworKing Café - Notre Manifeste",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Notre Manifeste | CoworKing Café Strasbourg",
    description:
      "Le café motive, l'humain relie, vous faites le reste. Découvrez notre philosophie du coworking.",
    images: ["/images/og-image.webp"],
  },
  alternates: {
    canonical: "https://coworkingcafe.fr/manifest",
  },
};

export default function ManifestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
