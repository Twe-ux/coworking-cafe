import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions Légales | CoworKing Café Strasbourg",
  description:
    "Mentions légales de CoworKing Café by Anticafé (ILY SARL). Éditeur, hébergement, directeur de publication, propriété intellectuelle et informations légales complètes.",
  keywords: [
    "mentions légales strasbourg",
    "informations légales coworking",
    "éditeur site coworking",
    "ily sarl strasbourg",
    "anticafé mentions légales",
    "rgpd coworking",
  ],
  openGraph: {
    title: "Mentions Légales | CoworKing Café Strasbourg",
    description:
      "Mentions légales et informations éditoriales de CoworKing Café by Anticafé (ILY SARL), Strasbourg.",
    url: "https://coworkingcafe.fr/mentions-legales",
    siteName: "CoworKing Café Strasbourg",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/images/og-image.webp",
        width: 1200,
        height: 630,
        alt: "CoworKing Café - Mentions Légales",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mentions Légales | CoworKing Café",
    description: "Informations légales et éditoriales - ILY SARL Strasbourg",
    images: ["/images/og-image.webp"],
  },
  alternates: {
    canonical: "https://coworkingcafe.fr/mentions-legales",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function MentionsLegalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
