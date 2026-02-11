import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité RGPD | CoworKing Café Strasbourg",
  description:
    "Politique de confidentialité et protection des données personnelles conforme RGPD de CoworKing Café Strasbourg. Transparence totale sur la collecte et le traitement de vos données.",
  keywords: [
    "politique confidentialité strasbourg",
    "rgpd coworking",
    "protection données personnelles",
    "confidentialité anticafé",
    "données rgpd strasbourg",
    "vie privée coworking",
  ],
  openGraph: {
    title: "Politique de Confidentialité RGPD | CoworKing Café",
    description:
      "Politique de confidentialité conforme RGPD. Protection totale de vos données personnelles chez CoworKing Café Strasbourg.",
    url: "https://coworkingcafe.fr/confidentiality",
    siteName: "CoworKing Café Strasbourg",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "CoworKing Café - Politique de Confidentialité",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Politique de Confidentialité RGPD | CoworKing Café",
    description: "Protection totale de vos données personnelles - Conforme RGPD",
    images: ["/images/og-image.png"],
  },
  alternates: {
    canonical: "https://coworkingcafe.fr/confidentiality",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ConfidentialityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
